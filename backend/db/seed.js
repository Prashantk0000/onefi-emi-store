/**
 * 1Fi  — Database seed script
 * Usage: npm run seed   (drops & recreates schema, inserts demo data)
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'onefi.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---- create schema ----
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// ---- seed data ----
const insertProduct = db.prepare(
  `INSERT INTO products (slug, name, brand, description) VALUES (?, ?, ?, ?)`
);
const insertVariant = db.prepare(
  `INSERT INTO product_variants
     (product_id, name, color, storage, finish, mrp, price, image_url, is_default)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const insertPlan = db.prepare(
  `INSERT INTO emi_plans (variant_id, tenure_months, interest_rate, cashback, provider)
   VALUES (?, ?, ?, ?, ?)`
);

const PRODUCTS = [
  {
    slug: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    brand: 'Apple',
    description:
      'Apple iPhone 17 Pro with A19 Pro chip, 48MP Pro camera system and titanium design.',
    variants: [
      {
        name: 'Silver · 256 GB', color: 'Silver', storage: '256 GB', finish: 'Titanium',
        mrp: 134900, price: 129900, image: '/images/iphone-17-pro-silver.jpg', isDefault: 1,
        plans: [
          { tenure: 3, rate: 0, cashback: 0, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 6, rate: 0, cashback: 2000, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 9, rate: 10.5, cashback: 0, provider: '1Fi Growth MF Plan' },
          { tenure: 12, rate: 10.5, cashback: 5000, provider: '1Fi Growth MF Plan' },
          { tenure: 18, rate: 13.0, cashback: 0, provider: '1Fi Flexi MF Plan' },
        ],
      },
      {
        name: 'Cosmic Orange · 512 GB', color: 'Cosmic Orange', storage: '512 GB', finish: 'Titanium',
        mrp: 154900, price: 149900, image: '/images/iphone-17-pro-orange.jpg', isDefault: 0,
        plans: [
          { tenure: 3, rate: 0, cashback: 0, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 6, rate: 0, cashback: 2500, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 12, rate: 10.5, cashback: 6000, provider: '1Fi Growth MF Plan' },
          { tenure: 24, rate: 13.0, cashback: 0, provider: '1Fi Flexi MF Plan' },
        ],
      },
    ],
  },
  {
    slug: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    description:
      'Galaxy S24 Ultra with Galaxy AI, 200MP camera, Snapdragon 8 Gen 3 and built-in S Pen.',
    variants: [
      {
        name: 'Titanium Gray · 256 GB', color: 'Titanium Gray', storage: '256 GB', finish: 'Titanium',
        mrp: 129999, price: 121999, image: '/images/s24-ultra-gray.jpg', isDefault: 1,
        plans: [
          { tenure: 6, rate: 0, cashback: 3000, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 9, rate: 10.5, cashback: 0, provider: '1Fi Growth MF Plan' },
          { tenure: 12, rate: 10.5, cashback: 4000, provider: '1Fi Growth MF Plan' },
        ],
      },
      {
        name: 'Titanium Violet · 512 GB', color: 'Titanium Violet', storage: '512 GB', finish: 'Titanium',
        mrp: 139999, price: 131999, image: '/images/s24-ultra-violet.jpg', isDefault: 0,
        plans: [
          { tenure: 6, rate: 0, cashback: 0, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 12, rate: 10.5, cashback: 4500, provider: '1Fi Growth MF Plan' },
          { tenure: 18, rate: 13.0, cashback: 0, provider: '1Fi Flexi MF Plan' },
        ],
      },
    ],
  },
  {
    slug: 'pixel-9-pro',
    name: 'Google Pixel 9 Pro',
    brand: 'Google',
    description:
      'Google Pixel 9 Pro with Gemini AI, triple rear camera and 7 years of OS updates.',
    variants: [
      {
        name: 'Porcelain · 128 GB', color: 'Porcelain', storage: '128 GB', finish: 'Matte Glass',
        mrp: 109999, price: 99999, image: '/images/pixel-9-pro-porcelain.jpg', isDefault: 1,
        plans: [
          { tenure: 3, rate: 0, cashback: 0, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 6, rate: 0, cashback: 1500, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 12, rate: 10.5, cashback: 3500, provider: '1Fi Growth MF Plan' },
        ],
      },
      {
        name: 'Hazel · 256 GB', color: 'Hazel', storage: '256 GB', finish: 'Matte Glass',
        mrp: 119999, price: 109999, image: '/images/pixel-9-pro-hazel.jpg', isDefault: 0,
        plans: [
          { tenure: 6, rate: 0, cashback: 2000, provider: '1Fi Zero-Cost MF Plan' },
          { tenure: 9, rate: 10.5, cashback: 0, provider: '1Fi Growth MF Plan' },
          { tenure: 18, rate: 13.0, cashback: 4000, provider: '1Fi Flexi MF Plan' },
        ],
      },
    ],
  },
];

const seedAll = db.transaction(() => {
  for (const p of PRODUCTS) {
    const { lastInsertRowid: productId } = insertProduct.run(p.slug, p.name, p.brand, p.description);
    for (const v of p.variants) {
      const { lastInsertRowid: variantId } = insertVariant.run(
        productId, v.name, v.color, v.storage, v.finish, v.mrp, v.price, v.image, v.isDefault
      );
      for (const plan of v.plans) {
        insertPlan.run(variantId, plan.tenure, plan.rate, plan.cashback, plan.provider);
      }
    }
  }
});

seedAll();

const counts = {
  products: db.prepare('SELECT COUNT(*) c FROM products').get().c,
  variants: db.prepare('SELECT COUNT(*) c FROM product_variants').get().c,
  plans: db.prepare('SELECT COUNT(*) c FROM emi_plans').get().c,
};
console.log(`✅ Seeded ${DB_PATH}`);
console.log(`   products: ${counts.products}, variants: ${counts.variants}, emi_plans: ${counts.plans}`);
db.close();
