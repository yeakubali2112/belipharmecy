/**
 * Bangladesh Medicine Search Engine
 * Supports bilingual search: Bengali (বাংলা) & English
 * Searches Brand Names, Generics, Companies, Indications, Symptoms & Dosage Forms
 */
import { BANGLADESH_50K_MEDICINES, expandCompactMedicine } from '../data/bangladeshMedicines50k.js';

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
 * Normalizes text by trimming, lowercasing, and stripping special punctuation
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
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
 * Calculates a match score for a medicine given the search query
 * Higher score = higher relevance
 */
export function scoreMedicine(med, query, expandedTokens = []) {
  if (!query || !query.trim()) return 0;

  const rawQ = query.trim().toLowerCase();
  const normQ = normalizeText(query);

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

  let score = 0;

  // 1. Exact Name Matches (Highest Priority)
  if (normName === normQ || name === rawQ || nameBn === rawQ) {
    return 1000;
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

  // Boost if all tokens in query matched
  if (expandedTokens.length > 1 && tokenMatches >= expandedTokens.length) {
    score += 100;
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
    return medicinesList.filter(med => {
      const matchCat = category === 'all' || med.category === category;
      let matchRx = true;
      if (filterRx === 'otc') matchRx = !med.requiresPrescription;
      if (filterRx === 'rx') matchRx = !!med.requiresPrescription;
      return matchCat && matchRx;
    });
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
      scored.push({ med, score: s + 40 }); // curated boost
      seenIds.add(med.id);
    }
  }

  // 2. Search in the 50,000+ Bangladesh registered medicines database
  if (Array.isArray(BANGLADESH_50K_MEDICINES)) {
    for (let i = 0; i < BANGLADESH_50K_MEDICINES.length; i++) {
      const t = BANGLADESH_50K_MEDICINES[i];
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
          scored.push({ med: fullMed, score: s });
          seenIds.add(id);
        }
      }

      if (scored.length >= limit) {
        break;
      }
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

  return scored.map(item => item.med);
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
    return localResults || [];
  }
  if (!Array.isArray(localResults) || localResults.length === 0) {
    return medexResults || [];
  }

  const seen = new Set();
  const merged = [];

  for (const item of localResults) {
    const key = (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key) seen.add(key);
    merged.push(item);
  }

  for (const item of medexResults) {
    const key = (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key || !seen.has(key)) {
      if (key) seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}

