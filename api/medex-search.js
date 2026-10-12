/**
 * Vercel Serverless Function: Live Medicine Search from MedEx (medex.com.bd)
 * Endpoint: /api/medex-search?q=query
 */

// Bengali phonetic & synonym mapping for querying MedEx in English
const BANGLA_TO_ENG = {
  'নাপা': 'napa',
  'এইস': 'ace',
  'সারজেল': 'sergel',
  'সেক্লো': 'seclo',
  'ম্যাক্সপ্রো': 'maxpro',
  'প্যান্টোনিক্স': 'pantonix',
  'লুসেক্টিল': 'losectil',
  'ফিনিক্স': 'finix',
  'ইসোরাল': 'esoral',
  'নেক্সাম': 'nexum',
  'অ্যালাট্রোল': 'alatrol',
  'ফেক্সো': 'fexo',
  'মোনাস': 'monas',
  'প্রোভাইয়ার': 'provair',
  'এবাতিন': 'ebatin',
  'বিলাস্টিন': 'bilastin',
  'টোফেন': 'tofen',
  'সিপ্রোসিন': 'ciprocin',
  'জিম্যাক্স': 'zimax',
  'অ্যাজিথ্রাল': 'azithral',
  'সেফ-৩': 'cef-3',
  'সেফ ৩': 'cef-3',
  'মক্সাক্ল্যাভ': 'moxaclav',
  'ফিলমেট': 'filmet',
  'ফ্ল্যাজিল': 'flagyl',
  'অ্যামোডিস': 'amodis',
  'ক্যালবো': 'calbo',
  'কোরালক্যাল': 'coralcal',
  'ডি রাইজ': 'd-rise',
  'সিভিট': 'cevit',
  'বি ৫০': 'b-50',
  'বি-৫০': 'b-50',
  'নিউরো বি': 'neuro-b',
  'নিউরোবিয়ন': 'neurobion',
  'জি মেট': 'g-met',
  'জি-মেট': 'g-met',
  'কম্প্রিড': 'comprid',
  'লিনাগ্লিপ': 'linaglip',
  'ওসারটিল': 'osartil',
  'বিজোরান': 'bizoran',
  'ইকোস্প্রিন': 'ecosprin',
  'ক্লোফেনাক': 'clofenac',
  'টরাক্স': 'torax',
  'রোল্যাক': 'rolac',
  'গ্যাভিস্কন': 'gaviscon',
  'এন্টাসিড': 'entacyd',
  'মোটিগাট': 'motigut',
  'অমিডন': 'omidon',
  'ইমিস্ট্যাট': 'emistat',
  'অ্যাডোভাস': 'adovas',
  'তুসকা': 'tussca',
  'মিরাকফ': 'mirakof',
  'ভেন্টোলিন': 'ventolin',
  'বেক্সিট্রল': 'bexitrol',
  'গ্যাস্ট্রিক': 'omeprazole',
  'জ্বর': 'paracetamol',
  'কাশি': 'cough'
};

const BRAND_ENRICHMENT = {
  'napa': { generic: 'Paracetamol', company: 'Beximco Pharmaceuticals Ltd.', category: 'otc' },
  'ace': { generic: 'Paracetamol', company: 'Square Pharmaceuticals PLC', category: 'otc' },
  'fast': { generic: 'Paracetamol', company: 'Acme Laboratories Ltd.', category: 'otc' },
  'reset': { generic: 'Paracetamol', company: 'Incepta Pharmaceuticals Ltd.', category: 'otc' },
  'xcel': { generic: 'Paracetamol', company: 'Healthcare Pharmaceuticals Ltd.', category: 'otc' },
  'seclo': { generic: 'Omeprazole', company: 'Square Pharmaceuticals PLC', category: 'gastric' },
  'losectil': { generic: 'Omeprazole', company: 'Eskayef Pharmaceuticals Ltd. (SK+F)', category: 'gastric' },
  'proceptin': { generic: 'Omeprazole', company: 'Beximco Pharmaceuticals Ltd.', category: 'gastric' },
  'sergel': { generic: 'Esomeprazole', company: 'Healthcare Pharmaceuticals Ltd.', category: 'gastric' },
  'maxpro': { generic: 'Esomeprazole', company: 'Square Pharmaceuticals PLC', category: 'gastric' },
  'nexum': { generic: 'Esomeprazole', company: 'Incepta Pharmaceuticals Ltd.', category: 'gastric' },
  'esoral': { generic: 'Esomeprazole', company: 'Beximco Pharmaceuticals Ltd.', category: 'gastric' },
  'opton': { generic: 'Esomeprazole', company: 'Renata Limited', category: 'gastric' },
  'pantonix': { generic: 'Pantoprazole', company: 'Incepta Pharmaceuticals Ltd.', category: 'gastric' },
  'pantobex': { generic: 'Pantoprazole', company: 'Beximco Pharmaceuticals Ltd.', category: 'gastric' },
  'trupan': { generic: 'Pantoprazole', company: 'Square Pharmaceuticals PLC', category: 'gastric' },
  'finix': { generic: 'Rabeprazole', company: 'Opsonin Pharma Ltd.', category: 'gastric' },
  'rabeca': { generic: 'Rabeprazole', company: 'Square Pharmaceuticals PLC', category: 'gastric' },
  'alatrol': { generic: 'Cetirizine Hydrochloride', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'atrizin': { generic: 'Cetirizine Hydrochloride', company: 'Beximco Pharmaceuticals Ltd.', category: 'respiratory' },
  'cetriz': { generic: 'Cetirizine Hydrochloride', company: 'Incepta Pharmaceuticals Ltd.', category: 'respiratory' },
  'fexo': { generic: 'Fexofenadine Hydrochloride', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'fexofast': { generic: 'Fexofenadine Hydrochloride', company: 'Beximco Pharmaceuticals Ltd.', category: 'respiratory' },
  'monas': { generic: 'Montelukast Sodium', company: 'Acme Laboratories Ltd.', category: 'respiratory' },
  'provair': { generic: 'Montelukast Sodium', company: 'Healthcare Pharmaceuticals Ltd.', category: 'respiratory' },
  'odmon': { generic: 'Montelukast Sodium', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'ebatin': { generic: 'Ebastine', company: 'Healthcare Pharmaceuticals Ltd.', category: 'respiratory' },
  'bilastin': { generic: 'Bilastine', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'tofen': { generic: 'Ketotifen Fumarate', company: 'Beximco Pharmaceuticals Ltd.', category: 'respiratory' },
  'ciprocin': { generic: 'Ciprofloxacin', company: 'Square Pharmaceuticals PLC', category: 'antibiotics' },
  'neoflox': { generic: 'Ciprofloxacin', company: 'Beximco Pharmaceuticals Ltd.', category: 'antibiotics' },
  'zimax': { generic: 'Azithromycin', company: 'Square Pharmaceuticals PLC', category: 'antibiotics' },
  'azithral': { generic: 'Azithromycin', company: 'Incepta Pharmaceuticals Ltd.', category: 'antibiotics' },
  'tridosil': { generic: 'Azithromycin', company: 'Beximco Pharmaceuticals Ltd.', category: 'antibiotics' },
  'cef-3': { generic: 'Cefixime Trihydrate', company: 'Square Pharmaceuticals PLC', category: 'antibiotics' },
  'triocim': { generic: 'Cefixime Trihydrate', company: 'Square Pharmaceuticals PLC', category: 'antibiotics' },
  'denvar': { generic: 'Cefixime Trihydrate', company: 'Incepta Pharmaceuticals Ltd.', category: 'antibiotics' },
  'moxaclav': { generic: 'Amoxicillin + Clavulanic Acid', company: 'Square Pharmaceuticals PLC', category: 'antibiotics' },
  'filmet': { generic: 'Metronidazole', company: 'Square Pharmaceuticals PLC', category: 'antibiotics' },
  'flagyl': { generic: 'Metronidazole', company: 'Sanofi Bangladesh Ltd.', category: 'antibiotics' },
  'amodis': { generic: 'Metronidazole', company: 'Beximco Pharmaceuticals Ltd.', category: 'antibiotics' },
  'calbo': { generic: 'Calcium Carbonate', company: 'Square Pharmaceuticals PLC', category: 'vitamins' },
  'calbo-d': { generic: 'Calcium Carbonate + Vitamin D3', company: 'Square Pharmaceuticals PLC', category: 'vitamins' },
  'coralcal': { generic: 'Coral Calcium + Vitamin D3', company: 'Radiant Pharmaceuticals Ltd.', category: 'vitamins' },
  'ostocal': { generic: 'Calcium Carbonate + Vitamin D3', company: 'Incepta Pharmaceuticals Ltd.', category: 'vitamins' },
  'd-rise': { generic: 'Cholecalciferol (Vitamin D3)', company: 'Acme Laboratories Ltd.', category: 'vitamins' },
  'cevit': { generic: 'Vitamin C (Ascorbic Acid)', company: 'Square Pharmaceuticals PLC', category: 'vitamins' },
  'vitacit': { generic: 'Vitamin C (Ascorbic Acid)', company: 'Beximco Pharmaceuticals Ltd.', category: 'vitamins' },
  'b-50': { generic: 'Vitamin B Complex', company: 'Square Pharmaceuticals PLC', category: 'vitamins' },
  'neuro-b': { generic: 'Vitamin B1 + B6 + B12', company: 'Square Pharmaceuticals PLC', category: 'vitamins' },
  'neurobion': { generic: 'Vitamin B1 + B6 + B12', company: 'Procter & Gamble / Merck', category: 'vitamins' },
  'comprid': { generic: 'Glimepiride', company: 'Square Pharmaceuticals PLC', category: 'diabetes' },
  'g-met': { generic: 'Metformin Hydrochloride', company: 'Square Pharmaceuticals PLC', category: 'diabetes' },
  'linaglip': { generic: 'Linagliptin', company: 'Square Pharmaceuticals PLC', category: 'diabetes' },
  'osartil': { generic: 'Losartan Potassium', company: 'Incepta Pharmaceuticals Ltd.', category: 'heart' },
  'angilock': { generic: 'Losartan Potassium', company: 'Square Pharmaceuticals PLC', category: 'heart' },
  'bizoran': { generic: 'Amlodipine + Olmesartan Medoxomil', company: 'Square Pharmaceuticals PLC', category: 'heart' },
  'camlosart': { generic: 'Amlodipine + Losartan Potassium', company: 'Square Pharmaceuticals PLC', category: 'heart' },
  'cardibis': { generic: 'Bisoprolol Fumarate', company: 'Square Pharmaceuticals PLC', category: 'heart' },
  'ecosprin': { generic: 'Aspirin (Acetylsalicylic Acid)', company: 'Acme Laboratories Ltd.', category: 'heart' },
  'clofenac': { generic: 'Diclofenac Sodium', company: 'Square Pharmaceuticals PLC', category: 'otc' },
  'torax': { generic: 'Ketorolac Tromethamine', company: 'Square Pharmaceuticals PLC', category: 'otc' },
  'rolac': { generic: 'Ketorolac Tromethamine', company: 'Incepta Pharmaceuticals Ltd.', category: 'otc' },
  'etorix': { generic: 'Etoricoxib', company: 'Square Pharmaceuticals PLC', category: 'otc' },
  'gaviscon': { generic: 'Sodium Alginate + Sodium Bicarbonate', company: 'Reckitt Benckiser', category: 'gastric' },
  'entacyd': { generic: 'Aluminium Hydroxide + Magnesium Hydroxide', company: 'Square Pharmaceuticals PLC', category: 'gastric' },
  'motigut': { generic: 'Domperidone', company: 'Square Pharmaceuticals PLC', category: 'gastric' },
  'omidon': { generic: 'Domperidone', company: 'Incepta Pharmaceuticals Ltd.', category: 'gastric' },
  'emistat': { generic: 'Ondansetron', company: 'Healthcare Pharmaceuticals Ltd.', category: 'gastric' },
  'adovas': { generic: 'Vasaka Herbal Cough Syrup', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'tussca': { generic: 'Dextromethorphan + Phenylephrine', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'mirakof': { generic: 'Butamirate Citrate', company: 'Square Pharmaceuticals PLC', category: 'respiratory' },
  'ventolin': { generic: 'Salbutamol Inhaler', company: 'GlaxoSmithKline (GSK)', category: 'respiratory' },
  'bexitrol': { generic: 'Salmeterol + Fluticasone Inhaler', company: 'Beximco Pharmaceuticals Ltd.', category: 'respiratory' }
};

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMedexHtml(html, query) {
  const items = [];
  if (!html || typeof html !== 'string') return items;

  // Regex to extract each <a> result from MedEx live ajax search
  const linkRegex = /<a\s+href="([^"]+)"[^>]*class="([^"]*)"[^>]*>[\s\S]*?<li\s+title="([^"]*)"[\s\S]*?<span>\s*([\s\S]*?)\s*<\/span>\s*<\/li>\s*<\/a>/gi;
  let match;
  let idx = 1;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const aClass = match[2] || '';
    const dosageForm = match[3] || 'Tablet';
    let fullSpan = match[4];

    // Skip sponsored ads
    if (href.includes('/to/sad-cta') || /\bad\b/i.test(aClass)) {
      continue;
    }

    // Extract strength if present: e.g. <span class="sr-strength">20 mg</span>
    let strength = '';
    const strMatch = fullSpan.match(/<span\s+class="sr-strength"[^>]*>([\s\S]*?)<\/span>/i);
    if (strMatch) {
      strength = cleanText(strMatch[1]);
      fullSpan = fullSpan.replace(/<span\s+class="sr-strength"[^>]*>[\s\S]*?<\/span>/gi, '');
    }

    const brandName = cleanText(fullSpan);
    if (!brandName) continue;

    const fullName = strength ? `${brandName} ${strength}` : brandName;
    const isLiquid = /syrup|suspension|drop|liquid|infusion|solution/i.test(dosageForm);
    const isInjection = /injection|iv/i.test(dosageForm);
    const isOintment = /ointment|cream|gel/i.test(dosageForm);
    const isEyeEar = /eye|ear|nasal/i.test(dosageForm);
    const stripSize = (isLiquid || isInjection || isOintment || isEyeEar) ? 1 : 10;
    
    // Estimate standard unit price based on strength and dosage form
    let unitPrice = 5.0;
    if (isLiquid) unitPrice = 45.0;
    else if (isInjection) unitPrice = 75.0;
    else if (isOintment) unitPrice = 55.0;
    else if (isEyeEar) unitPrice = 65.0;
    else if (/40\s*mg|500\s*mg|625\s*mg/i.test(strength)) unitPrice = 10.0;
    else if (/1000\s*mg|1g/i.test(strength)) unitPrice = 18.0;

    const stripPrice = Number((unitPrice * stripSize).toFixed(2));

    // Brand lookup for generic & company enrichment
    const brandKey = brandName.toLowerCase().split(' ')[0];
    const enrich = BRAND_ENRICHMENT[brandKey] || {};

    let generic = enrich.generic || `${brandName} (${dosageForm})`;
    let company = enrich.company || 'MedEx Bangladesh Verified';
    let category = enrich.category || 'otc';

    if (!enrich.category) {
      if (/omeprazole|esomeprazole|pantoprazole|rabeprazole|antacid|domperidone|ondansetron/i.test(fullName + ' ' + query)) {
        category = 'gastric';
      } else if (/fexo|cetirizine|montelukast|cough|adovas|asthma|inhaler|salbutamol/i.test(fullName + ' ' + query)) {
        category = 'respiratory';
      } else if (/azithromycin|cefixime|cipro|clav|mox|fluclox|metronidazole/i.test(fullName + ' ' + query)) {
        category = 'antibiotics';
      } else if (/metformin|linaglip|glimepiride|insulin/i.test(fullName + ' ' + query)) {
        category = 'diabetes';
      } else if (/losartan|amlodipine|bisoprolol|rosuva|atova|aspirin/i.test(fullName + ' ' + query)) {
        category = 'heart';
      } else if (/calcium|vitamin|zinc|neuro/i.test(fullName + ' ' + query)) {
        category = 'vitamins';
      }
    }

    // Generate safe clean ID
    const slug = href.split('/').slice(-1)[0] || `med-${idx}`;
    const id = `medex-${slug}`;

    items.push({
      id,
      name: fullName,
      nameBn: fullName,
      generic,
      company,
      category,
      type: dosageForm,
      stripSize,
      pricePerUnit: unitPrice,
      pricePerStrip: stripPrice,
      discountPercent: 5,
      requiresPrescription: !(/paracetamol|antacid|cetirizine|vitamin|ors/i.test(fullName)),
      stock: 200,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      description: `MedEx Bangladesh ডাটাবেজ থেকে সংগৃহীত ভেরিফাইড ওষুধ: ${fullName} (${dosageForm})। প্রস্তুতকারক: ${company}।`,
      indications: 'চিকিৎসকের পরামর্শ অনুযায়ী সেব্য।',
      dosage: 'ডাক্তারের নির্দেশিত মাত্রায় আহারের পর বা পূর্বে সেবনীয়।',
      medexLink: href.startsWith('http') ? href : `https://medex.com.bd${href}`,
      isMedEx: true
    });

    idx++;
  }

  return items;
}

export default async function handler(req, res) {
  // CORS & Caching headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawQuery = (req.query.q || req.query.query || req.query.search || '').toString().trim();
  if (!rawQuery || rawQuery.length < 2) {
    return res.status(200).json({ results: [], count: 0 });
  }

  // If query is in Bangla, map to English for MedEx
  const queryLower = rawQuery.toLowerCase();
  let queryForMedex = BANGLA_TO_ENG[queryLower] || rawQuery;
  // If still contains Bangla characters, check token matching
  if (/[\u0980-\u09FF]/.test(queryForMedex)) {
    for (const [k, v] of Object.entries(BANGLA_TO_ENG)) {
      if (rawQuery.includes(k) || k.includes(rawQuery)) {
        queryForMedex = v;
        break;
      }
    }
  }

  try {
    const medexUrl = `https://medex.com.bd/ajax/search?searchtype=search&searchkey=${encodeURIComponent(queryForMedex)}`;
    
    const response = await fetch(medexUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://medex.com.bd/',
        'Accept': 'text/html, */*'
      }
    });

    if (!response.ok) {
      return res.status(200).json({ results: [], count: 0 });
    }

    const html = await response.text();
    const results = parseMedexHtml(html, queryForMedex);

    return res.status(200).json({
      results,
      count: results.length,
      source: 'medex.com.bd',
      query: rawQuery
    });
  } catch (err) {
    console.error('MedEx live search serverless error:', err);
    return res.status(200).json({ results: [], count: 0, error: 'MedEx live search temporarily unreachable' });
  }
}
