-- ============================================================
-- 1Fi SDE1 Assignment — Database Schema
-- Dialect: SQLite (portable to PostgreSQL — see notes at bottom)
-- ============================================================

DROP TABLE IF EXISTS emi_plans;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;

-- ------------------------------------------------------------
-- products: one row per product family (e.g. "iPhone 17 Pro")
-- ------------------------------------------------------------
CREATE TABLE products (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT    NOT NULL UNIQUE,          -- used in URL: /products/:slug
    name          TEXT    NOT NULL,                  -- e.g. "iPhone 17 Pro"
    brand         TEXT    NOT NULL,                  -- e.g. "Apple"
    description   TEXT,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- product_variants: 2+ per product (color / storage / finish)
-- Pricing & image live on the variant because they differ per variant.
-- ------------------------------------------------------------
CREATE TABLE product_variants (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name          TEXT    NOT NULL,                  -- e.g. "Silver · 256 GB"
    color         TEXT    NOT NULL,
    storage       TEXT    NOT NULL,
    finish        TEXT,
    mrp           INTEGER NOT NULL CHECK (mrp > 0),  -- paise-free, store in ₹
    price         INTEGER NOT NULL CHECK (price > 0 AND price <= mrp),
    image_url     TEXT    NOT NULL,                  -- served from /images/*
    is_default    BOOLEAN NOT NULL DEFAULT 0,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- ------------------------------------------------------------
-- emi_plans: mutual-fund-backed EMI plans, per variant
-- ------------------------------------------------------------
CREATE TABLE emi_plans (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    variant_id      INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    tenure_months   INTEGER NOT NULL CHECK (tenure_months > 0),
    interest_rate   REAL    NOT NULL DEFAULT 0 CHECK (interest_rate >= 0),  -- % p.a.
    cashback        INTEGER NOT NULL DEFAULT 0,      -- flat ₹ cashback, 0 = none
    provider        TEXT    NOT NULL,                -- e.g. "1Fi Mutual Fund Plan"
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (variant_id, tenure_months, interest_rate)
);

CREATE INDEX idx_emi_variant ON emi_plans(variant_id);

-- ------------------------------------------------------------
-- PostgreSQL port notes:
--   INTEGER PRIMARY KEY AUTOINCREMENT -> SERIAL PRIMARY KEY
--   DATETIME DEFAULT CURRENT_TIMESTAMP -> TIMESTAMPTZ DEFAULT now()
--   BOOLEAN 0/1 -> FALSE/TRUE
-- ------------------------------------------------------------
