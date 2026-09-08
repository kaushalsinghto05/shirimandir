import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Truck, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  X,
  Clock,
  Package,
  Share2
} from 'lucide-react';

export default function BookingConfirmationModal({ 
  confirmationData, 
  onClose, 
  onOpenReceipt, 
  onGoToDashboard 
}) {
  const prasadSteps = [
    { label: "Sankalpa Registered & Scheduled", desc: "Officiated by Vedic Priests", done: true, time: "Just now" },
    { label: "Holy Chanting & Gotra Recitation", desc: "Live video stream recorded", done: true, time: "Assigned" },
    { label: "Prasad Consecrated at Sanctum", desc: "Energized with Chandan & Bhasma", done: false, time: "Expected Soon" },
    { label: "Sealed in Tamper-Proof Pouch", desc: "India Post Speed Sacred Post", done: false, time: "Within 24 hrs" },
    { label: "Delivered to Devotee Doorstep", desc: "Safe home delivery with Gangajal", done: false, time: "In 3-4 days" }
  ];

  const booking = confirmationData?.bookingData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/40 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Divine Blessing Header */}
        <div className="bg-gradient-to-r from-sanctum-950 via-sanctum-900 to-sanctum-950 text-white p-6 sm:p-8 text-center relative border-b border-gold-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-sanctum-950/80 border border-white/20 text-white hover:bg-sanctum-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing Divine Emblem */}
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-gold-400 via-gold-500 to-terracotta-600 p-0.5 shadow-gold-glow mb-4">
            <div className="w-full h-full bg-sanctum-950 rounded-[22px] flex items-center justify-center">
              <span className="text-gold-400 font-serif font-bold text-3xl">ॐ</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tulsi-500/20 text-tulsi-300 border border-tulsi-500/40 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-tulsi-400" />
            <span>Sankalpa Confirmed & Consecrated</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sandstone-50">
            May the Divine Blessings Be With You
          </h2>
          <p className="text-xs sm:text-sm text-sandstone-300 mt-1">
            Booking Reference ID: <strong className="font-mono text-gold-300">{confirmationData?.id || 'MV-2026-8942'}</strong>
          </p>
        </div>

        {/* Scrollable Summary & Prasad Tracker */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Seva & Officiation Card */}
          <div className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
                  {booking?.service?.templeName || 'Shri Kashi Vishwanath Sanctum'}
                </span>
                <h4 className="text-lg font-serif font-bold text-sanctum-950 mt-0.5">
                  {booking?.service?.title || 'Vedic Sankalpa Seva'}
                </h4>
              </div>
              <span className="text-base font-serif font-bold text-sanctum-950 bg-white px-3 py-1 rounded-xl border border-sandstone-200">
                ₹{(confirmationData?.amount || 1501).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-sandstone-700 pt-2 border-t border-sandstone-200">
              <div>
                <span className="text-sandstone-400 block">Officiating Date:</span>
                <strong className="text-sanctum-950">{booking?.selectedDate || '14 Sept 2026 (Ekadashi)'}</strong>
              </div>
              <div>
                <span className="text-sandstone-400 block">Participants & Gotra:</span>
                <strong className="text-sanctum-950">{booking?.devotees?.[0] || 'Kaushal Singh (Kashyap)'}</strong>
              </div>
            </div>

            <div className="bg-tulsi-50 p-2.5 rounded-xl border border-tulsi-200 flex items-center gap-2 text-xs text-tulsi-800">
              <Sparkles className="w-4 h-4 text-tulsi-600 shrink-0" />
              <span>
                Personalized live video stream link and WhatsApp updates will be sent 2 hours before the ritual.
              </span>
            </div>
          </div>

          {/* DIGITAL PRASAD DELIVERY TRACKING TIMELINE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-600" />
                <h4 className="font-serif font-bold text-base text-sanctum-950">
                  Digital Prasad Delivery Tracker
                </h4>
              </div>
              <span className="text-[11px] font-bold text-sandstone-500 font-mono">
                Tracking: INDPOST-77382910IN
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="bg-sandstone-50 p-4 rounded-2xl border border-sandstone-200 space-y-3">
              {prasadSteps.map((st, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      st.done 
                        ? 'bg-tulsi-600 text-white shadow-sm' 
                        : 'bg-sandstone-200 text-sandstone-600'
                    }`}>
                      {st.done ? '✓' : idx + 1}
                    </div>
                    {idx < prasadSteps.length - 1 && (
                      <div className={`w-0.5 h-6 ${st.done ? 'bg-tulsi-500' : 'bg-sandstone-200'}`}></div>
                    )}
                  </div>

                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${st.done ? 'text-sanctum-950' : 'text-sandstone-500'}`}>
                        {st.label}
                      </h5>
                      <span className="text-[10px] text-sandstone-400 font-medium">{st.time}</span>
                    </div>
                    <p className="text-[11px] text-sandstone-500">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-sandstone-100 p-5 sm:px-8 border-t border-sandstone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onOpenReceipt({
              taxReceiptNo: confirmationData?.taxReceiptNo || 'MV-80G-2026-8942',
              timestamp: confirmationData?.timestamp || '08 September 2026',
              donorName: booking?.devotees?.[0]?.split(' ')[0] || 'Kaushal Singh',
              gotra: 'Kashyap Gotra',
              templeName: booking?.service?.templeName || 'Shri Kashi Vishwanath Sanctum',
              serviceTitle: booking?.service?.title || 'Maha Rudrabhishek Seva',
              amount: confirmationData?.amount || 1501
            })}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white border border-sandstone-300 hover:border-gold-500 text-sanctum-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-gold-600" />
            <span>View & Print 80G Tax Receipt</span>
          </button>

          <button
            onClick={onGoToDashboard}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-sanctum-950 hover:bg-sanctum-900 text-gold-300 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Go to Devotee Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
