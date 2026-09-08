export const PANCHANG_TODAY = {
  date: "Tuesday, 8 September 2026",
  tithi: "Shukla Paksha Ekadashi (Parivartini Ekadashi)",
  nakshatra: "Shravana (until 04:32 PM), then Dhanishta",
  yoga: "Sobhana Yoga",
  karana: "Bava Karana",
  abhijitMuhurat: "11:48 AM – 12:38 PM",
  rahuKaal: "03:20 PM – 04:52 PM",
  yamaganda: "09:12 AM – 10:44 AM",
  sunrise: "06:08 AM",
  sunset: "06:34 PM",
  festival: "Parivartini Ekadashi Vrat & Lord Vishnu Maha Sankalpa"
};

export const TEMPLES = [
  {
    id: "kashi-vishwanath",
    name: "Shri Kashi Vishwanath Jyotirlinga",
    deity: "Lord Shiva",
    location: "Varanasi, Uttar Pradesh",
    state: "Uttar Pradesh",
    image: "/images/kashi_vishwanath.jpg",
    gallery: [
      "/images/kashi_vishwanath.jpg"
    ],
    tagline: "The Eternal Sanctum of Moksha on the Sacred Banks of Ganga",
    waitMinutes: 14,
    waitStatus: "Smooth Darshan",
    onlineDevotees: 3420,
    rating: 4.96,
    reviewCount: 24800,
    followersCount: 184500,
    timings: [
      { name: "Mangala Aarti", time: "03:00 AM - 04:00 AM", type: "Morning Aarti" },
      { name: "Bhog Aarti", time: "11:15 AM - 12:20 PM", type: "Afternoon Offering" },
      { name: "Sandhya Aarti", time: "07:00 PM - 08:15 PM", type: "Evening Aarti" },
      { name: "Shayan Aarti", time: "10:30 PM - 11:00 PM", type: "Night Rest" }
    ],
    availableSevas: [
      { id: "kv-rudrabhishek", name: "Maha Rudrabhishek with 11 Dravyas", price: 1501, duration: "45 mins", priest: "3 Vedic Archakas" },
      { id: "kv-ganga-aarti", name: "Ganga Jal Sankalpa & Bilva Patra Archana", price: 751, duration: "30 mins", priest: "Officiated Brahmin" },
      { id: "kv-chadhava-silver", name: "Silver Bilva Patra Chadhava", price: 1100, duration: "At Shringar Aarti", priest: "Chief Sanctum Priest" }
    ],
    reviews: [
      { id: 1, user: "Dr. Arvind Pathak", city: "Mumbai", rating: 5, date: "2 days ago", comment: "The live video sankalpa with my gotra pronounced accurately gave our whole family goosebumps. Received the sanctified Bhasma and dry prasad within 3 days.", verified: true },
      { id: 2, user: "Sunita Nambiar", city: "Chennai", rating: 5, date: "1 week ago", comment: "Tracked the live darshan queue meter before booking. The prasad delivery tracking was accurate and the Rudraksha energized at the sanctum feels truly divine.", verified: true }
    ],
    hasLiveDarshan: true,
    hasPrasadDelivery: true,
    has80GExemption: true,
  },
  {
    id: "mahakaleshwar-ujjain",
    name: "Shri Mahakaleshwar Jyotirlinga",
    deity: "Lord Shiva (Kaal Bhairav / Mahakaal)",
    location: "Ujjain, Madhya Pradesh",
    state: "Madhya Pradesh",
    image: "/images/mahakaleshwar.jpg",
    gallery: [
      "/images/mahakaleshwar.jpg"
    ],
    tagline: "Dakshinmukhi Swayambhu Jyotirlinga of Kaal & Immortality",
    waitMinutes: 28,
    waitStatus: "Moderate Queue",
    onlineDevotees: 5120,
    rating: 4.98,
    reviewCount: 38200,
    followersCount: 242000,
    timings: [
      { name: "Bhasma Aarti", time: "04:00 AM - 06:00 AM", type: "Sacred Bhasma Ritual" },
      { name: "Naivedya Aarti", time: "10:30 AM - 11:30 AM", type: "Divine Food" },
      { name: "Sandhya Aarti", time: "05:00 PM - 06:00 PM", type: "Twilight Offering" },
      { name: "Shayan Aarti", time: "10:30 PM - 11:00 PM", type: "Final Darshan" }
    ],
    availableSevas: [
      { id: "mk-bhasma-sankalpa", name: "Special Bhasma Aarti Name & Gotra Sankalpa", price: 2101, duration: "60 mins", priest: "Mahakaal Archakas" },
      { id: "mk-laghu-rudra", name: "Laghu Rudra Paath for Kaal Sarp Shanti", price: 3100, duration: "90 mins", priest: "5 Shastris" }
    ],
    reviews: [
      { id: 3, user: "Rohan Singhania", city: "Delhi NCR", rating: 5, date: "3 days ago", comment: "Attended the Bhasma Aarti via personal live stream link. The audio clarity of the damru and mantras was phenomenal.", verified: true }
    ],
    hasLiveDarshan: true,
    hasPrasadDelivery: true,
    has80GExemption: true,
  },
  {
    id: "kedarnath-dham",
    name: "Shri Kedarnath Dham",
    deity: "Lord Shiva",
    location: "Rudraprayag, Uttarakhand",
    state: "Uttarakhand",
    image: "/images/kedarnath.jpg",
    gallery: [
      "/images/kedarnath.jpg"
    ],
    tagline: "Highest Jyotirlinga nestled amidst the pristine Himalayan snow peaks",
    waitMinutes: 45,
    waitStatus: "Peak Rush",
    onlineDevotees: 6890,
    rating: 4.99,
    reviewCount: 42100,
    followersCount: 310000,
    timings: [
      { name: "Maha Abhishek", time: "04:00 AM - 07:00 AM", type: "Morning Sanctum Seva" },
      { name: "General Darshan", time: "07:00 AM - 01:00 PM", type: "Open Darshan" },
      { name: "Sandhya Aarti", time: "06:00 PM - 07:30 PM", type: "Evening Aarti" }
    ],
    availableSevas: [
      { id: "kd-himalaya-rudra", name: "Akhand Diya & Ghee Abhishek Seva", price: 2501, duration: "50 mins", priest: "Rawal Officiated Priests" },
      { id: "kd-chadhava-shawl", name: "Sacred Woolen Chaddar & Bilva Patra", price: 1251, duration: "During Aarti", priest: "Kedarnath Trust" }
    ],
    reviews: [
      { id: 4, user: "Meera Venkatesh", city: "Bengaluru", rating: 5, date: "Yesterday", comment: "Since my elderly parents cannot trek to Kedarnath, MandirVeda brought the Kedarnath blessing right into our prayer room.", verified: true }
    ],
    hasLiveDarshan: true,
    hasPrasadDelivery: true,
    has80GExemption: true,
  },
  {
    id: "ayodhya-ram-mandir",
    name: "Shri Ram Janmabhoomi Teerth Kshetra",
    deity: "Lord Rama (Ram Lalla)",
    location: "Ayodhya, Uttar Pradesh",
    state: "Uttar Pradesh",
    image: "/images/ayodhya_ram_mandir.jpg",
    gallery: [
      "/images/ayodhya_ram_mandir.jpg"
    ],
    tagline: "The Magnificent Abode of Maryada Purushottam Ram Lalla",
    waitMinutes: 20,
    waitStatus: "Smooth Queue",
    onlineDevotees: 8940,
    rating: 4.97,
    reviewCount: 52000,
    followersCount: 420000,
    timings: [
      { name: "Shrinagar Aarti", time: "06:30 AM - 07:00 AM", type: "Morning Darshan" },
      { name: "Bhog Aarti", time: "12:00 PM - 12:30 PM", type: "Mid-day Prasad" },
      { name: "Sandhya Aarti", time: "07:30 PM - 08:00 PM", type: "Grand Evening Aarti" }
    ],
    availableSevas: [
      { id: "ay-ramlalla-archana", name: "Special Ram Lalla Tulsi Archana & Bhog", price: 1101, duration: "40 mins", priest: "Teerth Kshetra Pandits" },
      { id: "ay-chadhava-peetambar", name: "Yellow Peetambar Vastra & Kheer Chadhava", price: 1551, duration: "During Bhog", priest: "Trust Priests" }
    ],
    reviews: [
      { id: 5, user: "Alok Trivedi", city: "Lucknow", rating: 5, date: "4 days ago", comment: "The Ilaichi Dana and dry prasad box came stamped directly with Ram Lalla's holy emblem. Pristine packaging.", verified: true }
    ],
    hasLiveDarshan: true,
    hasPrasadDelivery: true,
    has80GExemption: true,
  },
  {
    id: "tirupati-balaji",
    name: "Tirumala Sri Venkateswara Temple",
    deity: "Lord Venkateswara (Balaji)",
    location: "Tirupati, Andhra Pradesh",
    state: "Andhra Pradesh",
    image: "/images/tirupati_balaji.jpg",
    gallery: [
      "/images/tirupati_balaji.jpg"
    ],
    tagline: "Kaliyuga Vaikuntam and Lord of Seven Hills",
    waitMinutes: 35,
    waitStatus: "High Devotee Inflow",
    onlineDevotees: 9400,
    rating: 4.99,
    reviewCount: 68000,
    followersCount: 580000,
    timings: [
      { name: "Suprabhatam", time: "03:00 AM - 03:30 AM", type: "Dawn Waking Seva" },
      { name: "Thomala Seva", time: "03:45 AM - 04:30 AM", type: "Floral Garland Ritual" },
      { name: "Archana", time: "04:30 AM - 05:30 AM", type: "1008 Names Chanting" },
      { name: "Ekanta Seva", time: "01:30 AM", type: "Night Rest" }
    ],
    availableSevas: [
      { id: "tp-kalyanotsavam", name: "Sri Srinivasa Kalyanotsavam Sankalpa", price: 2501, duration: "60 mins", priest: "Tirumala Archakas" },
      { id: "tp-laddu-prasadam", name: "Special Laddu & Tulsi Mala Chadhava", price: 1001, duration: "During Archana", priest: "Temple Trust" }
    ],
    reviews: [
      { id: 6, user: "Suresh Krishnan", city: "Hyderabad", rating: 5, date: "5 days ago", comment: "The sacred Tirupati Laddu arrived intact in vacuum sealed food-grade packaging. Truly remarkable service.", verified: true }
    ],
    hasLiveDarshan: true,
    hasPrasadDelivery: true,
    has80GExemption: true,
  },
  {
    id: "kamakhya-devi",
    name: "Maa Kamakhya Devalaya",
    deity: "Goddess Kamakhya (Shakti Peeth)",
    location: "Guwahati, Assam",
    state: "Assam",
    image: "/images/kamakhya_devi.jpg",
    gallery: [
      "/images/kamakhya_devi.jpg"
    ],
    tagline: "Supreme Tantric Shakti Peetha on Nilachal Hill",
    waitMinutes: 18,
    waitStatus: "Smooth Darshan",
    onlineDevotees: 2980,
    rating: 4.95,
    reviewCount: 19400,
    followersCount: 140000,
    timings: [
      { name: "Snan & Shringar", time: "05:30 AM - 06:30 AM", type: "Holy Bath" },
      { name: "Bhog Aarti", time: "01:00 PM - 02:30 PM", type: "Sacred Naivedya" },
      { name: "Aarti", time: "06:00 PM - 07:00 PM", type: "Evening Shakti Aarti" }
    ],
    availableSevas: [
      { id: "km-rakta-vastra", name: "Maa Kamakhya Rakt Vastra & Sindoor Seva", price: 1801, duration: "45 mins", priest: "Kamakhya Bor Doloi" },
      { id: "km-shakti-paath", name: "Durga Saptashati Paath for Obstacle Removal", price: 2101, duration: "75 mins", priest: "3 Vedic Pandits" }
    ],
    reviews: [
      { id: 7, user: "Ananya Ghosh", city: "Kolkata", rating: 5, date: "1 week ago", comment: "Received the sanctified Rakt Vastra cloth and sindoor. Very powerful positive energy.", verified: true }
    ],
    hasLiveDarshan: true,
    hasPrasadDelivery: true,
    has80GExemption: true,
  }
];

export const FEATURED_PUJAS = [
  {
    id: "puja-mahashivratri-rudra",
    title: "Maha Rudrabhishek with 11 Dravyas & 1008 Bilva Patra",
    templeId: "kashi-vishwanath",
    templeName: "Shri Kashi Vishwanath Temple, Varanasi",
    deity: "Lord Shiva",
    category: "Health, Protection & Liberation",
    date: "Auspicious Somwar (Monday), 14 Sept 2026",
    tithiTag: "Pradosh Vrat Special",
    price: 1501,
    originalPrice: 2100,
    discount: "28% OFF",
    liveStream: true,
    participantsCount: 4120,
    badge: "LIVE SANKALPA STREAM",
    badgeType: "live",
    countdown: "Starts in 2h 45m",
    image: "/images/puja_rudrabhishek.jpg",
    benefits: [
      "Dissolves negative karmic hurdles & illness",
      "Special personal Gotra and Name recitation by 3 Vedic Brahmins",
      "Pure silver bilva patra offered directly on the Swayambhu Shivalinga",
      "Prasad kit delivered to doorstep: Bhasma, Rudraksha, Dry Mewa, Ganga Jal"
    ],
    packages: [
      { id: "pkg-ind", name: "Single Devotee Sankalpa", price: 1501, members: 1, desc: "Personal name & Gotra chanted during the holy Abhishek" },
      { id: "pkg-couple", name: "Dampati (Couple) Sankalpa", price: 2101, members: 2, desc: "Spousal names & Gotra recited with special marital blessings" },
      { id: "pkg-family", name: "Sampoorna Family Sankalpa", price: 3101, members: 5, desc: "Up to 5 family members names recited, includes Grand Aashirwad Box" }
    ]
  },
  {
    id: "puja-baglamukhi-shatru",
    title: "Maa Baglamukhi Shatru Vinashak & Vijay Maha Yagya",
    templeId: "kamakhya-devi",
    templeName: "Maa Kamakhya Nilachal Sanctum, Guwahati",
    deity: "Maa Baglamukhi / Pitambari",
    category: "Legal Victory, Business & Career Protection",
    date: "Wednesday, 16 Sept 2026",
    tithiTag: "Bhadrapada Shukla Trayodashi",
    price: 2501,
    originalPrice: 3500,
    discount: "30% OFF",
    liveStream: true,
    participantsCount: 2380,
    badge: "SPECIAL TANTRA SANKALPA",
    badgeType: "featured",
    countdown: "Starts Tomorrow 07:00 AM",
    image: "/images/puja_baglamukhi.jpg",
    benefits: [
      "Overcomes court cases, enemies, evil eye (nazar dosh)",
      "Performed using turmeric garlands & yellow mustard seeds",
      "Direct live video stream link delivered on devotee WhatsApp",
      "Prasad includes Baglamukhi Energized Yantra & Peetambar cloth"
    ],
    packages: [
      { id: "pkg-ind-bg", name: "Individual Victory Sankalpa", price: 2501, members: 1, desc: "Personal Sankalpa with legal/business resolution prayer" },
      { id: "pkg-fam-bg", name: "Family Shield Sankalpa", price: 3901, members: 4, desc: "Complete family astrological protection shield" }
    ]
  },
  {
    id: "puja-sudarshana-homa",
    title: "Maha Sudarshana Homa & Lakshmi Kubera Dhan Prapti",
    templeId: "tirupati-balaji",
    templeName: "Tirumala Sri Venkateswara Swamy Kshetram",
    deity: "Lord Venkateswara & Sri Mahalakshmi",
    category: "Wealth, Debt Clearance & Prosperity",
    date: "Friday, 18 Sept 2026",
    tithiTag: "Shukla Purnima Auspicious Muhurta",
    price: 1801,
    originalPrice: 2400,
    discount: "25% OFF",
    liveStream: true,
    participantsCount: 5210,
    badge: "HIGHLY AUSPICIOUS",
    badgeType: "trending",
    countdown: "3 Days Remaining",
    image: "/images/puja_sudarshana.jpg",
    benefits: [
      "Clears long-standing debts and activates financial channels",
      "Sacred Sudarshana Yantra energized with 10,000 moola mantras",
      "Blessed Tirupati Laddu Prasad sent via Express cold-chain pack"
    ],
    packages: [
      { id: "pkg-ind-sd", name: "Single Devotee Homa", price: 1801, members: 1, desc: "1 Devotee name with Gotra and business wish" },
      { id: "pkg-couple-sd", name: "Dampati Kubera Seva", price: 2701, members: 2, desc: "Couple Sankalpa + Energized Lakshmi Kubera Silver Coin" }
    ]
  },
  {
    id: "puja-kaal-sarp-shanti",
    title: "Navagraha & Kaal Sarp Dosh Nivaran Mahapuja",
    templeId: "mahakaleshwar-ujjain",
    templeName: "Shri Mahakaleshwar & Nagchandreshwar, Ujjain",
    deity: "Lord Mahakaal & Rahu-Ketu",
    category: "Astrological Dosha & Mental Peace",
    date: "Tuesday, 22 Sept 2026",
    tithiTag: "Bhadrapada Amavasya",
    price: 2101,
    originalPrice: 2900,
    discount: "27% OFF",
    liveStream: true,
    participantsCount: 3190,
    badge: "ANNUAL AMAVASYA SPECIAL",
    badgeType: "live",
    countdown: "Limited Slots Available",
    image: "/images/puja_navagraha.jpg",
    benefits: [
      "Pacifies malefic Rahu, Ketu, and Saturn afflictions",
      "Silver serpent pair offered into holy Kshipra sanctum waters",
      "Certified 80G tax exemption donation receipt generated instantly"
    ],
    packages: [
      { id: "pkg-ind-ks", name: "Devotee Dosha Nivaran", price: 2101, members: 1, desc: "Personal birth chart remedies performed by Mahakaal Shastris" },
      { id: "pkg-fam-ks", name: "Ancestral (Pitra) Shanti Seva", price: 3401, members: 4, desc: "Includes Pinda Daan and Go-gras feeding at Kshipra Ghat" }
    ]
  }
];

export const CHADHAVA_ITEMS = [
  {
    id: "chadhava-silver-chhatra",
    name: "Pure Silver Chhatra (Crown of Grace)",
    templeName: "Shri Kashi Vishwanath, Varanasi",
    deity: "Lord Shiva",
    price: 1100,
    category: "Sacred Metal Offerings",
    image: "/images/chadhava_silver_chhatra.jpg",
    desc: "Offered on the Shivalinga during Evening Shringar Aarti with your Gotra dedication engraved digitally on temple ledger.",
    significance: "Brings divine protection over family lineage and wards off sudden adversities."
  },
  {
    id: "chadhava-108-belpatra",
    name: "Gold-Tipped 108 Sacred Bilva Patra Garland",
    templeName: "Shri Mahakaleshwar, Ujjain",
    deity: "Lord Mahakaal",
    price: 501,
    category: "Botanical Sanctum Sevas",
    image: "/images/chadhava_bilva_garland.jpg",
    desc: "Fresh, unblemished 3-leaf Belpatra strung by sanctum priests and consecrated with Chandan paste.",
    significance: "Represents the three Gunas (Sattva, Rajas, Tamas) surrendered to Lord Shiva."
  },
  {
    id: "chadhava-peetambar",
    name: "Yellow Peetambar Silk Vastra & Mukut",
    templeName: "Ram Janmabhoomi, Ayodhya",
    deity: "Lord Ram Lalla",
    price: 1551,
    category: "Divine Vestments",
    image: "/images/chadhava_peetambar_silk.jpg",
    desc: "Handwoven auspicious yellow silk adorned with zari border, draped on Ram Lalla during Midday Bhog.",
    significance: "Signifies pure devotion and radiates joy and spiritual upliftment."
  },
  {
    id: "chadhava-goseva",
    name: "Go-gras (Cow Seva) & Green Fodder Seva",
    templeName: "Banke Bihari Gaushala, Vrindavan",
    deity: "Shri Krishna & Gau Mata",
    price: 351,
    category: "Living Seva",
    image: "/images/chadhava_goseva.jpg",
    desc: "Feed 11 sacred indigenous Gir cows fresh jaggery, chana, and green fodder in your family's name.",
    significance: "Equivalent to worshipping 33 crore deities; dispels ancestral distress (Pitra Rin)."
  }
];

export const AASHIRWAD_ADDONS = [
  {
    id: "addon-rudraksha",
    name: "Panchmukhi Himalayan Rudraksha (Sanctum Energized)",
    price: 251,
    image: "/images/addon_rudraksha.jpg",
    desc: "Blessed on the Swayambhu Shivalinga during live chanting"
  },
  {
    id: "addon-silver-coin",
    name: "Goddess Lakshmi & Ganesha Pure Silver Coin (10g, 999 Fine)",
    price: 751,
    image: "/images/addon_silver_coin.jpg",
    desc: "Comes in velvet box with authenticity certificate and temple seal"
  },
  {
    id: "addon-gangajal",
    name: "Brahmakund Haridwar Holy Gangajal Sealed Can (250ml)",
    price: 151,
    image: "/images/addon_gangajal.jpg",
    desc: "Direct unadulterated riverbed water packed at sunrise"
  },
  {
    id: "addon-prasad-box",
    name: "Deluxe Dry Prasad & Mahabhog Sweets Box (500g)",
    price: 351,
    image: "/images/addon_prasad_box.jpg",
    desc: "Cardamom pedas, dried panchmeva, chandan tika and sacred thread"
  }
];

export const DEVOTIONAL_LIBRARY = [
  { id: "lib-shiv-tandav", title: "Shiv Tandav Stotram", deity: "Lord Shiva", duration: "9:24 min", author: "Ravana Rachit", category: "Stotrams", thumbnail: "/images/deity_shiva.jpg" },
  { id: "lib-hanuman-chalisa", title: "Shri Hanuman Chalisa", deity: "Lord Hanuman", duration: "11:08 min", author: "Goswami Tulsidas", category: "Chalisas", thumbnail: "/images/deity_hanuman.jpg" },
  { id: "lib-vishnu-sahasranamam", title: "Vishnu Sahasranama Stotram", deity: "Lord Vishnu", duration: "28:15 min", author: "Mahabharata Anushasana Parva", category: "Suktams", thumbnail: "/images/deity_vishnu.jpg" },
  { id: "lib-madhurashtakam", title: "Madhurashtakam (Adharam Madhuram)", deity: "Lord Krishna", duration: "7:40 min", author: "Shri Vallabhacharya", category: "Ashtakams", thumbnail: "/images/deity_krishna.jpg" },
  { id: "lib-durga-suktam", title: "Maha Durga Suktam & Kavacham", deity: "Maa Durga", duration: "14:10 min", author: "Rig Veda", category: "Vedic Mantras", thumbnail: "/images/deity_durga.jpg" }
];

export const ASTRO_TOOLS = [
  { id: "kundli-milan", name: "Vedic Kundli Milan (Horoscope Matching)", desc: "36 Guna Milan analysis with Manglik Dosh and Bhakoot checks", icon: "Stars" },
  { id: "sade-sati", name: "Shani Sade Sati Transit Calculator", desc: "Detailed analysis of current Saturn phase with remedial pujas", icon: "Compass" },
  { id: "panchang-muhurat", name: "Shubh Choghadiya & Auspicious Muhurta", desc: "Find the exact minute for Griha Pravesh, vehicle purchase, or vivah", icon: "Clock" },
  { id: "rashi-bhavishya", name: "Daily Moon Sign (Rashi) Predictions", desc: "Tailored astrological forecast for all 12 rashis updated at sunrise", icon: "Sun" }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Rajesh & Vandana Saxena",
    city: "San Jose, California (USA)",
    pujaName: "Maha Rudrabhishek at Kashi Vishwanath",
    date: "14 Aug 2026",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    quote: "Living thousands of miles away in California, we were yearning to do Rudrabhishek for our 25th wedding anniversary. Seeing the priest pronounce our Gotra live on Zoom and receiving the sanctified Bhasma parcel in just 4 days felt magical!",
    hasVideo: true,
    verifiedDevotee: true
  },
  {
    id: 2,
    name: "Deepak S. Iyer",
    city: "Bengaluru, Karnataka",
    pujaName: "Kaal Sarp Dosh Nivaran at Ujjain",
    date: "28 Aug 2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    quote: "The transparency is unbelievable. The 6-step booking stepper made it so simple to fill gotra, the live darshan queue meter was spot on, and the 80G tax receipt was generated instantly into my account.",
    hasVideo: false,
    verifiedDevotee: true
  },
  {
    id: 3,
    name: "Kavita Singhal",
    city: "Jaipur, Rajasthan",
    pujaName: "Ram Lalla Chadhava & Tulsi Seva at Ayodhya",
    date: "02 Sept 2026",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    quote: "The unique deep blue and gold aesthetic of MandirVeda is so serene compared to loud yellow websites. Everything feels dignified, authentic, and truly sacred.",
    hasVideo: true,
    verifiedDevotee: true
  }
];

export const MOCK_USER_BOOKINGS = [
  {
    id: "MV-2026-8942",
    pujaTitle: "Maha Rudrabhishek with 11 Dravyas",
    templeName: "Shri Kashi Vishwanath Temple, Varanasi",
    date: "Scheduled: 14 Sept 2026 • 07:30 AM",
    devotees: ["Kaushal Singh (Kashyap Gotra)", "Pooja Singh (Kashyap Gotra)"],
    status: "Confirmed & Priest Assigned",
    statusBadge: "Upcoming Live",
    amountPaid: 2101,
    paymentMethod: "UPI (Google Pay)",
    taxReceiptNo: "MV-80G-2026-08942",
    streamLink: "https://mandirveda.com/live/sanctum-kv-8942",
    prasadTracking: {
      trackingNumber: "INDPOST-77382910IN",
      courier: "India Post Speed Sacred Post",
      statusText: "Sanctum Pouch Sealed",
      currentStep: 3,
      steps: [
        { label: "Sankalpa Registered", date: "08 Sep 11:30 AM", completed: true },
        { label: "Vedic Priest Allocated", date: "08 Sep 12:05 PM", completed: true },
        { label: "Sanctum Pouch Sealed", date: "08 Sep 12:45 PM", completed: true },
        { label: "Dispatched via Express Courier", date: "Expected 14 Sep", completed: false },
        { label: "Delivered to Home Address", date: "Expected 16 Sep", completed: false }
      ]
    }
  },
  {
    id: "MV-2026-7410",
    pujaTitle: "Maa Baglamukhi Shatru Vinashak Yagya",
    templeName: "Maa Kamakhya Nilachal Sanctum, Guwahati",
    date: "Completed: 22 Aug 2026 • 09:00 AM",
    devotees: ["Kaushal Singh (Kashyap Gotra)"],
    status: "Completed & Blessed",
    statusBadge: "Completed",
    amountPaid: 2501,
    paymentMethod: "Rupay Card (Ending 4092)",
    taxReceiptNo: "MV-80G-2026-07410",
    streamLink: "https://mandirveda.com/recordings/km-7410",
    prasadTracking: {
      trackingNumber: "BLUEDART-8839021",
      courier: "BlueDart Sacred Cold-Chain",
      statusText: "Delivered & Received",
      currentStep: 5,
      steps: [
        { label: "Sankalpa Registered", date: "20 Aug 10:00 AM", completed: true },
        { label: "Priest Officiated", date: "22 Aug 09:00 AM", completed: true },
        { label: "Sanctum Pouch Sealed", date: "22 Aug 02:00 PM", completed: true },
        { label: "Dispatched via Courier", date: "23 Aug 11:00 AM", completed: true },
        { label: "Delivered to Devotee", date: "25 Aug 04:30 PM", completed: true }
      ]
    }
  }
];

export const MOCK_CHADHAVA_BOOKINGS = [
  {
    id: "CH-2026-3021",
    itemName: "Silver Chhatra (Crown of Grace)",
    templeName: "Shri Kashi Vishwanath, Varanasi",
    date: "Offered on 28 Aug 2026",
    devoteeName: "Kaushal Singh",
    gotra: "Kashyap",
    amount: 1100,
    receiptNo: "CH-RCP-2026-3021",
    status: "Offered at Sanctum"
  },
  {
    id: "CH-2026-1940",
    itemName: "Go-gras (Cow Seva) 11 Indigenous Cows",
    templeName: "Banke Bihari Gaushala, Vrindavan",
    date: "Offered on 15 Aug 2026",
    devoteeName: "Kaushal Singh",
    gotra: "Kashyap",
    amount: 351,
    receiptNo: "CH-RCP-2026-1940",
    status: "Seva Completed"
  }
];
