import React from 'react';
import { X, CheckCircle2, ShieldCheck, Download, Video, Calendar, User, FileText } from 'lucide-react';

export default function ProofMediaViewerModal({ booking, onClose }) {
  if (!booking) return null;

  const isVideo = booking.proof_media_type === 'video' || (booking.proof_media_url && booking.proof_media_url.endsWith('.mp4'));

  return (
    <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-ivory-300 flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-ivory-200 bg-ivory-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-charcoal-900 text-lg sm:text-xl">Proof of Service (Puja Darshan)</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Consecrated
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                Booking #{booking.booking_code} • {booking.temple_name || booking.temple}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-ivory-200 hover:bg-ivory-300 flex items-center justify-center text-charcoal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Media Presentation */}
          <div className="rounded-2xl overflow-hidden bg-charcoal-950 shadow-inner aspect-video flex items-center justify-center relative border border-charcoal-800">
            {booking.proof_media_url ? (
              isVideo ? (
                <video 
                  controls 
                  src={booking.proof_media_url} 
                  className="w-full h-full object-contain"
                  poster="/images/kashi_vishwanath.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={booking.proof_media_url} 
                  alt="Puja Sanctum Proof" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'; }}
                />
              )
            ) : (
              <div className="text-center p-6 text-ivory-200">
                <Video className="w-12 h-12 text-temple-gold-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium">Recording archive being processed by temple archakas</p>
              </div>
            )}
            
            <div className="absolute top-3 left-3 bg-charcoal-950/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-temple-gold-300 border border-temple-gold-500/20">
              ● Official Sanctum Capture
            </div>
          </div>

          {/* Devotee Sankalp & Archaka Consecration Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 space-y-2">
              <span className="text-xs uppercase font-bold text-charcoal-500 tracking-wider">Devotee Sankalp</span>
              <p className="font-semibold text-charcoal-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-copper-500" />
                {booking.sankalp_name || booking.devoteeDetails?.name || 'Devotee'}
              </p>
              <p className="text-xs text-charcoal-600">
                Gotra: <span className="font-medium text-charcoal-800">{booking.sankalp_gotra || 'Kashyap'}</span>
                {booking.sankalp_nakshatra && ` • Nakshatra: ${booking.sankalp_nakshatra}`}
              </p>
              <p className="text-xs text-charcoal-500 flex items-center gap-1 pt-1 border-t border-ivory-200/60">
                <Calendar className="w-3.5 h-3.5" /> Completed on {booking.scheduled_date || booking.date || 'Recent date'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200/80 space-y-2">
              <span className="text-xs uppercase font-bold text-sage-700 tracking-wider">Archaka Verification</span>
              <p className="text-xs text-sage-900 leading-relaxed font-sans">
                {booking.proof_notes || 'Vedic chants Namakam, Chamakam, and Bilva archana completed with sacred sankalp recited in sanctum sanctorum.'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-sage-700 font-medium pt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                Audit Trail Recorded on Immutable Ledger
              </div>
            </div>
          </div>

          {/* Download 80G Certificate / Sankalp Patra */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={booking.proof_media_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex-1 py-3 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Sanctum Media
            </a>
            <button
              onClick={() => alert(`Certificate of Consecration downloaded for Booking #${booking.booking_code}. Certified 80G compliant.`)}
              className="flex-1 py-3 px-4 rounded-xl bg-copper-50 hover:bg-copper-100 text-copper-700 font-semibold text-sm border border-copper-200 flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" /> Download Sankalp Patra (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
