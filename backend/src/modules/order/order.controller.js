import { orderService } from './order.service.js';

export async function calculateCheckout(req, res, next) {
  try {
    const { items = [] } = req.body;
    const result = await orderService.calculateCheckout(items);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        availableStock: err.availableStock
      });
    }
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const result = await orderService.createOrder(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Prasad order initiated with transparent breakdown. Real inventory reserved.',
      data: {
        ...result.order,
        items: result.items,
        itemized_breakdown: result.itemized_breakdown
      }
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        availableStock: err.availableStock
      });
    }
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getDevoteeOrders(req.user.id);
    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.json({
      success: true,
      data: order
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}
