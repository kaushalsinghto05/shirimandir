import React, { useState } from 'react';
import { ShieldCheck, Handshake, Info, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

/**
 * COMPLIANCE BADGE: Temple Legal Affiliation Tier
 * 
 * Rules:
 * - 'official': Direct legal trust affiliation (MOU / gazette on file)
 * - 'partnered': Registered Archaka Samiti partner (agreement on file)
 * - 'independent': Independent facilitation without claiming official affiliation
 */
export default function VerificationBadge({ 
  status = 'independent', 
  proofDocUrl = null, 
  trustRegNo = null,
  showDetailModal = true,
  className = '' 
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const getBadgeConfig = () => {
    switch (status) {
      case 'official':
        return {
          label: 'Official Temple Trust',
          shortLabel: 'Official Trust',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          description: 'Verified official trust partnership with legal MOU and statutory board credentials on record.'
        };
      case 'partnered':
        return {
          label: 'Partnered Archaka Samiti',
          shortLabel: 'Partnered',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-900',
          dot: 'bg-amber-500',
          icon: Handshake,
          description: 'Official seva arrangement verified through accredited traditional hereditary priest samitis.'
        };
      case 'independent':
      default:
        return {
          label: 'Independent Devotee Seva',
          shortLabel: 'Independent',
          bg: 'bg-charcoal-700/10 border-charcoal-700/20 text-charcoal-700',
          dot: 'bg-charcoal-400',
          icon: Info,
          description: 'Devotee-facilitated seva. Shiri Mandir does not imply or claim direct administrative affiliation with this sanctum.'
        };
    }
  };

  const badge = getBadgeConfig();
  const Icon = badge.icon;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (showDetailModal) setModalOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-102 ${badge.bg} ${className}`}
        title="Click to view legal affiliation verification status"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-sans font-semibold tracking-wide">{badge.shortLabel}</span>
      </button>

      {/* Compliance Verification Proof Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setModalOpen(false); }}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-ivory-300 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${badge.bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-charcoal-900 text-lg">Legal Affiliation Disclosure</h3>
                  <p className="text-xs text-charcoal-500 font-sans">Statutory Transparency Audit</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-ivory-100 hover:bg-ivory-200 flex items-center justify-center text-charcoal-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-5 space-y-4 font-sans text-sm text-charcoal-700">
              <div className="p-3.5 rounded-2xl bg-ivory-100 border border-ivory-200">
                <span className="text-xs uppercase font-bold tracking-wider text-charcoal-500 block mb-1">Status Tier</span>
                <p className="font-semibold text-charcoal-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {badge.label}
                </p>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{badge.description}</p>
              </div>

              {trustRegNo && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-xs text-charcoal-500 font-medium">Trust Registration No:</span>
                  <span className="font-mono text-xs font-bold text-copper-700 bg-white px-2.5 py-1 rounded-md border border-ivory-300">
                    {trustRegNo}
                  </span>
                </div>
              )}

              {proofDocUrl ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-950 text-xs">Affiliation Document Verified</p>
                      <p className="text-[11px] text-emerald-700">Signed legal agreement on file with platform</p>
                    </div>
                  </div>
                  <a
                    href={proofDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    View Doc <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : status === 'independent' ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-950 text-xs">Statutory Non-Affiliation Guarantee</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      In compliance with consumer transparency regulations, we make no claims of official administrative authority for this sanctum. Sevas are executed faithfully by verified local archakas.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-sm transition-colors"
            >
              Close Disclosure
            </button>
          </div>
        </div>
      )}
    </>
  );
}
