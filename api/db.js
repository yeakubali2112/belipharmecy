/**
 * Vercel Serverless Function: Supabase PostgreSQL Database API
 * Endpoint: /api/db
 */

import { getDb, isDbConfigured } from './db-client.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if DB credentials are configured
  if (!isDbConfigured()) {
    const errorMsg = 'PostgreSQL database is not configured yet. Please set your Supabase database password in .env.';
    if (req.query?.type === 'test_connection') {
      return res.status(200).json({ connected: false, configured: false, error: errorMsg });
    }
    return res.status(503).json({ 
      error: errorMsg,
      configured: false,
      code: 'DB_NOT_CONFIGURED'
    });
  }

  let sql;
  try {
    sql = getDb();
  } catch (err) {
    return res.status(503).json({ error: err.message, configured: false });
  }

  try {
    // ----------------------------------------------------
    // GET Requests
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const type = req.query?.type || '';

      // Test connection
      if (type === 'test_connection') {
        const result = await sql`SELECT 1 as alive;`;
        return res.status(200).json({ 
          connected: true, 
          configured: true, 
          timestamp: new Date().toISOString(),
          details: 'Supabase PostgreSQL pooler connected successfully!' 
        });
      }

      // Settings
      if (type === 'settings') {
        const rows = await sql`SELECT key, data FROM settings;`;
        const settingsMap = {};
        rows.forEach(r => {
          let val = r.data;
          while (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {
              break;
            }
          }
          settingsMap[r.key] = val;
        });
        return res.status(200).json({ success: true, data: settingsMap });
      }

      // Orders
      if (type === 'orders') {
        const rows = await sql`
          SELECT id, order_number, customer_name, customer_phone, delivery_address, payment_method, total, status, items, data, created_at, updated_at 
          FROM orders 
          ORDER BY created_at DESC 
          LIMIT 500;
        `;
        const orders = rows.map(r => ({
          ...(r.data || {}),
          id: r.id,
          orderNumber: r.order_number,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          deliveryAddress: r.delivery_address,
          paymentMethod: r.payment_method,
          total: Number(r.total),
          status: r.status,
          items: r.items,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
        return res.status(200).json({ success: true, data: orders });
      }

      // Prescriptions
      if (type === 'prescriptions') {
        const rows = await sql`
          SELECT id, customer_name, customer_phone, delivery_address, image_url, notes, status, data, created_at, updated_at 
          FROM prescriptions 
          ORDER BY created_at DESC 
          LIMIT 300;
        `;
        const prescriptions = rows.map(r => ({
          ...(r.data || {}),
          id: r.id,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          deliveryAddress: r.delivery_address,
          image: r.image_url,
          notes: r.notes,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
        return res.status(200).json({ success: true, data: prescriptions });
      }

      // Customers
      if (type === 'customers') {
        const rows = await sql`
          SELECT phone, name, email, address, avatar, data, created_at, updated_at 
          FROM customers 
          ORDER BY updated_at DESC 
          LIMIT 500;
        `;
        const customers = rows.map(r => ({
          ...(r.data || {}),
          phone: r.phone,
          name: r.name,
          email: r.email,
          address: r.address,
          avatar: r.avatar,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
        return res.status(200).json({ success: true, data: customers });
      }

      // Medicines
      if (type === 'medicines') {
        const rows = await sql`
          SELECT id, name, generic, company, category, price_per_strip, pieces_per_strip, stock, discount_percent, image, data, updated_at 
          FROM medicines 
          ORDER BY updated_at DESC;
        `;
        const medicines = rows.map(r => ({
          ...(r.data || {}),
          id: r.id,
          name: r.name,
          generic: r.generic,
          company: r.company,
          category: r.category,
          pricePerStrip: Number(r.price_per_strip),
          piecesPerStrip: Number(r.pieces_per_strip),
          stock: Number(r.stock),
          discountPercent: Number(r.discount_percent),
          image: r.image,
          updatedAt: r.updated_at
        }));
        return res.status(200).json({ success: true, data: medicines });
      }

      return res.status(400).json({ error: 'Invalid query parameter "type"' });
    }

    // ----------------------------------------------------
    // POST Requests
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { action } = body || {};

      // Initialize Schema
      if (action === 'init_schema') {
        await sql`
          CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(100) PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS medicines (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            generic VARCHAR(255),
            company VARCHAR(255),
            category VARCHAR(100),
            price_per_strip NUMERIC DEFAULT 0,
            pieces_per_strip INT DEFAULT 10,
            stock INT DEFAULT 0,
            discount_percent NUMERIC DEFAULT 0,
            image TEXT,
            data JSONB,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(100) PRIMARY KEY,
            order_number VARCHAR(100),
            customer_name VARCHAR(255),
            customer_phone VARCHAR(50),
            delivery_address TEXT,
            payment_method VARCHAR(50),
            total NUMERIC DEFAULT 0,
            status VARCHAR(50) DEFAULT 'Pending',
            items JSONB,
            data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS prescriptions (
            id VARCHAR(100) PRIMARY KEY,
            customer_name VARCHAR(255),
            customer_phone VARCHAR(50),
            delivery_address TEXT,
            image_url TEXT,
            notes TEXT,
            status VARCHAR(50) DEFAULT 'Pending',
            data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS customers (
            phone VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            address TEXT,
            avatar TEXT,
            data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        return res.status(200).json({ success: true, message: 'All tables initialized in Supabase!' });
      }

      // Save Settings
      if (action === 'save_settings') {
        const { key, data } = body;
        if (!key || !data) return res.status(400).json({ error: 'Missing key or data' });
        
        let cleanData = data;
        while (typeof cleanData === 'string') {
          try {
            cleanData = JSON.parse(cleanData);
          } catch {
            break;
          }
        }

        await sql`
          INSERT INTO settings (key, data, updated_at)
          VALUES (${key}, ${sql.json(cleanData)}, NOW())
          ON CONFLICT (key) DO UPDATE
          SET data = EXCLUDED.data, updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Save Single Order
      if (action === 'save_order') {
        const { order } = body;
        if (!order || !order.id) return res.status(400).json({ error: 'Missing order or order.id' });
        await sql`
          INSERT INTO orders (
            id, order_number, customer_name, customer_phone, delivery_address, 
            payment_method, total, status, items, data, updated_at
          )
          VALUES (
            ${order.id},
            ${order.orderNumber || order.id},
            ${order.customerName || ''},
            ${order.customerPhone || ''},
            ${order.deliveryAddress || ''},
            ${order.paymentMethod || 'Cash on Delivery'},
            ${Number(order.total || 0)},
            ${order.status || 'Pending'},
            ${JSON.stringify(order.items || [])},
            ${JSON.stringify(order)},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET 
            customer_name = EXCLUDED.customer_name,
            customer_phone = EXCLUDED.customer_phone,
            delivery_address = EXCLUDED.delivery_address,
            payment_method = EXCLUDED.payment_method,
            total = EXCLUDED.total,
            status = EXCLUDED.status,
            items = EXCLUDED.items,
            data = EXCLUDED.data,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Save Single Prescription
      if (action === 'save_prescription') {
        const { prescription } = body;
        if (!prescription || !prescription.id) return res.status(400).json({ error: 'Missing prescription or prescription.id' });
        await sql`
          INSERT INTO prescriptions (
            id, customer_name, customer_phone, delivery_address, image_url, notes, status, data, updated_at
          )
          VALUES (
            ${prescription.id},
            ${prescription.customerName || ''},
            ${prescription.customerPhone || ''},
            ${prescription.deliveryAddress || ''},
            ${prescription.image || prescription.imageUrl || ''},
            ${prescription.notes || ''},
            ${prescription.status || 'Pending'},
            ${JSON.stringify(prescription)},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET 
            customer_name = EXCLUDED.customer_name,
            customer_phone = EXCLUDED.customer_phone,
            delivery_address = EXCLUDED.delivery_address,
            image_url = EXCLUDED.image_url,
            notes = EXCLUDED.notes,
            status = EXCLUDED.status,
            data = EXCLUDED.data,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Save Single Customer
      if (action === 'save_customer') {
        const { customer } = body;
        if (!customer || !customer.phone) return res.status(400).json({ error: 'Missing customer or customer.phone' });
        await sql`
          INSERT INTO customers (
            phone, name, email, address, avatar, data, updated_at
          )
          VALUES (
            ${customer.phone},
            ${customer.name || ''},
            ${customer.email || ''},
            ${customer.address || ''},
            ${customer.avatar || ''},
            ${JSON.stringify(customer)},
            NOW()
          )
          ON CONFLICT (phone) DO UPDATE
          SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            address = EXCLUDED.address,
            avatar = EXCLUDED.avatar,
            data = EXCLUDED.data,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Delete Customer
      if (action === 'delete_customer') {
        const { phone } = body;
        if (!phone) return res.status(400).json({ error: 'Missing phone' });
        await sql`DELETE FROM customers WHERE phone = ${phone};`;
        return res.status(200).json({ success: true });
      }

      // Save Single Medicine
      if (action === 'save_medicine') {
        const { medicine } = body;
        if (!medicine || !medicine.id) return res.status(400).json({ error: 'Missing medicine or medicine.id' });
        await sql`
          INSERT INTO medicines (
            id, name, generic, company, category, price_per_strip, pieces_per_strip, stock, discount_percent, image, data, updated_at
          )
          VALUES (
            ${medicine.id},
            ${medicine.name || ''},
            ${medicine.generic || ''},
            ${medicine.company || ''},
            ${medicine.category || ''},
            ${Number(medicine.pricePerStrip || 0)},
            ${Number(medicine.piecesPerStrip || 10)},
            ${Number(medicine.stock || 0)},
            ${Number(medicine.discountPercent || 0)},
            ${medicine.image || ''},
            ${JSON.stringify(medicine)},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET 
            name = EXCLUDED.name,
            generic = EXCLUDED.generic,
            company = EXCLUDED.company,
            category = EXCLUDED.category,
            price_per_strip = EXCLUDED.price_per_strip,
            pieces_per_strip = EXCLUDED.pieces_per_strip,
            stock = EXCLUDED.stock,
            discount_percent = EXCLUDED.discount_percent,
            image = EXCLUDED.image,
            data = EXCLUDED.data,
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }

      // Delete Medicine
      if (action === 'delete_medicine') {
        const { medicineId } = body;
        if (!medicineId) return res.status(400).json({ error: 'Missing medicineId' });
        await sql`DELETE FROM medicines WHERE id = ${medicineId};`;
        return res.status(200).json({ success: true });
      }

      // Bulk Save Medicines
      if (action === 'batch_save_medicines') {
        const { medicines } = body;
        if (!Array.isArray(medicines)) return res.status(400).json({ error: 'medicines must be an array' });
        for (const m of medicines) {
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
              ${Number(m.stock || 0)},
              ${Number(m.discountPercent || 0)},
              ${m.image || ''},
              ${JSON.stringify(m)},
              NOW()
            )
            ON CONFLICT (id) DO UPDATE
            SET 
              name = EXCLUDED.name,
              generic = EXCLUDED.generic,
              company = EXCLUDED.company,
              category = EXCLUDED.category,
              price_per_strip = EXCLUDED.price_per_strip,
              pieces_per_strip = EXCLUDED.pieces_per_strip,
              stock = EXCLUDED.stock,
              discount_percent = EXCLUDED.discount_percent,
              image = EXCLUDED.image,
              data = EXCLUDED.data,
              updated_at = NOW();
          `;
        }
        return res.status(200).json({ success: true, count: medicines.length });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Database API error:', error);
    return res.status(500).json({ error: error.message || 'Internal database error' });
  }
}
