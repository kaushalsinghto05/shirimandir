import React, { useState } from 'react';
import { Copy, Check, Gift, Share2, MessageCircle, Twitter, Link } from 'lucide-react';
import { REFERRAL_PROGRAM } from '../data/mockData';

export default function ReferralSection() {
  const [copied, setCopied] = useState(false);
  const referrerReward = REFERRAL_PROGRAM?.referrerReward || '500';
  const refereeReward = REFERRAL_PROGRAM?.refereeReward || '250';
  const totalDevoteesJoined = REFERRAL_PROGRAM?.totalDevoteesJoined || 12500;
  
  const displayCode = REFERRAL_PROGRAM?.referralCode || "SHIRI2026";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-copper-50 via-ivory-100 to-temple-gold-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-4xl bg-white/60 glass-warm rounded-3xl p-8 sm:p-12 shadow-warm-lg text-center">
          
          <h2 className="text-3xl md:text-4xl font-display text-charcoal-900 mb-4">
            Spread the Tradition
          </h2>
          <p className="text-charcoal-700 font-sans mb-8 max-w-xl mx-auto">
            Invite your friends and family to join Shiri Mandir and earn divine rewards for your spiritual journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <div className="bg-ivory-100 p-6 rounded-2xl shadow-warm flex-1 max-w-xs mx-auto w-full border border-ivory-200 hover:-translate-y-0.5 transition-all duration-300">
              <Gift className="w-8 h-8 text-copper-500 mx-auto mb-3" />
              <h3 className="font-sans font-medium text-charcoal-900 mb-1">You Get</h3>
              <p className="font-mono text-2xl font-bold text-copper-600">₹{referrerReward}</p>
            </div>
            <div className="bg-ivory-100 p-6 rounded-2xl shadow-warm flex-1 max-w-xs mx-auto w-full border border-ivory-200 hover:-translate-y-0.5 transition-all duration-300">
              <Gift className="w-8 h-8 text-temple-gold-500 mx-auto mb-3" />
              <h3 className="font-sans font-medium text-charcoal-900 mb-1">Friend Gets</h3>
              <p className="font-mono text-2xl font-bold text-temple-gold-500">₹{refereeReward}</p>
            </div>
          </div>

          <div className="mx-auto inline-flex items-center justify-between border-2 border-dashed border-copper-400 bg-copper-50 rounded-xl p-3 mb-8 w-full max-w-sm">
            <span className="font-mono text-xl font-bold text-charcoal-900 tracking-wider pl-4">
              {displayCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-copper-400 text-white px-4 py-2 rounded-lg font-sans font-medium hover:bg-copper-500 transition-all duration-300 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <p className="font-sans text-charcoal-700 mb-4 font-medium">Share via</p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-warm focus:ring-2 focus:ring-sage-500/50 focus:ring-offset-2">
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button className="flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-900 text-white px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-warm focus:ring-2 focus:ring-charcoal-800/50 focus:ring-offset-2">
                <Twitter className="w-5 h-5" />
                <span className="hidden sm:inline">Twitter</span>
              </button>
              <button className="flex items-center gap-2 bg-copper-400 hover:bg-copper-500 text-white px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-warm focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2">
                <Link className="w-5 h-5" />
                <span className="hidden sm:inline">Copy Link</span>
              </button>
            </div>
          </div>

          <p className="text-sm font-sans text-charcoal-500">
            {totalDevoteesJoined.toLocaleString()} devotees joined through referrals
          </p>

        </div>
      </div>
    </section>
  );
}
