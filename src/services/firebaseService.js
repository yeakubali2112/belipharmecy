// Firebase Firestore Real-Time Cloud Service for Beli Pharmacy
// Seamless cross-device synchronization between mobile customers and admin portal

const PROJECT_ID = 'beli-pharmacy';
const API_KEY = 'AIzaSyCAiNB0xZuLSDKt79nDbsSyGuvdtxdX67w';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
  try {
    const res = await fetch(`${BASE_URL}/orders?key=${API_KEY}&pageSize=100`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    console.error('Cloud fetch orders error:', err);
    return null;
  }
};

export const saveCloudOrder = async (order) => {
  if (!order || !order.id) return false;
  try {
    const docId = encodeURIComponent(order.id);
    const res = await fetch(`${BASE_URL}/orders/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(order))
    });
    return res.ok;
  } catch (err) {
    console.error('Cloud save order error:', err);
    return false;
  }
};

// ==========================================
// PRESCRIPTIONS CLOUD SYNC
// ==========================================

export const fetchCloudPrescriptions = async () => {
  try {
    const res = await fetch(`${BASE_URL}/prescriptions?key=${API_KEY}&pageSize=100`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    console.error('Cloud fetch prescriptions error:', err);
    return null;
  }
};

export const saveCloudPrescription = async (prescription) => {
  if (!prescription || !prescription.id) return false;
  try {
    const docId = encodeURIComponent(prescription.id);
    const res = await fetch(`${BASE_URL}/prescriptions/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(prescription))
    });
    return res.ok;
  } catch (err) {
    console.error('Cloud save prescription error:', err);
    return false;
  }
};

// ==========================================
// DELIVERY SETTINGS & COUPONS CLOUD SYNC
// ==========================================

export const fetchCloudSettings = async () => {
  try {
    const res = await fetch(`${BASE_URL}/settings/global?key=${API_KEY}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return fromFirestoreDoc(data);
  } catch (err) {
    console.error('Cloud fetch settings error:', err);
    return null;
  }
};

export const saveCloudSettings = async (settings) => {
  try {
    const res = await fetch(`${BASE_URL}/settings/global?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(settings))
    });
    return res.ok;
  } catch (err) {
    console.error('Cloud save settings error:', err);
    return false;
  }
};

// ==========================================
// CUSTOMER PROFILES CLOUD SYNC
// ==========================================

export const fetchCloudCustomers = async () => {
  try {
    const res = await fetch(`${BASE_URL}/customers?key=${API_KEY}&pageSize=300`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    console.error('Cloud fetch customers error:', err);
    return null;
  }
};

export const saveCloudCustomer = async (customer) => {
  if (!customer || !customer.phone) return false;
  try {
    const cleanId = String(customer.phone).trim().replace(/[^0-9+]/g, '');
    const docId = encodeURIComponent(cleanId);
    const res = await fetch(`${BASE_URL}/customers/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc({ id: cleanId, ...customer }))
    });
    return res.ok;
  } catch (err) {
    console.error('Cloud save customer error:', err);
    return false;
  }
};

export const deleteCloudCustomer = async (phone) => {
  if (!phone) return false;
  try {
    const cleanId = String(phone).trim().replace(/[^0-9+]/g, '');
    const docId = encodeURIComponent(cleanId);
    const res = await fetch(`${BASE_URL}/customers/${docId}?key=${API_KEY}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('Cloud delete customer error:', err);
    return false;
  }
};

// ==========================================
// MEDICINES CLOUD SYNC
// ==========================================

export const fetchCloudMedicines = async () => {
  try {
    const res = await fetch(`${BASE_URL}/medicines?key=${API_KEY}&pageSize=100`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDoc).filter(Boolean);
  } catch (err) {
    return null;
  }
};

export const saveCloudMedicine = async (medicine) => {
  if (!medicine || !medicine.id) return false;
  try {
    const docId = encodeURIComponent(medicine.id);
    const res = await fetch(`${BASE_URL}/medicines/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(medicine))
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

