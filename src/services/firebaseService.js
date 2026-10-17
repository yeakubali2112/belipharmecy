// Firebase Firestore Real-Time Cloud Service for Beli Pharmacy
// Seamless cross-device synchronization between mobile customers and admin portal

const PROJECT_ID = 'beli-pharmacy';
const API_KEY = 'AIzaSyCAiNB0xZuLSDKt79nDbsSyGuvdtxdX67w';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

let quotaExceededUntil = 0;

const isQuotaBlocked = () => {
  return Date.now() < quotaExceededUntil;
};

const markQuotaExceeded = () => {
  quotaExceededUntil = Date.now() + 10 * 60 * 1000; // 10 minutes cooldown
  console.warn('[Firestore Cloud] Daily quota reached (429). Switched to instant local & multi-tab sync.');
};

/**
 * Encodes JavaScript object into Firestore document representation
 */
const toFirestoreDoc = (obj) => ({
  fields: {
    id: { stringValue: String(obj.id || '') },
    status: { stringValue: String(obj.status || '') },
    updatedAt: { stringValue: new Date().toISOString() },
    dataJson: { stringValue: JSON.stringify(obj) }
  }
});

/**
 * Decodes Firestore document back into JavaScript object
 */
const fromFirestoreDoc = (doc) => {
  if (doc?.fields?.dataJson?.stringValue) {
    try {
      return JSON.parse(doc.fields.dataJson.stringValue);
    } catch (e) {
      console.error('Error parsing Firestore document JSON:', e);
    }
  }
  return null;
};

// ==========================================
// ORDERS CLOUD SYNC
// ==========================================

export const fetchCloudOrders = async () => {
  if (isQuotaBlocked()) return null;
  try {
    const res = await fetch(`${BASE_URL}/orders?key=${API_KEY}&pageSize=100`, { cache: 'no-store' });
    if (res.status === 429) {
      markQuotaExceeded();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    return null;
  }
};

export const saveCloudOrder = async (order) => {
  if (!order || !order.id || isQuotaBlocked()) return false;
  try {
    const docId = encodeURIComponent(order.id);
    const res = await fetch(`${BASE_URL}/orders/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(order))
    });
    if (res.status === 429) {
      markQuotaExceeded();
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// PRESCRIPTIONS CLOUD SYNC
// ==========================================

export const fetchCloudPrescriptions = async () => {
  if (isQuotaBlocked()) return null;
  try {
    const res = await fetch(`${BASE_URL}/prescriptions?key=${API_KEY}&pageSize=100`, { cache: 'no-store' });
    if (res.status === 429) {
      markQuotaExceeded();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    return null;
  }
};

export const saveCloudPrescription = async (prescription) => {
  if (!prescription || !prescription.id || isQuotaBlocked()) return false;
  try {
    const docId = encodeURIComponent(prescription.id);
    const res = await fetch(`${BASE_URL}/prescriptions/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(prescription))
    });
    if (res.status === 429) {
      markQuotaExceeded();
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// DELIVERY SETTINGS & COUPONS CLOUD SYNC
// ==========================================

export const fetchCloudSettings = async () => {
  if (isQuotaBlocked()) return null;
  try {
    const res = await fetch(`${BASE_URL}/settings/global?key=${API_KEY}`, { cache: 'no-store' });
    if (res.status === 429) {
      markQuotaExceeded();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    return fromFirestoreDoc(data);
  } catch (err) {
    return null;
  }
};

export const saveCloudSettings = async (settings) => {
  if (isQuotaBlocked()) return false;
  try {
    const res = await fetch(`${BASE_URL}/settings/global?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(settings))
    });
    if (res.status === 429) {
      markQuotaExceeded();
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// CUSTOMER PROFILES CLOUD SYNC
// ==========================================

export const fetchCloudCustomers = async () => {
  if (isQuotaBlocked()) return null;
  try {
    const res = await fetch(`${BASE_URL}/customers?key=${API_KEY}&pageSize=300`, { cache: 'no-store' });
    if (res.status === 429) {
      markQuotaExceeded();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    return null;
  }
};

export const saveCloudCustomer = async (customer) => {
  if (!customer || !customer.phone || isQuotaBlocked()) return false;
  try {
    const cleanId = String(customer.phone).trim().replace(/[^0-9+]/g, '');
    const docId = encodeURIComponent(cleanId);
    const res = await fetch(`${BASE_URL}/customers/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc({ id: cleanId, ...customer }))
    });
    if (res.status === 429) {
      markQuotaExceeded();
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const deleteCloudCustomer = async (phone) => {
  if (!phone || isQuotaBlocked()) return false;
  try {
    const cleanId = String(phone).trim().replace(/[^0-9+]/g, '');
    const docId = encodeURIComponent(cleanId);
    const res = await fetch(`${BASE_URL}/customers/${docId}?key=${API_KEY}`, {
      method: 'DELETE'
    });
    if (res.status === 429) {
      markQuotaExceeded();
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// MEDICINES CLOUD SYNC
// ==========================================

export const fetchCloudMedicines = async () => {
  if (isQuotaBlocked()) return null;
  try {
    let allDocs = [];
    let pageToken = '';
    let loopCount = 0;
    do {
      const url = `${BASE_URL}/medicines?key=${API_KEY}&pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 429) {
        markQuotaExceeded();
        return null;
      }
      if (!res.ok) break;
      const data = await res.json();
      if (data.documents && Array.isArray(data.documents)) {
        allDocs = allDocs.concat(data.documents);
      }
      pageToken = data.nextPageToken || '';
      loopCount++;
    } while (pageToken && loopCount < 10);

    return allDocs.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    return null;
  }
};

export const saveCloudMedicine = async (medicine) => {
  if (!medicine || !medicine.id || isQuotaBlocked()) return false;
  try {
    const docId = encodeURIComponent(medicine.id);
    const res = await fetch(`${BASE_URL}/medicines/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(medicine))
    });
    if (res.status === 429) {
      markQuotaExceeded();
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const batchSaveCloudMedicines = async (medicinesList, onProgress) => {
  if (!medicinesList || !Array.isArray(medicinesList) || medicinesList.length === 0) {
    return { success: true, count: 0 };
  }

  let savedCount = 0;
  for (let i = 0; i < medicinesList.length; i++) {
    const med = medicinesList[i];
    const ok = await saveCloudMedicine(med);
    if (ok) savedCount++;
    if (onProgress) {
      onProgress(i + 1, medicinesList.length, med);
    }
    if (i < medicinesList.length - 1) {
      await new Promise(r => setTimeout(r, 60));
    }
  }

  return { success: true, count: savedCount };
};

