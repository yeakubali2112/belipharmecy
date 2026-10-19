/**
 * Bangladesh Medicine Search Engine
 * Supports bilingual search: Bengali (বাংলা) & English
 * Searches Brand Names, Generics, Companies, Indications, Symptoms & Dosage Forms
 */
export function expandCompactMedicine(t) {
  if (!t || !Array.isArray(t)) return null;
  return {
    id: t[0],
    name: t[1],
    nameBn: t[2] || t[1],
    generic: t[3],
    genericBn: t[3],
    company: t[4],
    category: t[5],
    type: t[6],
    stripSize: t[7],
    pricePerUnit: t[8],
    pricePerStrip: t[9],
    requiresPrescription: Boolean(t[10]),
    discountPercent: 5,
    stock: 250,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    description: t[4] + ' কর্তৃক প্রস্তুতকৃত মানসম্মত ' + t[1] + ' (' + t[6] + ')।',
    indications: 'চিকিৎসকের পরামর্শ ও প্রেসক্রিপশন অনুযায়ী সেব্য।',
    dosage: 'ডাক্তারের নির্দেশিত মাত্রায় আহারের পর বা পূর্বে সেবনীয়।',
    sideEffects: 'পার্শ্বপ্রতিক্রিয়া দেখা দিলে চিকিৎসকের পরামর্শ নিন।'
  };
}

let bd50kCache = null;
let bd50kLoadingPromise = null;

export function preload50kMedicines() {
  if (bd50kCache) return Promise.resolve(bd50kCache);
  if (bd50kLoadingPromise) return bd50kLoadingPromise;
  bd50kLoadingPromise = import('../data/bangladeshMedicines50k.js')
    .then(mod => {
      bd50kCache = mod.BANGLADESH_50K_MEDICINES;
      return bd50kCache;
    })
    .catch(() => null);
  return bd50kLoadingPromise;
}

// Bengali phonetic & synonym mapping for Bangladesh pharmaceuticals and medical terms
export const BANGLA_SYNONYM_MAP = {
  // Brand Names & Generics
  'নাপা': ['napa', 'paracetamol'],
  'নাপা এক্সট্রা': ['napa extra', 'paracetamol', 'caffeine'],
  'নাপা এক্সটেন্ড': ['napa extend', 'paracetamol'],
  'নাপা র্যাপিড': ['napa rapid', 'paracetamol'],
  'নাপা সিরাপ': ['napa syrup', 'paracetamol'],
  'নাপা ড্রপ': ['napa drop', 'paracetamol'],
  'এইস': ['ace', 'paracetamol'],
  'এইস প্লাস': ['ace plus', 'paracetamol', 'caffeine'],
  'সারজেল': ['sergel', 'esomeprazole'],
  'সেক্লো': ['seclo', 'omeprazole'],
  'ম্যাক্সপ্রো': ['maxpro', 'esomeprazole'],
  'প্যান্টোনিক্স': ['pantonix', 'pantoprazole'],
  'লুসেক্টিল': ['losectil', 'omeprazole'],
  'ফিনিক্স': ['finix', 'rabeprazole'],
  'ইসোরাল': ['esoral', 'esomeprazole'],
  'নেক্সাম': ['nexum', 'esomeprazole'],
  'অ্যালাট্রোল': ['alatrol', 'cetirizine'],
  'ফেক্সো': ['fexo', 'fexofenadine'],
  'মোনাস': ['monas', 'montelukast'],
  'প্রোভাইয়ার': ['provair', 'montelukast'],
  'এবাতিন': ['ebatin', 'ebastine'],
  'বিলাস্টিন': ['bilastin', 'bilasten'],
  'টোফেন': ['tofen', 'ketotifen'],
  'সিপ্রোসিন': ['ciprocin', 'ciprofloxacin'],
  'জিম্যাক্স': ['zimax', 'azithromycin'],
  'অ্যাজিথ্রাল': ['azithral', 'azithromycin'],
  'সেফ-৩': ['cef-3', 'cefixime'],
  'সেফ ৩': ['cef-3', 'cefixime'],
  'মক্সাক্ল্যাভ': ['moxaclav', 'amoxicillin', 'clavulanic'],
  'আমোক্লাভ': ['amoclav', 'amoxicillin'],
  'ফিলমেট': ['filmet', 'metronidazole'],
  'ফ্ল্যাজিল': ['flagyl', 'metronidazole'],
  'অ্যামোডিস': ['amodis', 'metronidazole'],
  'ক্যালবো': ['calbo', 'calcium'],
  'ক্যালবো ডি': ['calbo-d', 'calcium', 'vitamin d3'],
  'কোরালক্যাল': ['coralcal', 'calcium', 'vitamin d3'],
  'ডি রাইজ': ['d-rise', 'cholecalciferol', 'vitamin d3'],
  'সিভিট': ['cevit', 'vitamin c', 'ascorbic'],
  'ভিটাসিট': ['vitacit', 'vitamin c'],
  'বি ৫০': ['b-50', 'vitamin b complex'],
  'বি-৫০': ['b-50', 'vitamin b complex'],
  'নিউরো বি': ['neuro-b', 'vitamin b1 b6 b12'],
  'নিউরোবিয়ন': ['neurobion', 'vitamin b'],
  'জিংক': ['zinc', 'zincat'],
  'স্যালাইন': ['saline', 'ors', 'orsaline'],
  'ওরস্যালাইন': ['orsaline', 'ors', 'saline'],
  'টেস্ট মি': ['taste me', 'ors', 'saline'],
  'কম্প্রিড': ['comprid', 'glimepiride'],
  'জি মেট': ['g-met', 'metformin'],
  'জি-মেট': ['g-met', 'metformin'],
  'লিনাগ্লিপ': ['linaglip', 'linagliptin'],
  'ইনসুলিন': ['insulin', 'mixtard', 'novorapid', 'lantus'],
  'ওসারটিল': ['osartil', 'losartan'],
  'অ্যাঞ্জিলক': ['angilock', 'losartan'],
  'বিজোরান': ['bizoran', 'amlodipine', 'olmesartan'],
  'ক্যামলোসার্ট': ['camlosart', 'amlodipine', 'losartan'],
  'কার্ডিবিল': ['cardibis', 'bisoprolol'],
  'বিসলল': ['bislol', 'bisoprolol'],
  'ইকোস্প্রিন': ['ecosprin', 'aspirin'],
  'ক্লোফেনাক': ['clofenac', 'diclofenac'],
  'ভোভারেন': ['voveran', 'diclofenac'],
  'ন্যাপ্রোক্সেন': ['naproxen', 'napryn'],
  'টরাক্স': ['torax', 'ketorolac'],
  'রোল্যাক': ['rolac', 'ketorolac'],
  'ইটোরিক্স': ['etorix', 'etoricoxib'],
  'গ্যাভিস্কন': ['gaviscon', 'antacid'],
  'এন্টাসিড': ['entacyd', 'antacid'],
  'মোটিগাট': ['motigut', 'domperidone'],
  'অমিডন': ['omidon', 'domperidone'],
  'ইমিস্ট্যাট': ['emistat', 'ondansetron'],
  'অনস্যাট': ['onsat', 'ondansetron'],
  'রিভোট্রিল': ['rivotril', 'clonazepam'],
  'ক্লোনাপ': ['clonap', 'clonazepam'],
  'সেডিল': ['sedil', 'diazepam'],
  'স্যাভলন': ['savlon', 'antiseptic'],
  'ডেটোল': ['dettol', 'antiseptic'],
  'পভিসেপ': ['povisep', 'povidone'],
  'ভিওডিন': ['viodin', 'povidone'],
  'অ্যাডোভাস': ['adovas', 'vasaka', 'cough'],
  'তুসকা': ['tussca', 'cough'],
  'মিরাকফ': ['mirakof', 'cough'],
  'ভেন্টোলিন': ['ventolin', 'salbutamol', 'inhaler'],
  'বেক্সিট্রল': ['bexitrol', 'inhaler'],

  // Symptoms & Conditions
  'জ্বর': ['fever', 'napa', 'ace', 'paracetamol'],
  'মাথাব্যথা': ['headache', 'migraine', 'napa extra', 'ace plus'],
  'ব্যথা': ['pain', 'relief', 'clofenac', 'naproxen', 'torax'],
  'শরীর ব্যথা': ['body pain', 'fever', 'napa extra'],
  'দাঁত ব্যথা': ['toothache', 'pain', 'torax', 'rolac', 'clofenac'],
  'গ্যাস্ট্রিক': ['gastric', 'acidity', 'seclo', 'sergel', 'maxpro', 'pantonix', 'omeprazole', 'esomeprazole'],
  'এসিডিটি': ['acidity', 'heartburn', 'gastric', 'antacid'],
  'বুক জ্বালা': ['heartburn', 'acidity', 'gastric', 'gaviscon'],
  'বদহজম': ['indigestion', 'gastric', 'antacid', 'motigut'],
  'কাশি': ['cough', 'adovas', 'tussca', 'mirakof', 'syrup'],
  'শুকনা কাশি': ['dry cough', 'mirakof', 'tussca'],
  'সর্দি': ['cold', 'flu', 'alatrol', 'fexo', 'runny nose'],
  'ঠান্ডা': ['cold', 'flu', 'fever', 'napa', 'alatrol'],
  'অ্যালার্জি': ['allergy', 'alatrol', 'fexo', 'ebatin', 'cetirizine'],
  'চুলকানি': ['itching', 'allergy', 'alatrol', 'dermasol'],
  'হাঁপানি': ['asthma', 'monas', 'provair', 'inhaler', 'ventolin', 'bexitrol'],
  'শ্বাসকষ্ট': ['breath', 'asthma', 'inhaler', 'ventolin'],
  'ডায়রিয়া': ['diarrhea', 'orsaline', 'saline', 'flagyl', 'filmet'],
  'পাতলা পায়খানা': ['diarrhea', 'loose motion', 'orsaline', 'taste me'],
  'বমি': ['vomit', 'nausea', 'emistat', 'onsat', 'motigut'],
  'দুর্বলতা': ['weakness', 'vitamin', 'calbo', 'b-50', 'neuro-b'],
  'ক্যালসিয়াম': ['calcium', 'calbo', 'coralcal', 'ostocal'],
  'ভিটামিন': ['vitamin', 'cevit', 'b-50', 'neuro-b', 'vitacit'],
  'প্রেশার': ['pressure', 'bp', 'osartil', 'bizoran', 'angilock', 'hypertension'],
  'উচ্চ রক্তচাপ': ['high blood pressure', 'hypertension', 'osartil', 'bizoran'],
  'ডায়াবেটিস': ['diabetes', 'sugar', 'comprid', 'g-met', 'linaglip', 'insulin'],
  'ইনহেলার': ['inhaler', 'bexitrol', 'ventolin', 'salbair'],
  'অ্যান্টিবায়োটিক': ['antibiotic', 'ciprocin', 'zimax', 'cef-3', 'moxaclav', 'azithral']
};

/**
 * Normalizes text by trimming, lowercasing, converting Bengali numerals, and stripping special punctuation
 */
export function normalizeText(text) {
  if (!text) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let str = text.toString().toLowerCase();
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(bnDigits[i], String(i));
  }
  return str
    .replace(/[,\/\-_+()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a string contains Bengali Unicode characters
 */
export function hasBengaliChars(text) {
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * Expands search query with translated tokens and synonyms
 */
export function expandQueryTokens(query) {
  const normQuery = normalizeText(query);
  if (!normQuery) return [];

  const rawTokens = normQuery.split(' ').filter(Boolean);
  const tokenSet = new Set(rawTokens);

  // Check entire query in Bangla map
  if (BANGLA_SYNONYM_MAP[normQuery]) {
    BANGLA_SYNONYM_MAP[normQuery].forEach(syn => {
      syn.split(' ').forEach(t => tokenSet.add(t));
    });
  }

  // Check individual tokens
  for (const token of rawTokens) {
    if (BANGLA_SYNONYM_MAP[token]) {
      BANGLA_SYNONYM_MAP[token].forEach(syn => {
        syn.split(' ').forEach(t => tokenSet.add(t));
      });
    }
    // Partial substring matches in keys
    for (const [key, synonyms] of Object.entries(BANGLA_SYNONYM_MAP)) {
      if (key.includes(token) || token.includes(key)) {
        synonyms.forEach(syn => {
          syn.split(' ').forEach(t => tokenSet.add(t));
        });
      }
    }
  }

  return Array.from(tokenSet);
}

/**
 * Normalizes a medicine name for deduplication.
 * E.g. "Ciprocin 500" and "Ciprocin 500mg" map to the same key
 * E.g. "Maxpro 20" and "Maxpro 20mg" map to the same key
 * E.g. "Seclo 20" and "Seclo 20mg" map to the same key
 */
export function getMedicineDedupeKey(med) {
  if (!med || !med.name) return '';
  return (med.name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/(?:mg|ml|gm|mcg|iu|µg)\b/gi, '')
    .replace(/[^a-z0-9\u0980-\u09ff]/g, '');
}

/**
 * Deduplicates a list of medicines to remove identical items (e.g. "Ciprocin 500" vs "Ciprocin 500mg").
 * Always keeps the canonical item with standard dosage suffix (e.g. "500mg") and custom photo.
 */
export function deduplicateMedicines(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) return arr || [];
  const map = new Map();
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    const med = arr[i];
    if (!med || !med.name) continue;
    const dedupeKey = getMedicineDedupeKey(med);

    if (map.has(dedupeKey)) {
      const idx = map.get(dedupeKey);
      const existing = result[idx];
      const existingHasMg = /\d+\s*mg\b/i.test(existing.name);
      const currentHasMg = /\d+\s*mg\b/i.test(med.name);
      const currentHasImage = med.image && med.image.startsWith('data:image/');
      const existingHasImage = existing.image && existing.image.startsWith('data:image/');

      if ((!existingHasMg && currentHasMg) || (currentHasImage && !existingHasImage)) {
        result[idx] = {
          ...existing,
          ...med,
          image: currentHasImage ? med.image : (existingHasImage ? existing.image : med.image),
          stock: Math.max(existing.stock || 0, med.stock || 0)
        };
      }
    } else {
      map.set(dedupeKey, result.length);
      result.push(med);
    }
  }

  return result;
}

/**
 * Calculates a match score for a medicine given the search query
 * Higher score = higher relevance
 */
export function scoreMedicine(med, query, expandedTokens = []) {
  if (!query || !query.trim()) return 0;

  const rawQ = query.trim().toLowerCase();
  const normQ = normalizeText(query);
  const rawTokens = normQ.split(' ').filter(Boolean);
  const significantTokens = rawTokens.filter(t => !/^\d+$/.test(t) && !['mg', 'ml', 'gm', 'mcg', 'iu', 'tablet', 'tab', 'capsule', 'cap', 'syrup', 'drop', 'suspension'].includes(t));

  const name = (med.name || '').toLowerCase();
  const normName = normalizeText(med.name);
  const nameBn = (med.nameBn || '').toLowerCase();
  const generic = (med.generic || '').toLowerCase();
  const normGeneric = normalizeText(med.generic);
  const genericBn = (med.genericBn || '').toLowerCase();
  const company = (med.company || '').toLowerCase();
  const indications = (med.indications || '').toLowerCase();
  const description = (med.description || '').toLowerCase();
  const category = (med.category || '').toLowerCase();
  const keywords = Array.isArray(med.keywords) ? med.keywords.map(k => k.toLowerCase()) : [];

  // CRITICAL EXACTNESS RULE:
  // If user searched for significant brand/generic words (e.g. "ciprocin" in "ciprocin 500"):
  // The candidate medicine MUST match at least one significant token in name, generic or keywords!
  // Prevents unrelated medicines (like Savlon 500ml, Cerox 500mg) from appearing when searching "Ciprocin 500"
  if (significantTokens.length > 0) {
    const matchesSig = significantTokens.some(st => 
      normName.includes(st) || 
      name.includes(st) || 
      (nameBn && nameBn.includes(st)) ||
      normGeneric.includes(st) || 
      generic.includes(st) || 
      (genericBn && genericBn.includes(st)) ||
      keywords.some(k => k.includes(st)) ||
      (BANGLA_SYNONYM_MAP[st] && BANGLA_SYNONYM_MAP[st].some(syn => normName.includes(syn) || normGeneric.includes(syn)))
    );
    if (!matchesSig) {
      return 0; // Disqualify immediately!
    }
  }

  let score = 0;

  // 1. Exact Name Matches (Highest Priority)
  if (normName === normQ || name === rawQ || nameBn === rawQ) {
    return 1000;
  }
  if (BANGLA_SYNONYM_MAP[normQ] && BANGLA_SYNONYM_MAP[normQ].length > 0) {
    const primarySyn = normalizeText(BANGLA_SYNONYM_MAP[normQ][0]);
    if (normName === primarySyn) {
      return 1000;
    }
  } else if (BANGLA_SYNONYM_MAP[rawQ] && BANGLA_SYNONYM_MAP[rawQ].length > 0) {
    const primarySyn = normalizeText(BANGLA_SYNONYM_MAP[rawQ][0]);
    if (normName === primarySyn) {
      return 1000;
    }
  }

  // 2. Name Starts With Query
  if (normName.startsWith(normQ) || (nameBn && nameBn.startsWith(rawQ))) {
    score += 500;
  }

  // 3. Name Contains Query
  if (normName.includes(normQ) || name.includes(rawQ) || (nameBn && nameBn.includes(rawQ))) {
    score += 300;
  }

  // 4. Exact / Prefix Match on Generic
  if (normGeneric === normQ || generic === rawQ) {
    score += 250;
  } else if (normGeneric.startsWith(normQ) || (genericBn && genericBn.startsWith(rawQ))) {
    score += 200;
  } else if (normGeneric.includes(normQ) || generic.includes(rawQ) || (genericBn && genericBn.includes(rawQ))) {
    score += 150;
  }

  // 5. Keyword Matches
  for (const kw of keywords) {
    if (kw === rawQ || kw === normQ) {
      score += 220;
    } else if (kw.startsWith(normQ)) {
      score += 120;
    } else if (kw.includes(normQ)) {
      score += 80;
    }
  }

  // 6. Company Match
  if (company.includes(normQ)) {
    score += 70;
  }

  // 7. Indications & Description Matches (Symptoms/Diseases)
  if (indications.includes(normQ) || (indications && indications.includes(rawQ))) {
    score += 60;
  }
  if (description.includes(normQ) || (description && description.includes(rawQ))) {
    score += 40;
  }

  // 8. Category Match
  if (category.includes(normQ)) {
    score += 50;
  }

  // 9. Multi-token evaluation with expanded Bangla/English tokens
  let tokenMatches = 0;
  for (const token of expandedTokens) {
    if (!token || token.length < 2) continue;
    let tokenHit = false;

    if (normName.includes(token)) {
      score += 90;
      tokenHit = true;
    }
    if (normGeneric.includes(token)) {
      score += 70;
      tokenHit = true;
    }
    if (keywords.some(k => k.includes(token))) {
      score += 50;
      tokenHit = true;
    }
    if (indications.includes(token) || description.includes(token)) {
      score += 35;
      tokenHit = true;
    }
    if (company.includes(token)) {
      score += 25;
      tokenHit = true;
    }

    if (tokenHit) tokenMatches++;
  }

  // Major boost if all tokens in query matched
  if (rawTokens.length > 1) {
    let rawHits = 0;
    for (const t of rawTokens) {
      if (normName.includes(t) || normGeneric.includes(t) || keywords.some(k => k.includes(t))) rawHits++;
    }
    if (rawHits === rawTokens.length) {
      score += 400; // Multi-token exact match boost (e.g. both "ciprocin" AND "500" matched)
    }
  }

  return score;
}

/**
 * Universal Search Function for Medicines
 * Works identically for Storefront (Header autocomplete & App catalog)
 * and Admin Panel (Med Catalog & Rx Prescription Review)
 *
 * @param {Array} medicinesList - The medicines array to search through
 * @param {string} query - The search query (Bangla or English)
 * @param {Object} [options] - Optional filter parameters
 * @param {string} [options.category] - Category ID filter (e.g., 'otc', 'gastric', or 'all')
 * @param {string} [options.filterRx] - 'otc' (no Rx required), 'rx' (Rx required), or 'all'
 * @returns {Array} - Filtered and relevance-sorted array of medicines
 */
export function searchMedicines(medicinesList = [], query = '', options = {}) {
  if (!Array.isArray(medicinesList)) return [];

  const { category = 'all', filterRx = 'all', limit = 300 } = options;
  const cleanQ = (query || '').trim();

  // If no query, apply standard filters only
  if (!cleanQ) {
    return deduplicateMedicines(medicinesList.filter(med => {
      const matchCat = category === 'all' || med.category === category;
      let matchRx = true;
      if (filterRx === 'otc') matchRx = !med.requiresPrescription;
      if (filterRx === 'rx') matchRx = !!med.requiresPrescription;
      return matchCat && matchRx;
    }));
  }

  const normQ = normalizeText(cleanQ);
  const rawTokens = normQ.split(' ').filter(Boolean);
  const numberTokens = rawTokens.filter(t => /^\d+$/.test(t));
  const significantTokens = rawTokens.filter(t => 
    !/^\d+$/.test(t) && 
    !['mg', 'ml', 'gm', 'mcg', 'iu', 'tablet', 'tab', 'capsule', 'cap', 'syrup', 'drop', 'suspension'].includes(t)
  );

  // Significant translated / English tokens for Bangla brand queries
  const sigTokens = [];
  for (const t of rawTokens) {
    if (/^\d+$/.test(t)) continue;
    if (BANGLA_SYNONYM_MAP[t]) {
      sigTokens.push(BANGLA_SYNONYM_MAP[t][0].toLowerCase());
    } else {
      sigTokens.push(t.toLowerCase());
    }
  }

  const expandedTokens = expandQueryTokens(cleanQ);
  const rawQLower = cleanQ.toLowerCase();
  const hasBn = hasBengaliChars(cleanQ);

  const scored = [];
  const seenIds = new Set();

  // 1. Search first in curated store catalog (receives priority boost)
  for (const med of medicinesList) {
    if (category !== 'all' && med.category !== category) continue;
    if (filterRx === 'otc' && med.requiresPrescription) continue;
    if (filterRx === 'rx' && !med.requiresPrescription) continue;

    const s = scoreMedicine(med, cleanQ, expandedTokens);
    if (s > 0) {
      scored.push({ med, score: s + 50, isCurated: true }); // curated boost
      seenIds.add(med.id);
    }
  }

  // Check if curated catalog already has strong matches (e.g. score >= 700)
  scored.sort((a, b) => b.score - a.score);
  const hasStrongCurated = scored.length > 0 && scored[0].score >= 700;

  // 2. Search in the 50,000+ Bangladesh registered medicines database
  // If we already have strong curated matches, avoid bloating results with synthetic items
  if (!hasStrongCurated) {
    if (Array.isArray(bd50kCache)) {
      for (let i = 0; i < bd50kCache.length; i++) {
        const t = bd50kCache[i];
      const id = t[0];
      if (seenIds.has(id)) continue;

      // Category filter check
      if (category !== 'all' && t[5] !== category) continue;

      // Rx filter check
      if (filterRx === 'otc' && t[10] === 1) continue;
      if (filterRx === 'rx' && t[10] === 0) continue;

      const nameLower = t[1].toLowerCase();
      const genericLower = t[3].toLowerCase();
      const nameBn = t[2] || '';
      const compLower = t[4].toLowerCase();

      // If significant tokens exist, the 50K item MUST match at least one significant token
      if (significantTokens.length > 0) {
        const matchesSig = significantTokens.some(st => 
          nameLower.includes(st) || 
          genericLower.includes(st) || 
          (nameBn && nameBn.includes(st)) ||
          (BANGLA_SYNONYM_MAP[st] && BANGLA_SYNONYM_MAP[st].some(syn => nameLower.includes(syn) || genericLower.includes(syn)))
        );
        if (!matchesSig) continue;
      }

      // If number tokens exist (e.g. 500), must match the number
      if (numberTokens.length > 0) {
        const matchesNum = numberTokens.some(nt => nameLower.includes(nt));
        if (!matchesNum) continue;
      }

      let matches = false;
      if (nameLower.includes(rawQLower) || genericLower.includes(rawQLower)) {
        matches = true;
      } else if (hasBn && nameBn.includes(cleanQ)) {
        matches = true;
      } else if (compLower.includes(rawQLower)) {
        matches = true;
      } else {
        for (const tok of expandedTokens) {
          if (tok && tok.length > 2 && (nameLower.includes(tok) || genericLower.includes(tok))) {
            matches = true;
            break;
          }
        }
      }

      if (matches) {
        const fullMed = expandCompactMedicine(t);
        const s = scoreMedicine(fullMed, cleanQ, expandedTokens);
        if (s > 0) {
          scored.push({ med: fullMed, score: s, isCurated: false });
          seenIds.add(id);
        }
      }

      if (scored.length >= limit) {
        break;
      }
    }
  } else {
    preload50kMedicines();
  }
}

  // Sort by highest score first
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Secondary tie-breaker: alphabetic name
    return (a.med.name || '').localeCompare(b.med.name || '');
  });

  let finalMeds = scored.map(item => item.med);

  // EXACT FILTERING & PRUNING:
  // 1. If number tokens exist (e.g. "500" in "Ciprocin 500"):
  // Any candidate MUST contain every number token in its name
  if (numberTokens.length > 0) {
    finalMeds = finalMeds.filter(m => {
      const n = (m.name || '').toLowerCase();
      return numberTokens.every(num => n.includes(num));
    });
  }

  // 2. If user searched brand + strength (e.g. "Ciprocin 500" or "সিপ্রোসিন ৫০০"):
  // Candidates must match the brand/significant token
  if (sigTokens.length > 0 && numberTokens.length > 0) {
    finalMeds = finalMeds.filter(m => {
      const n = (m.name || '').toLowerCase();
      return sigTokens.some(st => n.includes(st));
    });
    // Prefer curated items if any exist
    const curatedMatches = finalMeds.filter(m => !m.id?.startsWith('med_bd_'));
    if (curatedMatches.length > 0) {
      finalMeds = curatedMatches;
    }
  }

  // 3. Multi-word queries like "Napa Extra":
  // If candidates exist that match ALL significant tokens, prune partial matches
  if (significantTokens.length > 1) {
    const allSigMatches = finalMeds.filter(m => {
      const n = (m.name || '').toLowerCase();
      return significantTokens.every(st => n.includes(st));
    });
    if (allSigMatches.length > 0) {
      finalMeds = allSigMatches;
    }
  }

  // 4. Exact Name Match Isolation:
  // If top candidate is an exact match for query or synonym (e.g. "Napa Extra", "Ciprocin 500mg"):
  // Isolate exact match
  if (finalMeds.length > 0) {
    const topMed = finalMeds[0];
    const topNorm = (topMed.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const qNorm = normQ.replace(/[^a-z0-9]/g, '');
    const firstSyn = BANGLA_SYNONYM_MAP[normQ] ? BANGLA_SYNONYM_MAP[normQ][0].replace(/[^a-z0-9]/g, '') : '';
    if (topNorm === qNorm || (firstSyn && topNorm === firstSyn)) {
      finalMeds = [topMed];
    }
  }

  // 5. Deduplicate identical items (merges "Ciprocin 500" and "Ciprocin 500mg", etc.)
  return deduplicateMedicines(finalMeds);
}

// In-memory cache for live MedEx searches
const medexSearchCache = new Map();

/**
 * Live search MedEx (medex.com.bd) via backend serverless endpoint (/api/medex-search?q=query)
 * Returns array of verified medicines formatted identically to our catalog.
 * Cached in memory so repeated queries don't re-fetch.
 */
export async function fetchMedexSearchResults(query) {
  const cleanQ = (query || '').trim();
  if (!cleanQ || cleanQ.length < 2) return [];

  const cacheKey = cleanQ.toLowerCase();
  if (medexSearchCache.has(cacheKey)) {
    return medexSearchCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout
    const res = await fetch(`/api/medex-search?q=${encodeURIComponent(cleanQ)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const rawResults = Array.isArray(data?.results) ? data.results : [];
    const results = rawResults.map(item => ({
      ...item,
      company: (item.company || '')
        .replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস')
        .trim() || 'বাংলাদেশ ফার্মাসিউটিক্যালস',
      description: (item.description || '')
        .replace(/MedEx\s*Bangladesh\s*ডাটাবেজ\s*থেকে\s*সংগৃহীত\s*/gi, '')
        .replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বেলী ফার্মেসি')
        .trim(),
      medexLink: null,
      isMedEx: false
    }));

    // Cache up to 120 searches
    if (medexSearchCache.size > 120) {
      const firstKey = medexSearchCache.keys().next().value;
      medexSearchCache.delete(firstKey);
    }
    medexSearchCache.set(cacheKey, results);
    return results;
  } catch (err) {
    // Graceful fallback: return empty list on network or server error
    return [];
  }
}

/**
 * Merges local database search results with live MedEx search results
 * Prevents duplicates by matching normalized medicine brand names.
 */
export function mergeSearchResults(localResults = [], medexResults = []) {
  if (!Array.isArray(medexResults) || medexResults.length === 0) {
    return deduplicateMedicines(localResults || []);
  }
  if (!Array.isArray(localResults) || localResults.length === 0) {
    return deduplicateMedicines(medexResults || []);
  }

  const seen = new Set();
  const merged = [];

  for (const item of localResults) {
    const key = getMedicineDedupeKey(item);
    if (key) seen.add(key);
    merged.push(item);
  }

  for (const item of medexResults) {
    const key = getMedicineDedupeKey(item);
    if (!key || !seen.has(key)) {
      if (key) seen.add(key);
      merged.push(item);
    }
  }

  return deduplicateMedicines(merged);
}

