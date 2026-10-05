-- bit-schema.sql
-- Schema der BIT-Website fuer MariaDB (self-hosted, ersetzt Supabase/Postgres).
-- Entspricht den Supabase-Migrationen 0003-0007. Alle Tabellen utf8mb4.
-- JSON-Arrays (sizes/colors/features/applications/tasks) werden als JSON
-- gespeichert; tech als JSON-Array aus {label,value}.
--
-- Ausfuehren:  mysql -u <user> -p <datenbank> < bit-schema.sql
-- Die Datenbank selbst vorher anlegen (siehe docs/bit-plesk-deploy.md).

SET NAMES utf8mb4;

-- ------------------------------------------------------------------ Kategorien
CREATE TABLE IF NOT EXISTS bit_categories (
  id           VARCHAR(190) NOT NULL PRIMARY KEY,         -- natuerlicher Slug-Key
  name         VARCHAR(160) NOT NULL,
  tagline      VARCHAR(240) NULL,
  description  TEXT NULL,
  image_path   VARCHAR(600) NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_bit_categories_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------- Produkte
CREATE TABLE IF NOT EXISTS bit_products (
  id            CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  slug          VARCHAR(200) NOT NULL UNIQUE,
  category_id   VARCHAR(190) NOT NULL,
  code          VARCHAR(120) NOT NULL DEFAULT '',
  name          VARCHAR(240) NOT NULL,
  tagline       VARCHAR(300) NULL,
  description   TEXT NOT NULL,
  material      VARCHAR(240) NULL,
  temperature   VARCHAR(120) NULL,
  unit          VARCHAR(60) NOT NULL DEFAULT 'Stück',
  vpe_type      VARCHAR(20) NULL,                         -- NULL = auto; sonst rolle/laenge/rolle_laenge/meterware
  sizes         JSON NULL,
  colors        JSON NULL,
  features      JSON NULL,
  applications  JSON NULL,
  tech          JSON NULL,                                -- Array aus {label,value}
  datasheet_url VARCHAR(800) NULL,
  image_path    VARCHAR(600) NULL,
  image_alt     VARCHAR(300) NULL,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bit_products_category
    FOREIGN KEY (category_id) REFERENCES bit_categories (id) ON DELETE RESTRICT,
  CONSTRAINT ck_bit_products_vpe_type
    CHECK (vpe_type IS NULL OR vpe_type IN ('rolle','laenge','rolle_laenge','meterware')),
  INDEX ix_bit_products_category (category_id),
  INDEX ix_bit_products_status (status),
  INDEX ix_bit_products_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------- News
CREATE TABLE IF NOT EXISTS bit_news (
  id           CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  slug         VARCHAR(200) NOT NULL UNIQUE,
  title        VARCHAR(300) NOT NULL,
  excerpt      TEXT NOT NULL,
  body         TEXT NOT NULL,
  image_path   VARCHAR(600) NULL,
  image_alt    VARCHAR(300) NULL,
  published_at DATE NULL,
  status       ENUM('draft','published') NOT NULL DEFAULT 'draft',
  sort_order   INT NOT NULL DEFAULT 0,
  title_en     VARCHAR(300) NULL,
  excerpt_en   TEXT NULL,
  body_en      TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_bit_news_status (status),
  INDEX ix_bit_news_published (published_at),
  INDEX ix_bit_news_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ Unterseiten
CREATE TABLE IF NOT EXISTS bit_pages (
  id               CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  slug             VARCHAR(240) NOT NULL UNIQUE,
  title            VARCHAR(300) NOT NULL,
  meta_title       VARCHAR(300) NULL,
  meta_description TEXT NULL,
  body             TEXT NOT NULL,
  status           ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_bit_pages_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------- Stellenanzeigen
CREATE TABLE IF NOT EXISTS bit_jobs (
  id               CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  slug             VARCHAR(200) NOT NULL UNIQUE,
  title            VARCHAR(300) NOT NULL,
  intro            TEXT NOT NULL,
  body             TEXT NOT NULL,
  tasks_title      VARCHAR(240) NOT NULL DEFAULT 'Ihre Aufgaben:',
  tasks            JSON NULL,
  closing          TEXT NOT NULL,
  title_en         VARCHAR(300) NULL,
  intro_en         TEXT NULL,
  body_en          TEXT NULL,
  tasks_title_en   VARCHAR(300) NULL,
  tasks_en         JSON NULL,
  closing_en       TEXT NULL,
  sort_order       INT NOT NULL DEFAULT 0,
  status           ENUM('draft','published') NOT NULL DEFAULT 'published',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_bit_jobs_status (status),
  INDEX ix_bit_jobs_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------ FAQ
CREATE TABLE IF NOT EXISTS bit_faq (
  id          CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  group_name  VARCHAR(200) NOT NULL DEFAULT '',
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  status      ENUM('draft','published') NOT NULL DEFAULT 'published',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_bit_faq_status (status),
  INDEX ix_bit_faq_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------- Team-Kontakte
CREATE TABLE IF NOT EXISTS bit_team (
  id          CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(200) NOT NULL,
  role        VARCHAR(240) NOT NULL DEFAULT '',
  phone       VARCHAR(80) NOT NULL DEFAULT '',
  email       VARCHAR(240) NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  css_only    BOOLEAN NOT NULL DEFAULT FALSE,
  status      ENUM('draft','published') NOT NULL DEFAULT 'published',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_bit_team_status (status),
  INDEX ix_bit_team_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------- Textbausteine (Key/Value)
CREATE TABLE IF NOT EXISTS bit_content (
  `key`      VARCHAR(200) NOT NULL PRIMARY KEY,
  `value`    TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------- Admin-Konten
-- Ohne Supabase-Auth: eigenes Konto mit bcrypt-Passwort-Hash. Eine gueltige
-- Zeile hier IST die Freischaltung (Whitelist). Anlegen per create-admin.mjs.
CREATE TABLE IF NOT EXISTS bit_admins (
  id            CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  email         VARCHAR(240) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
