import postgres from 'postgres';
import 'dotenv/config';
import { INITIAL_MEDICINES, PHARMACY_CONFIG } from '../src/data/medicines.js';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: 'require',
  prepare: false
});

async function seed() {
  console.log('🌱 Seeding initial settings and medicines to Supabase PostgreSQL...');

  // 1. Seed Settings
  const deliverySettings = {
    deliveryFee: PHARMACY_CONFIG.deliveryFee || 40,
    freeDeliveryThreshold: PHARMACY_CONFIG.freeDeliveryThreshold || 500,
    expressDeliveryFee: PHARMACY_CONFIG.expressDeliveryFee || 80
  };

  const paymentSettings = {
    bkash: {
      enabled: true,
      number: PHARMACY_CONFIG.bkashNumber || '01774 961757',
      type: 'Personal / Merchant',
      instructions: 'বিকাশ অ্যাপ বা *247# ডায়াল করে সেন্ড মানি বা পেমেন্ট সম্পন্ন করুন এবং ট্রানজেকশন আইডি (TrxID) দিন।'
    },
    nagad: {
      enabled: true,
      number: PHARMACY_CONFIG.nagadNumber || '01774 961757',
      type: 'Personal',
      instructions: 'নগদ অ্যাপ বা *167# ডায়াল করে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি (TrxID) দিন।'
    },
    bank: {
      id: 'bank-1',
      enabled: true,
      bankName: 'Islami Bank Bangladesh Ltd (IBBL)',
      accountName: 'Beli Pharmacy (বেলী ফার্মেসি)',
      accountNumber: '2050 1480 2003 4567',
      branchName: 'Dupchanchia Branch, Bogura',
      routingNumber: '125100456',
      instructions: 'অনলাইন ব্যাংক অ্যাপ (iBanking / Cellfin / NexusPay) বা সরাসরি ব্যাংকে ডিপোজিট করে রেফারেন্স/ট্রানজেকশন নম্বর দিন।'
    },
    cod: {
      enabled: true,
      title: 'Cash on Hand (হাতে নগদ)',
      instructions: 'ওষুধ বাসায় ডেলিভারি পাওয়ার পর ডেলিভারি ম্যানকে সরাসরি নগদ অর্থ পরিশোধ করুন।'
    }
  };

  await sql`
    INSERT INTO settings (key, data, updated_at)
    VALUES ('delivery_settings', ${JSON.stringify(deliverySettings)}, NOW())
    ON CONFLICT (key) DO NOTHING;
  `;

  await sql`
    INSERT INTO settings (key, data, updated_at)
    VALUES ('payment_settings', ${JSON.stringify(paymentSettings)}, NOW())
    ON CONFLICT (key) DO NOTHING;
  `;

  console.log('✅ Settings seeded');

  // 2. Seed initial medicines (first 50)
  const seedMeds = (INITIAL_MEDICINES || []).slice(0, 50);
  let count = 0;
  for (const m of seedMeds) {
    if (!m.id) continue;
    await sql`
      INSERT INTO medicines (
        id, name, generic, company, category, price_per_strip, pieces_per_strip, stock, discount_percent, image, data, updated_at
      )
      VALUES (
        ${m.id},
        ${m.name || ''},
        ${m.generic || ''},
        ${m.company || ''},
        ${m.category || ''},
        ${Number(m.pricePerStrip || 0)},
        ${Number(m.piecesPerStrip || 10)},
        ${Number(m.stock || 100)},
        ${Number(m.discountPercent || 0)},
        ${m.image || ''},
        ${JSON.stringify(m)},
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    count++;
  }

  console.log(`✅ ${count} Initial medicines seeded to Supabase`);
  console.log('🎉 Database seeding completed successfully!');
  await sql.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
