// Services & Products Dataset mapped by 8 Sacred Domains

export const CATEGORY_DOMAINS = [
  {
    slug: 'pooja-essentials',
    title: 'Pooja Essentials',
    tag: 'SACRED ESSENTIALS',
    description: 'Everything you need for your daily pooja including lamps, camphor, incense sticks, cotton wicks, pooja plates, bells, and sacred accessories.'
  },
  {
    slug: 'temple-prasadam',
    title: 'Temple Prasadam',
    tag: 'DIVINE BLESSINGS',
    description: 'Order authentic temple prasadam such as Laddu, Panchamirtham, Puliyodarai, Chakkarai Pongal, Holy Vibhuti, and Kumkum.'
  },
  {
    slug: 'spiritual-accessories',
    title: 'Spiritual Accessories',
    tag: 'HOLY ADORNMENTS',
    description: 'Premium Rudraksha malas, Tulsi malas, crystal malas, divine pendants, bracelets, and sacred accessories.'
  },
  {
    slug: 'idols-and-frames',
    title: 'Divine Idols & Frames',
    tag: 'SANCTUM ART',
    description: 'Beautiful handcrafted brass idols and devotional photo frames for your home temple.'
  },
  {
    slug: 'lamps-and-pooja-items',
    title: 'Brass Lamps & Pooja Items',
    tag: 'BRASSWARE & LIGHT',
    description: 'Traditional brass lamps, aarthi plates, kalasam, bells, deepams, and pooja utensils.'
  },
  {
    slug: 'spiritual-books',
    title: 'Sacred Books',
    tag: 'DIVINE WISDOM',
    description: 'Bhagavad Gita, Ramayanam, Vishnu Sahasranamam, Lalitha Sahasranamam, Hanuman Chalisa, and devotional books.'
  },
  {
    slug: 'temple-offerings',
    title: 'Temple Offerings',
    tag: 'RITUAL OFFERINGS',
    description: 'Coconut, flower garlands, fruits, silk vastram, honey, milk, ghee, and offerings for temple rituals.'
  },
  {
    slug: 'devotional-wear',
    title: 'Traditional Devotional Wear',
    tag: 'TEMPLE ATTIRE',
    description: 'Silk sarees, veshti, angavastram, pooja shawls, and traditional temple clothing.'
  }
];

export const ALL_CATEGORY_PRODUCTS = {
  'pooja-essentials': [
    {
      id: 'pe-1',
      name: 'Pure Cow Ghee Diya Pack (100 Pcs)',
      categorySlug: 'pooja-essentials',
      categoryTitle: 'Pooja Essentials',
      price: 299,
      formattedPrice: '₹299',
      shortDesc: 'Ready-to-use pure cow ghee wicks for daily evening deeparadhana.',
      fullDesc: 'Handmade pure cow ghee wicks infused with natural camphor scent. Burns smoothly for 25-30 minutes, creating a divine sattvic atmosphere in your home temple.',
      badgeText: 'Bestseller',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'pe-2',
      name: 'Organic Bhimseni Camphor & Dhoop Pack',
      categorySlug: 'pooja-essentials',
      categoryTitle: 'Pooja Essentials',
      price: 199,
      formattedPrice: '₹199',
      shortDesc: 'Pure 100% natural edible Bhimseni camphor & herbal dhoop cones.',
      fullDesc: '100% pure Bhimseni camphor sourced directly from natural pine resin. Leaves zero residue and emits powerful purifying aromas.',
      badgeText: 'Pure Vedic',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1545232979-fbfd42e000b5?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'pe-3',
      name: 'Brass Pooja Thali Set (7 Pieces)',
      categorySlug: 'pooja-essentials',
      categoryTitle: 'Pooja Essentials',
      price: 799,
      formattedPrice: '₹799',
      shortDesc: 'Heavyweight brass thali with bell, diya, agarbatti stand, and cups.',
      fullDesc: 'Artisanal solid brass pooja thali handcrafted by traditional South Indian brass smiths. Includes 1 main plate, 2 katori, 1 incense holder, 1 bell, 1 diya, and 1 kalasam.',
      badgeText: 'Handcrafted',
      badgeType: 'amber',
      image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'Available'
    },
    {
      id: 'pe-4',
      name: 'Mysore Sandal Paste & Holy Kumkum Combo',
      categorySlug: 'pooja-essentials',
      categoryTitle: 'Pooja Essentials',
      price: 149,
      formattedPrice: '₹149',
      shortDesc: 'Pure Mysore sandalwood paste and natural turmeric kumkum.',
      fullDesc: 'Prepared from authentic pure Mysore sandalwood blocks. Accompanied by fragrant natural turmeric-derived temple kumkum.',
      badgeText: 'Sacred',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    }
  ],

  'temple-prasadam': [
    {
      id: 'tp-1',
      name: 'Palani Panchamirtham (500g Sealed Tin)',
      categorySlug: 'temple-prasadam',
      categoryTitle: 'Temple Prasadam',
      price: 251,
      formattedPrice: '₹251',
      shortDesc: 'GI-tagged authentic Palani Murugan Temple Panchamirtham prasadam.',
      fullDesc: 'Prepared using traditional hill banana, jaggery, pure ghee, honey, cardamom, and dates under temple kitchen supervision.',
      badgeText: 'GI Tagged',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'Fresh Daily'
    },
    {
      id: 'tp-2',
      name: 'Tirupati Style Ghee Laddu (4 Pcs Pack)',
      categorySlug: 'temple-prasadam',
      categoryTitle: 'Temple Prasadam',
      price: 301,
      formattedPrice: '₹301',
      shortDesc: 'Aromatic pure cow ghee laddus prepared with cashews and raisins.',
      fullDesc: 'Authentic temple recipe laddus made with pure ghee, gram flour, sugar candy (kalkandu), cashew nuts, and aromatic cardamom.',
      badgeText: 'Popular',
      badgeType: 'amber',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'tp-3',
      name: 'Srirangam Puliyodarai & Pongal Combo',
      categorySlug: 'temple-prasadam',
      categoryTitle: 'Temple Prasadam',
      price: 351,
      formattedPrice: '₹351',
      shortDesc: 'Traditional tamarind rice mix & Sakkarai Pongal prasadam box.',
      fullDesc: 'Blessed temple style tamarind rice paste (Pulikachal) and delicious sweet Pongal box prepared with organic raw rice and jaggery.',
      badgeText: 'Temple Kitchen',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'tp-4',
      name: 'Sacred Mahaprashad & Holy Vibhuti Box',
      categorySlug: 'temple-prasadam',
      categoryTitle: 'Temple Prasadam',
      price: 151,
      formattedPrice: '₹151',
      shortDesc: 'Pure cow dung vibhuti, kumkum, and sanctified dry fruit prasadam.',
      fullDesc: 'Sanctified dry fruits (cashew, raisin, almonds) packed alongside pure cow dung bhasma (Vibhuti) and Srivilliputhur kumkum.',
      badgeText: 'Blessed',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    }
  ],

  'spiritual-accessories': [
    {
      id: 'sa-1',
      name: 'Original 5 Mukhi Nepal Rudraksha Mala (108 Beads)',
      categorySlug: 'spiritual-accessories',
      categoryTitle: 'Spiritual Accessories',
      price: 1251,
      formattedPrice: '₹1,251',
      shortDesc: 'Certified natural 5 Mukhi Himalayan Rudraksha mala with certificate.',
      fullDesc: '100% genuine Nepal 5 Mukhi Rudraksha beads strung on pure silk thread with traditional knots. Lab certified for authenticity.',
      badgeText: 'Lab Certified',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'sa-2',
      name: 'Natural Vrindavan Tulsi Japa Mala',
      categorySlug: 'spiritual-accessories',
      categoryTitle: 'Spiritual Accessories',
      price: 499,
      formattedPrice: '₹499',
      shortDesc: 'Handcrafted sacred Tulsi wood bead mala for Vishnu & Krishna japa.',
      fullDesc: 'Handcrafted from authentic Vrindavan Tulsi wood stems. Known for bringing calm, focus, and positive spiritual vibrations during meditation.',
      badgeText: 'Vrindavan Tulsi',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1545232979-fbfd42e000b5?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'sa-3',
      name: 'Pure Sphatik (Crystal) Rosary Mala',
      categorySlug: 'spiritual-accessories',
      categoryTitle: 'Spiritual Accessories',
      price: 799,
      formattedPrice: '₹799',
      shortDesc: 'Cooling natural quartz crystal Sphatik mala for Lakshmi & Shiva stotram.',
      fullDesc: 'Natural transparent Sphatik beads known for reducing body heat, enhancing concentration, and attracting wealth and peace.',
      badgeText: 'Natural Quartz',
      badgeType: 'amber',
      image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'Limited'
    }
  ],

  'idols-and-frames': [
    {
      id: 'if-1',
      name: 'Handcrafted Brass Lord Ganesha Idol (6 Inch)',
      categorySlug: 'idols-and-frames',
      categoryTitle: 'Divine Idols & Frames',
      price: 1499,
      formattedPrice: '₹1,499',
      shortDesc: 'Solid brass Vinayagar idol with intricate detailing and antique finish.',
      fullDesc: 'Heavy pure brass Lord Ganesha statue handcrafted using lost-wax casting. Ideal for home temple altar, desk, or sacred gift.',
      badgeText: 'Solid Brass',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'if-2',
      name: 'Antique Brass Shiva Nataraja Statue (8 Inch)',
      categorySlug: 'idols-and-frames',
      categoryTitle: 'Divine Idols & Frames',
      price: 2499,
      formattedPrice: '₹2,499',
      shortDesc: 'Cosmic dance Shiva Nataraja idol in classic Chola bronze styling.',
      fullDesc: 'Exquisite classic Nataraja figure surrounded by the halo of cosmic fire (Prabha Mandala). Weight 1.8 kg.',
      badgeText: 'Chola Classic',
      badgeType: 'amber',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'if-3',
      name: '24K Gold-Foil Framed Tanjore Goddess Lakshmi',
      categorySlug: 'idols-and-frames',
      categoryTitle: 'Divine Idols & Frames',
      price: 1899,
      formattedPrice: '₹1,899',
      shortDesc: 'Rich Tanjore style photo frame with genuine 24K gold foil work.',
      fullDesc: 'Traditional Tanjore painting frame depicting Goddess Mahalakshmi with 24K gold foil embellishments and teakwood frame.',
      badgeText: '24K Gold Foil',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    }
  ],

  'lamps-and-pooja-items': [
    {
      id: 'lp-1',
      name: 'Kerala Samayapuram Kuthu Vilakku (Pair - 12 Inch)',
      categorySlug: 'lamps-and-pooja-items',
      categoryTitle: 'Brass Lamps & Pooja Items',
      price: 1999,
      formattedPrice: '₹1,999',
      shortDesc: 'Traditional 5-face standing brass oil lamp pair.',
      fullDesc: 'Heavyweight brass standing lamps with 5 wicks for grand daily lighting. Spreads divine aura and warm golden glow.',
      badgeText: 'Heavy Brass',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'lp-2',
      name: 'Hanging Brass Kamakshi Deepam Lamp',
      categorySlug: 'lamps-and-pooja-items',
      categoryTitle: 'Brass Lamps & Pooja Items',
      price: 1299,
      formattedPrice: '₹1,299',
      shortDesc: 'Ornate hanging brass oil lamp featuring Goddess Kamakshi motif.',
      fullDesc: 'Traditional temple hanging lamp with brass chain and peacock motif top hook.',
      badgeText: 'Traditional',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1545232979-fbfd42e000b5?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    }
  ],

  'spiritual-books': [
    {
      id: 'sb-1',
      name: 'Srimad Bhagavad Gita (Original Sanskrit & English)',
      categorySlug: 'spiritual-books',
      categoryTitle: 'Sacred Books',
      price: 399,
      formattedPrice: '₹399',
      shortDesc: 'Deluxe hardcover edition with verse-by-verse translation & commentary.',
      fullDesc: 'Complete 18 chapters of Bhagavad Gita with clear Devanagari Sanskrit text, word-by-word meanings, and inspiring commentary.',
      badgeText: 'Hardcover',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'sb-2',
      name: 'Vishnu Sahasranamam & Lalitha Sahasranamam Book',
      categorySlug: 'spiritual-books',
      categoryTitle: 'Sacred Books',
      price: 199,
      formattedPrice: '₹199',
      shortDesc: '1000 Names of Lord Vishnu & Goddess Lalitha with meaning.',
      fullDesc: 'Pocket companion for daily chanting containing full text of Sri Vishnu Sahasranama Stotram and Lalitha Sahasranamam.',
      badgeText: 'Stotram',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    }
  ],

  'temple-offerings': [
    {
      id: 'to-1',
      name: 'Sacred 108 Fresh Lotus Flowers Offering Pack',
      categorySlug: 'temple-offerings',
      categoryTitle: 'Temple Offerings',
      price: 501,
      formattedPrice: '₹501',
      shortDesc: 'Fresh pink lotus flowers harvested daily for Mahalakshmi & Shiva archana.',
      fullDesc: '108 fresh handpicked pink lotus blooms delivered directly to temple priests for Sahasranama Archana.',
      badgeText: 'Fresh Daily',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'Available Today'
    },
    {
      id: 'to-2',
      name: 'Fresh Jasmine & Marigold Garland Set (6 Ft)',
      categorySlug: 'temple-offerings',
      categoryTitle: 'Temple Offerings',
      price: 351,
      formattedPrice: '₹351',
      shortDesc: 'Fragrant Madurai Malligai & golden marigold garland set.',
      fullDesc: 'Woven using fresh Madurai jasmine buds and vibrant marigold flowers for deity alangaram.',
      badgeText: 'Fragrant',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'Available Today'
    }
  ],

  'devotional-wear': [
    {
      id: 'dw-1',
      name: 'Pure Kanchipuram Silk Angavastram Shawl',
      categorySlug: 'devotional-wear',
      categoryTitle: 'Traditional Devotional Wear',
      price: 1499,
      formattedPrice: '₹1,499',
      shortDesc: 'Handwoven pure silk angavastram with zari border for temple rituals.',
      fullDesc: 'Traditional maroon/gold handloom silk upper cloth (Angavastram) worn by devotees and priests during temple ceremonies.',
      badgeText: 'Pure Silk',
      badgeType: 'amber',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    },
    {
      id: 'dw-2',
      name: 'Traditional South Indian Cotton Dhoti / Veshti',
      categorySlug: 'devotional-wear',
      categoryTitle: 'Traditional Devotional Wear',
      price: 699,
      formattedPrice: '₹699',
      shortDesc: 'Premium 100% combed cotton white veshti with gold zari border.',
      fullDesc: 'Superfine cotton 8-yards veshti set with traditional Mayilkan zari border. Soft, breathable, and elegant for temple visits.',
      badgeText: '100% Cotton',
      badgeType: 'green',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      stockStatus: 'In Stock'
    }
  ]
};

// Helper: Get products strictly filtered by category slug
export function getProductsByCategory(categorySlug) {
  const normalizedSlug = categorySlug || 'pooja-essentials';
  return ALL_CATEGORY_PRODUCTS[normalizedSlug] || ALL_CATEGORY_PRODUCTS['pooja-essentials'];
}

// Helper: Get domain metadata by category slug
export function getCategoryDomain(categorySlug) {
  const normalizedSlug = categorySlug || 'pooja-essentials';
  return CATEGORY_DOMAINS.find(d => d.slug === normalizedSlug) || CATEGORY_DOMAINS[0];
}

// Helper: Get single product item by ID across all categories
export function getProductById(productId) {
  for (const catKey in ALL_CATEGORY_PRODUCTS) {
    const item = ALL_CATEGORY_PRODUCTS[catKey].find(p => p.id === productId);
    if (item) return item;
  }
  return ALL_CATEGORY_PRODUCTS['pooja-essentials'][0];
}

// API Integration wrapper with MongoDB fetch fallback
export async function fetchCategoryProductsFromAPI(categorySlug) {
  try {
    const response = await fetch(`/api/products?category=${categorySlug}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`MongoDB API fetch notice for ${categorySlug}, using rich dataset:`, err);
  }
  return getProductsByCategory(categorySlug);
}
