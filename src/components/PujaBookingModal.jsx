import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Flame,
  Info
} from 'lucide-react';
import { AASHIRWAD_ADDONS } from '../data/mockData';

export default function PujaBookingModal({ 
  service, 
  user, 
  onClose, 
  onProceedToPayment 
}) {
  // Stepper state: 'select' (Step 3) or 'details' (Step 4)
  const [internalStep, setInternalStep] = useState('select');

  // Step 3 State: Package & Date
  const packages = service?.packages || [
    { id: 'ind', name: 'Individual Devotee Sankalpa', price: service?.price || 1501, members: 1, desc: '1 devotee name & gotra invoked' },
    { id: 'couple', name: 'Dampati (Couple) Sankalpa', price: (service?.price || 1501) + 600, members: 2, desc: 'Spousal names & gotra invoked with marital blessings' },
    { id: 'family', name: 'Sampoorna Family Sankalpa', price: (service?.price || 1501) + 1600, members: 5, desc: 'Up to 5 family names invoked with Grand Aashirwad Box' },
  ];
  const [selectedPkg, setSelectedPkg] = useState(packages[0]);
  const [selectedDate, setSelectedDate] = useState('14 Sept 2026 (Shukla Ekadashi)');

  // Step 4 State: Participant Details & Gotra
  const [primaryName, setPrimaryName] = useState(user?.name || 'Kaushal Singh');
  const [gotra, setGotra] = useState(user?.gotra || 'Kashyap');
  const [dontKnowGotra, setDontKnowGotra] = useState(false);
  const [additionalMembers, setAdditionalMembers] = useState(['Pooja Singh']);
  const [sankalpaWish, setSankalpaWish] = useState('Family Health & Spiritual Growth');

  // Step 4.5 State: Optional Add-ons
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [voluntaryDonation, setVoluntaryDonation] = useState(21); // Temple trust donation

  const toggleAddon = (addon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleGotraHelperToggle = () => {
    if (!dontKnowGotra) {
      setGotra('Kashyap (Universal Vedic Gotra)');
      setDontKnowGotra(true);
    } else {
      setGotra(user?.gotra || '');
      setDontKnowGotra(false);
    }
  };

  // Calculations
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const totalPayable = selectedPkg.price + addonsTotal + voluntaryDonation;

  const handleContinueToPay = () => {
    const bookingPayload = {
      service,
      package: selectedPkg,
      selectedDate,
      devotees: [
        `${primaryName} (${gotra})`,
        ...additionalMembers.filter(m => m.trim() !== '').map(m => `${m} (${gotra})`)
      ],
      sankalpaWish,
      selectedAddons,
      voluntaryDonation,
      totalPayable
    };
    onProceedToPayment(bookingPayload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header with Visible 6-Step Stepper */}
        <div className="bg-sanctum-950 text-sandstone-100 p-5 sm:px-8 border-b border-gold-500/25 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-gold-400 uppercase tracking-widest">
                VEDIC SANCTUM BOOKING CONDUIT
              </span>
              <h3 className="text-xl font-serif font-bold text-white truncate max-w-md sm:max-w-xl">
                {service?.title || service?.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-sanctum-900 border border-white/20 text-white hover:bg-sanctum-850 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 6-Step Progress Stepper */}
          <div className="hidden sm:flex items-center justify-between pt-2 border-t border-sanctum-800 text-xs">
            
            {/* Step 1: Browse */}
            <div className="flex items-center gap-2 text-tulsi-400 font-semibold">
              <div className="w-6 h-6 rounded-full bg-tulsi-500/20 border border-tulsi-500 flex items-center justify-center text-[10px]">✓</div>
              <span>1. Browse</span>
            </div>
            <div className="h-0.5 w-8 bg-tulsi-500"></div>

            {/* Step 2: Login Gate */}
            <div className="flex items-center gap-2 text-tulsi-400 font-semibold">
              <div className="w-6 h-6 rounded-full bg-tulsi-500/20 border border-tulsi-500 flex items-center justify-center text-[10px]">✓</div>
              <span>2. Login</span>
            </div>
            <div className={`h-0.5 w-8 ${internalStep === 'details' ? 'bg-tulsi-500' : 'bg-gold-500'}`}></div>

            {/* Step 3: Select Service */}
            <div className={`flex items-center gap-2 font-semibold ${internalStep === 'select' ? 'text-gold-400' : 'text-tulsi-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                internalStep === 'select' 
                  ? 'bg-gold-500 text-sanctum-950 font-bold ring-2 ring-gold-400/40' 
                  : 'bg-tulsi-500/20 border border-tulsi-500 text-tulsi-400'
              }`}>
                {internalStep === 'details' ? '✓' : '3'}
              </div>
              <span>3. Select</span>
            </div>
            <div className={`h-0.5 w-8 ${internalStep === 'details' ? 'bg-gold-500' : 'bg-sandstone-700'}`}></div>

            {/* Step 4: Devotee Details */}
            <div className={`flex items-center gap-2 font-semibold ${internalStep === 'details' ? 'text-gold-400' : 'text-sandstone-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                internalStep === 'details' 
                  ? 'bg-gold-500 text-sanctum-950 font-bold ring-2 ring-gold-400/40' 
                  : 'bg-sanctum-900 border border-sandstone-700 text-sandstone-400'
              }`}>
                4
              </div>
              <span>4. Details & Gotra</span>
            </div>
            <div className="h-0.5 w-8 bg-sandstone-700"></div>

            {/* Step 5: Pay */}
            <div className="flex items-center gap-2 text-sandstone-400">
              <div className="w-6 h-6 rounded-full bg-sanctum-900 border border-sandstone-700 flex items-center justify-center text-[10px]">5</div>
              <span>5. Pay</span>
            </div>
            <div className="h-0.5 w-8 bg-sandstone-700"></div>

            {/* Step 6: Confirm */}
            <div className="flex items-center gap-2 text-sandstone-400">
              <div className="w-6 h-6 rounded-full bg-sanctum-900 border border-sandstone-700 flex items-center justify-center text-[10px]">6</div>
              <span>6. Confirm</span>
            </div>

          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 3 VIEW: SELECT PACKAGE & DATE */}
          {internalStep === 'select' && (
            <div className="space-y-6">
              
              {/* Package Tier Selection */}
              <div>
                <h4 className="font-serif font-bold text-lg text-sanctum-950 mb-1">
                  1. Choose Your Devotee Sankalpa Tier
                </h4>
                <p className="text-xs text-sandstone-600 mb-4">
                  Select how many family names will be officially invoked during the Vedic chanting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = selectedPkg.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkg(pkg)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-gold-500 bg-gold-500/10 shadow-sm'
                            : 'border-sandstone-200 bg-sandstone-50 hover:border-gold-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'bg-gold-500 border-gold-600 text-sanctum-950' : 'border-sandstone-300'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span className="text-[11px] font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-md">
                              {pkg.members} Member{pkg.members > 1 ? 's' : ''}
                            </span>
                          </div>

                          <h5 className="font-serif font-bold text-base text-sanctum-950 mt-2">
                            {pkg.name}
                          </h5>
                          <p className="text-xs text-sandstone-600 mt-1">
                            {pkg.desc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-sandstone-200">
                          <span className="text-xl font-serif font-bold text-sanctum-950">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Auspicious Date & Tithi Selection */}
              <div>
                <h4 className="font-serif font-bold text-lg text-sanctum-950 mb-1">
                  2. Select Auspicious Date & Muhurta
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    "14 Sept 2026 (Shukla Ekadashi - Highly Auspicious)",
                    "16 Sept 2026 (Bhadrapada Trayodashi Pradosh)",
                    "18 Sept 2026 (Shukla Purnima Maha Sankalpa)",
                    "22 Sept 2026 (Sarva Pitra Amavasya Special)"
                  ].map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setSelectedDate(dt)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        selectedDate === dt
                          ? 'border-gold-500 bg-gold-500/10 text-sanctum-950'
                          : 'border-sandstone-200 bg-sandstone-50 text-sandstone-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold-600" />
                        <span>{dt}</span>
                      </div>
                      {selectedDate === dt && <CheckCircle2 className="w-4 h-4 text-tulsi-600" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 4 VIEW: DEVOTEE DETAILS, GOTRA & AASHIRWAD BOX ADD-ONS */}
          {internalStep === 'details' && (
            <div className="space-y-6">
              
              {/* Participant Details & Gotra Helper */}
              <div className="p-5 rounded-3xl bg-sandstone-50 border border-sandstone-200 space-y-4">
                <h4 className="font-serif font-bold text-base text-sanctum-950">
                  Devotee Sankalpa Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Name */}
                  <div>
                    <label className="block text-xs font-semibold text-sandstone-700 mb-1.5 uppercase">
                      Primary Devotee Full Name *
                    </label>
                    <input
                      type="text"
                      value={primaryName}
                      onChange={(e) => setPrimaryName(e.target.value)}
                      placeholder="e.g. Kaushal Singh"
                      className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm focus:outline-none focus:border-gold-500 bg-white"
                      required
                    />
                  </div>

                  {/* Gotra Input & Helper Option */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-sandstone-700 uppercase">
                        Vedic Gotra *
                      </label>
                      <button
                        type="button"
                        onClick={handleGotraHelperToggle}
                        className="text-[11px] text-terracotta-600 hover:text-terracotta-700 font-semibold underline"
                      >
                        {dontKnowGotra ? "Enter custom Gotra" : "I don't know my Gotra"}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={gotra}
                      onChange={(e) => setGotra(e.target.value)}
                      disabled={dontKnowGotra}
                      placeholder="e.g. Kashyap, Bharadwaj, Vashistha"
                      className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm focus:outline-none focus:border-gold-500 bg-white disabled:bg-sandstone-100 disabled:text-sandstone-600"
                      required
                    />

                    {dontKnowGotra && (
                      <p className="text-[11px] text-tulsi-700 mt-1 flex items-center gap-1 font-medium">
                        <Info className="w-3 h-3" />
                        <span>Kashyap Gotra will be invoked (universal Vedic lineage for all souls).</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Member Names if Package allows */}
                {selectedPkg.members > 1 && (
                  <div>
                    <label className="block text-xs font-semibold text-sandstone-700 mb-1.5 uppercase">
                      Family Member Names ({selectedPkg.members - 1} more allowed)
                    </label>
                    <div className="space-y-2">
                      {additionalMembers.map((mem, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={mem}
                          onChange={(e) => {
                            const updated = [...additionalMembers];
                            updated[idx] = e.target.value;
                            setAdditionalMembers(updated);
                          }}
                          placeholder={`Member #${idx + 2} Name`}
                          className="w-full px-4 py-2 rounded-xl border border-sandstone-300 text-sm bg-white"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sankalpa Prayer Intention */}
                <div>
                  <label className="block text-xs font-semibold text-sandstone-700 mb-1.5 uppercase">
                    Sankalpa Resolution / Prayer Wish
                  </label>
                  <select
                    value={sankalpaWish}
                    onChange={(e) => setSankalpaWish(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm bg-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Family Health, Longevity & Protection">Family Health, Longevity & Protection</option>
                    <option value="Career Advancement, Business Growth & Prosperity">Career Advancement, Business Growth & Prosperity</option>
                    <option value="Ancestral Peace & Pitra Dosh Relief">Ancestral Peace & Pitra Dosh Relief</option>
                    <option value="Spiritual Enlightenment & Mental Serenity">Spiritual Enlightenment & Mental Serenity</option>
                  </select>
                </div>
              </div>

              {/* Optional Add-ons: The Vedic Aashirwad Box */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-sanctum-950">
                      Enhance with "Vedic Aashirwad Box" Add-ons
                    </h4>
                    <p className="text-xs text-sandstone-600">
                      Sacred energized items consecrated at the sanctum and packed alongside your Prasad.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-gold-700 bg-gold-500/10 px-2.5 py-1 rounded-md">
                    Optional Consecrations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AASHIRWAD_ADDONS.map((addon) => {
                    const isAdded = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isAdded
                            ? 'border-gold-500 bg-gold-500/10'
                            : 'border-sandstone-200 bg-white hover:border-sandstone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <h5 className="font-bold text-xs text-sanctum-950 leading-tight">
                              {addon.name}
                            </h5>
                            <p className="text-[11px] text-sandstone-500 line-clamp-1">
                              {addon.desc}
                            </p>
                            <span className="text-xs font-serif font-bold text-gold-700">
                              +₹{addon.price}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            isAdded
                              ? 'bg-gold-500 text-sanctum-950 border-gold-600'
                              : 'border-sandstone-300 text-sandstone-500'
                          }`}
                        >
                          {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Price Summary & Actions */}
        <div className="bg-sandstone-100 p-5 sm:px-8 border-t border-sandstone-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-sandstone-600">Total Dakshina:</span>
              <span className="text-2xl font-serif font-bold text-sanctum-950">
                ₹{totalPayable.toLocaleString()}
              </span>
              <span className="text-[10px] text-tulsi-700 font-semibold bg-tulsi-50 px-2 py-0.5 rounded-full border border-tulsi-200">
                Free Sanctum Courier Delivery
              </span>
            </div>
            <p className="text-[11px] text-sandstone-500 mt-0.5">
              Includes {selectedPkg.name} {selectedAddons.length > 0 && `+ ${selectedAddons.length} Sacred Add-on(s)`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {internalStep === 'details' && (
              <button
                type="button"
                onClick={() => setInternalStep('select')}
                className="py-3 px-4 rounded-xl border border-sandstone-300 text-xs font-semibold text-sandstone-700 hover:bg-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {internalStep === 'select' ? (
              <button
                type="button"
                onClick={() => setInternalStep('details')}
                className="flex-1 sm:flex-none py-3.5 px-8 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Devotee Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinueToPay}
                className="flex-1 sm:flex-none py-3.5 px-8 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Continue to Unified Payment Sheet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
