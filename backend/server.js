/**
 * 1Fi SDE1 Assignment — API server (Express + SQLite)
 * Endpoints:
 *   GET /api/health
 *   GET /api/products            -> list of products w/ default variant summary
 *   GET /api/products/:slug      -> product detail: variants + EMI plans per variant
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'db', 'onefi.db');

// Auto-seed on first boot so `npm start` just works
if (!fs.existsSync(DB_PATH)) {
  console.log('Database not found — running seed...');
  require('./db/seed.js');
}

const db = new Database(DB_PATH, { readonly: true });
db.pragma('foreign_keys = ON');

/** Monthly EMI via standard reducing-balance formula: P·r(1+r)^n / ((1+r)^n − 1) */
function monthlyEmi(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve product images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// In production, serve the built React app
const clientDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ---- List products (summary card per product) ----
app.get('/api/products', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT p.slug, p.name, p.brand,
              v.id AS variant_id, v.name AS variant_name,
              v.mrp, v.price, v.image_url,
              (SELECT MIN(tenure_months) FROM emi_plans WHERE variant_id = v.id) AS min_tenure
       FROM products p
       JOIN product_variants v ON v.product_id = p.id AND v.is_default = 1
       ORDER BY p.id`
    )
    .all();

  res.json({
    products: rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      brand: r.brand,
      variant: r.variant_name,
      mrp: r.mrp,
      price: r.price,
      imageUrl: r.image_url,
      emiStartsAt: Math.round(monthlyEmi(r.price, 0, r.min_tenure || 6)),
    })),
  });
});

// ---- Product detail: all variants, each with its EMI plans ----
app.get('/api/products/:slug', (req, res) => {
  const product = db
    .prepare(`SELECT id, slug, name, brand, description FROM products WHERE slug = ?`)
    .get(req.params.slug);

  if (!product) {
    return res.status(404).json({ error: 'Product not found', slug: req.params.slug });
  }

  const variants = db
    .prepare(
      `SELECT id, name, color, storage, finish, mrp, price, image_url, is_default
       FROM product_variants WHERE product_id = ? ORDER BY is_default DESC, id`
    )
    .all(product.id);

  const planStmt = db.prepare(
    `SELECT id, tenure_months, interest_rate, cashback, provider
     FROM emi_plans WHERE variant_id = ? ORDER BY tenure_months`
  );

  const payload = {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    variants: variants.map((v) => ({
      id: v.id,
      name: v.name,
      color: v.color,
      storage: v.storage,
      finish: v.finish,
      mrp: v.mrp,
      price: v.price,
      imageUrl: v.image_url,
      isDefault: !!v.is_default,
      emiPlans: planStmt.all(v.id).map((p) => {
        const monthly = Math.round(monthlyEmi(v.price, p.interest_rate, p.tenure_months));
        return {
          id: p.id,
          tenureMonths: p.tenure_months,
          interestRate: p.interest_rate,
          cashback: p.cashback,
          provider: p.provider,
          monthlyPayment: monthly,
          totalPayable: monthly * p.tenure_months - p.cashback,
        };
      }),
    })),
  };

  res.json(payload);
});

// SPA fallback (client-side routes like /products/iphone-17-pro)
if (fs.existsSync(clientDist)) {
  app.get(/^(?!\/api|\/images).*/, (_req, res) =>
    res.sendFile(path.join(clientDist, 'index.html'))
  );
}

app.listen(PORT, () => console.log(`🚀 API ready at http://localhost:${PORT}`));
