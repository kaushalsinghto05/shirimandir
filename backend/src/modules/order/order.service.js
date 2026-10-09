import crypto from 'node:crypto';
import { query } from '../../database/db.js';
import { eventBus, DomainEvents } from '../../core/events/eventBus.js';

export class OrderService {
  /**
   * Transparent Pre-Checkout Price Breakdown
   * Guarantees itemized math with zero hidden fees.
   */
  async calculateCheckout(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      throw { status: 400, message: 'At least one item is required in cart' };
    }

    let baseAmountPaise = 0;
    const itemizedLines = [];

    for (const item of items) {
      const { rows } = await query(
        'SELECT * FROM prasad_items WHERE id = $1 AND is_active = 1',
        [item.prasad_item_id]
      );

      if (rows.length === 0) {
        throw {
          status: 404,
          message: `Item #${item.prasad_item_id} is currently unavailable or awaiting FSSAI food certification.`
        };
      }

      const prasad = rows[0];
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (prasad.stock_qty < qty) {
        throw {
          status: 409,
          message: `Insufficient stock for "${prasad.name}". Available units: ${prasad.stock_qty}. Requested: ${qty}. (No artificial stock manipulation).`,
          availableStock: prasad.stock_qty
        };
      }

      const lineTotalPaise = prasad.price_paise * qty;
      baseAmountPaise += lineTotalPaise;

      itemizedLines.push({
        prasad_item_id: prasad.id,
        name: prasad.name,
        unit_price_paise: prasad.price_paise,
        unit_price_inr: prasad.price_paise / 100,
        quantity: qty,
        subtotal_paise: lineTotalPaise,
        subtotal_inr: lineTotalPaise / 100,
        fssai_license_no: prasad.fssai_license_no
      });
    }

    const shippingFeePaise = baseAmountPaise >= 50000 ? 0 : 5000;
    const platformFeePaise = 2000;
    const taxPaise = 0;
    const totalAmountPaise = baseAmountPaise + shippingFeePaise + platformFeePaise + taxPaise;

    return {
      items: itemizedLines,
      summary: {
        base_amount_paise: baseAmountPaise,
        shipping_fee_paise: shippingFeePaise,
        platform_fee_paise: platformFeePaise,
        tax_paise: taxPaise,
        total_amount_paise: totalAmountPaise,

        base_amount_inr: baseAmountPaise / 100,
        shipping_fee_inr: shippingFeePaise / 100,
        platform_fee_inr: platformFeePaise / 100,
        tax_inr: taxPaise / 100,
        total_amount_inr: totalAmountPaise / 100,

        currency: 'INR',
        free_shipping_eligible: baseAmountPaise >= 50000,
        hidden_fees_count: 0
      }
    };
  }

  /**
   * Create order with atomic inventory decrement
   */
  async createOrder(orderPayload, userId) {
    const {
      items = [],
      shipping_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code
    } = orderPayload;

    if (!items.length || !shipping_name || !shipping_phone || !shipping_address_line1 || !shipping_city || !shipping_postal_code) {
      throw {
        status: 400,
        message: 'Complete shipping address and cart items are required'
      };
    }

    let baseAmountPaise = 0;
    const validatedItems = [];

    // Verify stock and decrement atomically
    for (const item of items) {
      const prasadRes = await query(
        'SELECT * FROM prasad_items WHERE id = $1 AND is_active = 1',
        [item.prasad_item_id]
      );

      if (prasadRes.rows.length === 0) {
        throw {
          status: 404,
          message: `Prasad item #${item.prasad_item_id} is no longer available.`
        };
      }

      const prasad = prasadRes.rows[0];
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (prasad.stock_qty < qty) {
        throw {
          status: 409,
          message: `Item "${prasad.name}" currently has only ${prasad.stock_qty} units available.`,
          availableStock: prasad.stock_qty
        };
      }

      // Atomic inventory deduction
      const updateStock = await query(
        'UPDATE prasad_items SET stock_qty = stock_qty - $1 WHERE id = $2 AND stock_qty >= $1',
        [qty, prasad.id]
      );

      if (updateStock.rowCount === 0) {
        throw {
          status: 409,
          message: `Stock contention: "${prasad.name}" was just reserved by another devotee. Please try again.`
        };
      }

      const lineTotal = prasad.price_paise * qty;
      baseAmountPaise += lineTotal;

      validatedItems.push({
        prasad_item_id: prasad.id,
        name: prasad.name,
        unit_price_paise: prasad.price_paise,
        quantity: qty,
        subtotal_paise: lineTotal,
        fssai_license_no: prasad.fssai_license_no
      });
    }

    const shippingFeePaise = baseAmountPaise >= 50000 ? 0 : 5000;
    const platformFeePaise = 2000;
    const taxPaise = 0;
    const totalAmountPaise = baseAmountPaise + shippingFeePaise + platformFeePaise + taxPaise;

    const orderSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderCode = `ORD-SM-${new Date().getFullYear()}-${orderSuffix}`;

    const insertOrder = await query(
      `INSERT INTO orders (
        order_code, user_id,
        base_amount_paise, shipping_fee_paise, platform_fee_paise, tax_paise, total_amount_paise,
        shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_postal_code, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending_payment')
      RETURNING *`,
      [
        orderCode,
        userId,
        baseAmountPaise,
        shippingFeePaise,
        platformFeePaise,
        taxPaise,
        totalAmountPaise,
        shipping_name.trim(),
        shipping_phone.trim(),
        shipping_address_line1.trim(),
        shipping_address_line2 || null,
        shipping_city.trim(),
        shipping_state || 'Delhi',
        shipping_postal_code.trim()
      ]
    );

    const order = insertOrder.rows[0];

    // Insert order line items
    for (const vItem of validatedItems) {
      await query(
        `INSERT INTO order_items (
          order_id, prasad_item_id, item_name, unit_price_paise, quantity, subtotal_paise, fssai_license_no
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          vItem.prasad_item_id,
          vItem.name,
          vItem.unit_price_paise,
          vItem.quantity,
          vItem.subtotal_paise,
          vItem.fssai_license_no
        ]
      );
    }

    eventBus.publish(DomainEvents.ORDER_CREATED, {
      orderId: order.id,
      orderCode,
      userId,
      totalAmountPaise
    });

    return {
      order,
      items: validatedItems,
      itemized_breakdown: {
        base_amount_inr: baseAmountPaise / 100,
        shipping_fee_inr: shippingFeePaise / 100,
        platform_fee_inr: platformFeePaise / 100,
        tax_inr: taxPaise / 100,
        total_amount_inr: totalAmountPaise / 100,
        currency: 'INR'
      }
    };
  }

  /**
   * Get all orders for devotee
   */
  async getDevoteeOrders(userId) {
    const { rows } = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    return await Promise.all(
      rows.map(async (order) => {
        const itemRows = await query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return {
          ...order,
          base_amount_inr: order.base_amount_paise / 100,
          shipping_fee_inr: order.shipping_fee_paise / 100,
          platform_fee_inr: order.platform_fee_paise / 100,
          total_amount_inr: order.total_amount_paise / 100,
          items: itemRows.rows.map(i => ({
            ...i,
            unit_price_inr: i.unit_price_paise / 100,
            subtotal_inr: i.subtotal_paise / 100
          }))
        };
      })
    );
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId, requestingUser) {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (rows.length === 0) return null;

    const order = rows[0];
    if (order.user_id !== requestingUser.id && !['admin', 'temple_partner'].includes(requestingUser.role)) {
      throw { status: 403, message: 'Access denied' };
    }

    const itemRows = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

    return {
      ...order,
      base_amount_inr: order.base_amount_paise / 100,
      shipping_fee_inr: order.shipping_fee_paise / 100,
      platform_fee_inr: order.platform_fee_paise / 100,
      total_amount_inr: order.total_amount_paise / 100,
      items: itemRows.rows
    };
  }

  /**
   * Mark order as paid
   */
  async markOrderPaid(orderId) {
    const now = new Date().toISOString();
    await query(
      'UPDATE orders SET status = \'paid\', updated_at = $1 WHERE id = $2',
      [now, orderId]
    );
    console.log(`[ORDER MODULE] Order #${orderId} marked paid on payment capture.`);
  }
}

export const orderService = new OrderService();
