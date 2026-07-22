-- Migration: Auto-populate JAKIM zones and representative mosques
-- Description: Creates jakim_zones table with actual JAKIM administrative zones (1 zone = 1 representative masjid)
-- Created: 2026-07-16
-- Feature: 007-tv-landing-tiers

-- 1. Create jakim_zones table
CREATE TABLE IF NOT EXISTS jakim_zones (
  zone_code VARCHAR(10) PRIMARY KEY,
  zone_name_ms VARCHAR(255) NOT NULL,
  zone_name_en VARCHAR(255) NOT NULL,
  state_ms VARCHAR(100) NOT NULL,
  state_en VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL CHECK (region IN ('peninsular', 'sabah', 'sarawak')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on region for faster lookups
CREATE INDEX IF NOT EXISTS idx_jakim_zones_region ON jakim_zones(region);
CREATE INDEX IF NOT EXISTS idx_jakim_zones_is_active ON jakim_zones(is_active);

-- 2. Alter masjids table to add zone support if not exists
-- This assumes masjids table exists; adjust if structure differs
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masjids') THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'masjids' AND column_name = 'zone_code') THEN
      ALTER TABLE masjids ADD COLUMN zone_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'masjids' AND column_name = 'is_auto_populated') THEN
      ALTER TABLE masjids ADD COLUMN is_auto_populated BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'masjids' AND column_name = 'tier') THEN
      ALTER TABLE masjids ADD COLUMN tier VARCHAR(50) DEFAULT 'asas';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'masjids' AND column_name = 'display_id') THEN
      ALTER TABLE masjids ADD COLUMN display_id UUID;
    END IF;

    -- Add foreign key constraint if not exists
    BEGIN
      ALTER TABLE masjids 
      ADD CONSTRAINT fk_masjids_zone_code 
      FOREIGN KEY (zone_code) REFERENCES jakim_zones(zone_code) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      -- Constraint may already exist
      NULL;
    END;
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_masjids_zone_code ON masjids(zone_code);
    CREATE INDEX IF NOT EXISTS idx_masjids_tier ON masjids(tier);
    CREATE INDEX IF NOT EXISTS idx_masjids_is_auto_populated ON masjids(is_auto_populated);
    CREATE INDEX IF NOT EXISTS idx_masjids_display_id ON masjids(display_id);
  END IF;
END $$;

-- 5. Ensure generated masjid scope is aligned to official zone seed list and
-- one tv_display exists for each generated masjid when absent.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masjids') THEN
    -- Ensure every generated Asas masjid in official zones has a display_id value.
    UPDATE masjids m
    SET display_id = gen_random_uuid()
    WHERE m.is_auto_populated = true
      AND m.tier = 'asas'
      AND m.display_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM jakim_zones z
        WHERE z.zone_code = m.zone_code
          AND z.is_active = true
      );

    -- Seed exactly one tv_display for generated masjids that currently have none.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tv_displays') THEN
      INSERT INTO tv_displays (
        id,
        masjid_id,
        display_name,
        description,
        is_active,
        created_at,
        updated_at
      )
      SELECT
        m.display_id,
        m.id,
        'Auto Generated Display',
        'Auto-seeded display for generated Asas masjid',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM masjids m
      WHERE m.is_auto_populated = true
        AND m.tier = 'asas'
        AND m.display_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM jakim_zones z
          WHERE z.zone_code = m.zone_code
            AND z.is_active = true
        )
        AND NOT EXISTS (
          SELECT 1
          FROM tv_displays d
          WHERE d.masjid_id = m.id
        )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- 3. Insert all JAKIM zones from official JAKIM prayer time zones (jakim-api.ts)
-- All 68 zones with proper zone codes and area descriptions
INSERT INTO jakim_zones (zone_code, zone_name_ms, zone_name_en, state_ms, state_en, region, is_active)
VALUES
-- JOHOR (JHR01-JHR04)
('JHR01', 'Kawasan Pulau Aur dan Pulau Pemanggil', 'Pulau Aur and Pulau Pemanggil Zone', 'Johor', 'Johor', 'peninsular', true),
('JHR02', 'Kawasan Johor Bahru, Kota Tinggi, Mersing, Kulai', 'Johor Bahru, Kota Tinggi, Mersing, Kulai Zone', 'Johor', 'Johor', 'peninsular', true),
('JHR03', 'Kawasan Kluang dan Pontian', 'Kluang and Pontian Zone', 'Johor', 'Johor', 'peninsular', true),
('JHR04', 'Kawasan Batu Pahat, Muar, Segamat, Gemas dan Tangkak', 'Batu Pahat, Muar, Segamat, Gemas, Tangkak Zone', 'Johor', 'Johor', 'peninsular', true),
-- KEDAH (KDH01-KDH07)
('KDH01', 'Kawasan Kota Setar, Kubang Pasu, Pokok Sena', 'Kota Setar, Kubang Pasu, Pokok Sena Zone', 'Kedah', 'Kedah', 'peninsular', true),
('KDH02', 'Kawasan Kuala Muda, Yan, Pendang', 'Kuala Muda, Yan, Pendang Zone', 'Kedah', 'Kedah', 'peninsular', true),
('KDH03', 'Kawasan Padang Terap dan Sik', 'Padang Terap and Sik Zone', 'Kedah', 'Kedah', 'peninsular', true),
('KDH04', 'Kawasan Baling', 'Baling Zone', 'Kedah', 'Kedah', 'peninsular', true),
('KDH05', 'Kawasan Bandar Baharu dan Kulim', 'Bandar Baharu and Kulim Zone', 'Kedah', 'Kedah', 'peninsular', true),
('KDH06', 'Kawasan Langkawi', 'Langkawi Zone', 'Kedah', 'Kedah', 'peninsular', true),
('KDH07', 'Kawasan Gunung Jerai', 'Gunung Jerai Zone', 'Kedah', 'Kedah', 'peninsular', true),
-- KELANTAN (KTN01, KTN03)
('KTN01', 'Kawasan Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai', 'Bachok, Kota Bharu, Machang Zone', 'Kelantan', 'Kelantan', 'peninsular', true),
('KTN03', 'Kawasan Gua Musang, Mukim Galas, Bertam', 'Gua Musang, Mukim Galas, Bertam Zone', 'Kelantan', 'Kelantan', 'peninsular', true),
-- MELAKA (MLK01)
('MLK01', 'Kawasan Seluruh Negeri Melaka', 'Entire Melaka Zone', 'Melaka', 'Melaka', 'peninsular', true),
-- NEGERI SEMBILAN (NGS01-NGS02)
('NGS01', 'Kawasan Tampin dan Jempol', 'Tampin and Jempol Zone', 'Negeri Sembilan', 'Negeri Sembilan', 'peninsular', true),
('NGS02', 'Kawasan Jelebu, Kuala Pilah, Port Dickson, Rembau, Seremban', 'Jelebu, Kuala Pilah, Port Dickson Zone', 'Negeri Sembilan', 'Negeri Sembilan', 'peninsular', true),
-- PAHANG (PHG01-PHG06)
('PHG01', 'Kawasan Pulau Tioman', 'Pulau Tioman Zone', 'Pahang', 'Pahang', 'peninsular', true),
('PHG02', 'Kawasan Kuantan, Pekan, Rompin, Muadzam Shah', 'Kuantan, Pekan, Rompin, Muadzam Shah Zone', 'Pahang', 'Pahang', 'peninsular', true),
('PHG03', 'Kawasan Jerantut, Temerloh, Maran, Bera, Chenor, Jengka', 'Jerantut, Temerloh Zone', 'Pahang', 'Pahang', 'peninsular', true),
('PHG04', 'Kawasan Bentong, Lipis, Raub', 'Bentong, Lipis, Raub Zone', 'Pahang', 'Pahang', 'peninsular', true),
('PHG05', 'Kawasan Genting Sempah, Janda Baik, Bukit Tinggi', 'Genting Sempah, Janda Baik Zone', 'Pahang', 'Pahang', 'peninsular', true),
('PHG06', 'Kawasan Cameron Highlands, Genting Highlands, Bukit Fraser', 'Cameron Highlands Zone', 'Pahang', 'Pahang', 'peninsular', true),
-- PULAU PINANG (PNG01)
('PNG01', 'Kawasan Seluruh Negeri Pulau Pinang', 'Entire Penang Zone', 'Pulau Pinang', 'Penang', 'peninsular', true),
-- PERAK (PRK01-PRK07)
('PRK01', 'Kawasan Tapah, Slim River, Tanjung Malim', 'Tapah, Slim River, Tanjung Malim Zone', 'Perak', 'Perak', 'peninsular', true),
('PRK02', 'Kawasan Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar', 'Kuala Kangsar, Ipoh Zone', 'Perak', 'Perak', 'peninsular', true),
('PRK03', 'Kawasan Lenggong, Pengkalan Hulu, Grik', 'Lenggong, Pengkalan Hulu, Grik Zone', 'Perak', 'Perak', 'peninsular', true),
('PRK04', 'Kawasan Temengor dan Belum', 'Temengor and Belum Zone', 'Perak', 'Perak', 'peninsular', true),
('PRK05', 'Kawasan Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor', 'Teluk Intan Zone', 'Perak', 'Perak', 'peninsular', true),
('PRK06', 'Kawasan Selama, Taiping, Bagan Serai, Parit Buntar', 'Taiping Zone', 'Perak', 'Perak', 'peninsular', true),
('PRK07', 'Kawasan Bukit Larut', 'Bukit Larut Zone', 'Perak', 'Perak', 'peninsular', true),
-- PERLIS (PLS01)
('PLS01', 'Kawasan Kangar, Padang Besar, Arau', 'Kangar, Padang Besar, Arau Zone', 'Perlis', 'Perlis', 'peninsular', true),
-- SELANGOR (SGR01-SGR03)
('SGR01', 'Kawasan Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Rawang, S.Alam', 'Gombak, Petaling, Sepang Zone', 'Selangor', 'Selangor', 'peninsular', true),
('SGR02', 'Kawasan Sabak Bernam dan Kuala Selangor', 'Sabak Bernam and Kuala Selangor Zone', 'Selangor', 'Selangor', 'peninsular', true),
('SGR03', 'Kawasan Klang dan Kuala Langat', 'Klang and Kuala Langat Zone', 'Selangor', 'Selangor', 'peninsular', true),
-- TERENGGANU (TRG01-TRG04)
('TRG01', 'Kawasan Kuala Terengganu, Marang, Kuala Nerus', 'Kuala Terengganu Zone', 'Terengganu', 'Terengganu', 'peninsular', true),
('TRG02', 'Kawasan Besut dan Setiu', 'Besut and Setiu Zone', 'Terengganu', 'Terengganu', 'peninsular', true),
('TRG03', 'Kawasan Hulu Terengganu', 'Hulu Terengganu Zone', 'Terengganu', 'Terengganu', 'peninsular', true),
('TRG04', 'Kawasan Dungun dan Kemaman', 'Dungun and Kemaman Zone', 'Terengganu', 'Terengganu', 'peninsular', true),
-- WILAYAH PERSEKUTUAN (WLY01-WLY02)
('WLY01', 'Kawasan Kuala Lumpur dan Putrajaya', 'Kuala Lumpur and Putrajaya Zone', 'Wilayah Persekutuan', 'Federal Territories', 'peninsular', true),
('WLY02', 'Kawasan Labuan', 'Labuan Zone', 'Labuan', 'Labuan', 'peninsular', true),
-- SABAH (SBH01-SBH09)
('SBH01', 'Kawasan Bahagian Sandakan (Timur)', 'Sandakan East Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH02', 'Kawasan Bahagian Sandakan (Barat)', 'Sandakan West Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH03', 'Kawasan Bahagian Tawau (Timur)', 'Tawau East Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH04', 'Kawasan Bahagian Tawau (Barat)', 'Tawau West Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH05', 'Kawasan Kudat, Kota Marudu, Pitas, Pulau Banggi', 'Kudat Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH06', 'Kawasan Gunung Kinabalu', 'Gunung Kinabalu Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH07', 'Kawasan Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan', 'Kota Kinabalu Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH08', 'Kawasan Pensiangan, Keningau, Tambunan, Nabawan', 'Keningau Zone', 'Sabah', 'Sabah', 'sabah', true),
('SBH09', 'Kawasan Sipitang, Membakut, Beaufort, Kuala Penyu, Weston, Tenom, Long Pasia', 'Sipitang Zone', 'Sabah', 'Sabah', 'sabah', true),
-- SARAWAK (SWK01-SWK09)
('SWK01', 'Kawasan Limbang, Lawas, Sundar, Trusan', 'Limbang Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK02', 'Kawasan Miri, Niah, Bekenu, Sibuti, Marudi', 'Miri Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK03', 'Kawasan Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu', 'Bintulu Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK04', 'Kawasan Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit', 'Sibu Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK05', 'Kawasan Sarikei, Meradong, Julau, Rajang, Bitangor, Belawai', 'Sarikei Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK06', 'Kawasan Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok', 'Sri Aman Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK07', 'Kawasan Serian, Simunjan, Samarahan, Sebuyau, Meludam', 'Serian Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK08', 'Kawasan Kuching, Bau, Lundu, Sematan', 'Kuching Zone', 'Sarawak', 'Sarawak', 'sarawak', true),
('SWK09', 'Kawasan Zon Khas Kampung Patarikan', 'Special Zone Kampung Patarikan', 'Sarawak', 'Sarawak', 'sarawak', true)
ON CONFLICT (zone_code) DO NOTHING;

-- 4. Insert representative mosques for each zone (1 masjid per zone)
-- Each zone has exactly 1 representative masjid for free tier discovery
DO $$
DECLARE
  v_super_admin_id UUID;
BEGIN
  -- Prefer explicit admin owner first, then any super admin.
  SELECT id INTO v_super_admin_id
  FROM public.users
  WHERE email = 'admin@e-masjid.my'
  LIMIT 1;

  IF v_super_admin_id IS NULL THEN
    SELECT id INTO v_super_admin_id
    FROM public.users
    WHERE role = 'super_admin'
    LIMIT 1;
  END IF;

  -- If admin exists only in auth.users, mirror it into public.users as super_admin.
  IF v_super_admin_id IS NULL THEN
    SELECT id INTO v_super_admin_id
    FROM auth.users
    WHERE email = 'admin@e-masjid.my'
    LIMIT 1;

    IF v_super_admin_id IS NOT NULL THEN
      INSERT INTO public.users (id, email, role, created_at, updated_at, email_verified)
      VALUES (
        v_super_admin_id,
        'admin@e-masjid.my',
        'super_admin',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        true
      )
      ON CONFLICT (id) DO UPDATE
      SET
        role = 'super_admin',
        email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified,
        updated_at = EXCLUDED.updated_at;
    END IF;
  END IF;
  
  -- Insert only if masjids table exists and a valid owner is available.
  IF v_super_admin_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masjids') THEN
    INSERT INTO masjids (id, name, zone_code, tier, display_id, prayer_times_source, is_auto_populated, status, created_by, address)
    VALUES
    -- JOHOR (JHR01-JHR04) - 4 zones
    (gen_random_uuid(), 'Masjid Kawasan JHR01 - Pulau Aur dan Pulau Pemanggil', 'JHR01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan JHR02 - Johor Bahru, Kota Tinggi, Mersing, Kulai', 'JHR02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan JHR03 - Kluang dan Pontian', 'JHR03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan JHR04 - Batu Pahat, Muar, Segamat, Gemas dan Tangkak', 'JHR04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- KEDAH (KDH01-KDH07) - 7 zones
    (gen_random_uuid(), 'Masjid Kawasan KDH01 - Kota Setar, Kubang Pasu, Pokok Sena', 'KDH01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KDH02 - Kuala Muda, Yan, Pendang', 'KDH02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KDH03 - Padang Terap dan Sik', 'KDH03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KDH04 - Baling', 'KDH04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KDH05 - Bandar Baharu dan Kulim', 'KDH05', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KDH06 - Langkawi', 'KDH06', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KDH07 - Gunung Jerai', 'KDH07', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- KELANTAN (KTN01, KTN03) - 2 zones
    (gen_random_uuid(), 'Masjid Kawasan KTN01 - Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai', 'KTN01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan KTN03 - Gua Musang, Mukim Galas, Bertam', 'KTN03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- MELAKA (MLK01) - 1 zone
    (gen_random_uuid(), 'Masjid Kawasan MLK01 - Seluruh Negeri Melaka', 'MLK01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- NEGERI SEMBILAN (NGS01-NGS02) - 2 zones
    (gen_random_uuid(), 'Masjid Kawasan NGS01 - Tampin dan Jempol', 'NGS01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan NGS02 - Jelebu, Kuala Pilah, Port Dickson, Rembau, Seremban', 'NGS02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- PAHANG (PHG01-PHG06) - 6 zones
    (gen_random_uuid(), 'Masjid Kawasan PHG01 - Pulau Tioman', 'PHG01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PHG02 - Kuantan, Pekan, Rompin, Muadzam Shah', 'PHG02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PHG03 - Jerantut, Temerloh, Maran, Bera, Chenor, Jengka', 'PHG03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PHG04 - Bentong, Lipis, Raub', 'PHG04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PHG05 - Genting Sempah, Janda Baik, Bukit Tinggi', 'PHG05', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PHG06 - Cameron Highlands, Genting Highlands, Bukit Fraser', 'PHG06', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- PULAU PINANG (PNG01) - 1 zone
    (gen_random_uuid(), 'Masjid Kawasan PNG01 - Seluruh Negeri Pulau Pinang', 'PNG01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- PERAK (PRK01-PRK07) - 7 zones
    (gen_random_uuid(), 'Masjid Kawasan PRK01 - Tapah, Slim River, Tanjung Malim', 'PRK01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PRK02 - Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar', 'PRK02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PRK03 - Lenggong, Pengkalan Hulu, Grik', 'PRK03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PRK04 - Temengor dan Belum', 'PRK04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PRK05 - Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor', 'PRK05', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PRK06 - Selama, Taiping, Bagan Serai, Parit Buntar', 'PRK06', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan PRK07 - Bukit Larut', 'PRK07', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- PERLIS (PLS01) - 1 zone
    (gen_random_uuid(), 'Masjid Kawasan PLS01 - Kangar, Padang Besar, Arau', 'PLS01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- SELANGOR (SGR01-SGR03) - 3 zones
    (gen_random_uuid(), 'Masjid Kawasan SGR01 - Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Rawang, S.Alam', 'SGR01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SGR02 - Sabak Bernam dan Kuala Selangor', 'SGR02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SGR03 - Klang dan Kuala Langat', 'SGR03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- TERENGGANU (TRG01-TRG04) - 4 zones
    (gen_random_uuid(), 'Masjid Kawasan TRG01 - Kuala Terengganu, Marang, Kuala Nerus', 'TRG01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan TRG02 - Besut dan Setiu', 'TRG02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan TRG03 - Hulu Terengganu', 'TRG03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan TRG04 - Dungun dan Kemaman', 'TRG04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- WILAYAH PERSEKUTUAN (WLY01-WLY02) - 2 zones
    (gen_random_uuid(), 'Masjid Kawasan WLY01 - Kuala Lumpur dan Putrajaya', 'WLY01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan WLY02 - Labuan', 'WLY02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- SABAH (SBH01-SBH09) - 9 zones
    (gen_random_uuid(), 'Masjid Kawasan SBH01 - Bahagian Sandakan (Timur)', 'SBH01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH02 - Bahagian Sandakan (Barat)', 'SBH02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH03 - Bahagian Tawau (Timur)', 'SBH03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH04 - Bahagian Tawau (Barat)', 'SBH04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH05 - Kudat, Kota Marudu, Pitas, Pulau Banggi', 'SBH05', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH06 - Gunung Kinabalu', 'SBH06', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH07 - Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan', 'SBH07', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH08 - Pensiangan, Keningau, Tambunan, Nabawan', 'SBH08', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SBH09 - Sipitang, Membakut, Beaufort, Kuala Penyu, Weston, Tenom, Long Pasia', 'SBH09', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    -- SARAWAK (SWK01-SWK09) - 9 zones
    (gen_random_uuid(), 'Masjid Kawasan SWK01 - Limbang, Lawas, Sundar, Trusan', 'SWK01', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK02 - Miri, Niah, Bekenu, Sibuti, Marudi', 'SWK02', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK03 - Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu', 'SWK03', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK04 - Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit', 'SWK04', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK05 - Sarikei, Meradong, Julau, Rajang, Bitangor, Belawai', 'SWK05', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK06 - Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok', 'SWK06', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK07 - Serian, Simunjan, Samarahan, Sebuyau, Meludam', 'SWK07', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK08 - Kuching, Bau, Lundu, Sematan', 'SWK08', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}'),
    (gen_random_uuid(), 'Masjid Kawasan SWK09 - Zon Khas Kampung Patarikan', 'SWK09', 'asas', gen_random_uuid(), 'jakim', true, 'active', v_super_admin_id, '{"address_line_1":"Auto Generated Masjid","city":"Kuala Lumpur","state":"Kuala Lumpur","postcode":"50000","country":"MYS"}')
    ON CONFLICT DO NOTHING;
  ELSIF v_super_admin_id IS NULL THEN
    RAISE NOTICE 'Skipping representative masjid auto-population: no super_admin user found.';
  END IF;
END $$;

-- 6. Backfill one tv_display for every generated Asas masjid in active zones.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masjids')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tv_displays') THEN
    UPDATE masjids m
    SET display_id = gen_random_uuid()
    WHERE m.is_auto_populated = true
      AND m.tier = 'asas'
      AND m.status = 'active'
      AND m.display_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM jakim_zones z
        WHERE z.zone_code = m.zone_code
          AND z.is_active = true
      );

    INSERT INTO tv_displays (
      id,
      masjid_id,
      display_name,
      description,
      is_active,
      created_at,
      updated_at
    )
    SELECT
      m.display_id,
      m.id,
      'Auto Generated Display',
      'Auto-seeded display for generated Asas masjid',
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM masjids m
    WHERE m.is_auto_populated = true
      AND m.tier = 'asas'
      AND m.status = 'active'
      AND m.display_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM jakim_zones z
        WHERE z.zone_code = m.zone_code
          AND z.is_active = true
      )
      AND NOT EXISTS (
        SELECT 1
        FROM tv_displays d
        WHERE d.masjid_id = m.id
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Policy 1: Allow anonymous SELECT for Asas tier
DROP POLICY IF EXISTS "Allow public read Asas tier masjids" ON masjids;
CREATE POLICY "Allow public read Asas tier masjids"
ON masjids
FOR SELECT
USING (tier = 'asas' OR auth.role() = 'authenticated');

-- Policy 2: Allow authenticated users to UPDATE their own masjid
DROP POLICY IF EXISTS "Allow users to update own masjids" ON masjids;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masjids' AND column_name = 'owner_id'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow users to update own masjids" ON masjids FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid())';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masjids' AND column_name = 'created_by'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow users to update own masjids" ON masjids FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid())';
  END IF;
END $$;

-- Policy 3: Allow authenticated users to DELETE their own masjid
DROP POLICY IF EXISTS "Allow users to delete own masjids" ON masjids;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masjids' AND column_name = 'owner_id'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow users to delete own masjids" ON masjids FOR DELETE USING (owner_id = auth.uid())';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masjids' AND column_name = 'created_by'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow users to delete own masjids" ON masjids FOR DELETE USING (created_by = auth.uid())';
  END IF;
END $$;

-- Enable RLS on masjids table
ALTER TABLE masjids ENABLE ROW LEVEL SECURITY;

-- 7. Add/update RLS policies for jakim_zones table (public read access)

-- Policy: Allow public read of all active zones
DROP POLICY IF EXISTS "Allow public read jakim zones" ON jakim_zones;
CREATE POLICY "Allow public read jakim zones"
ON jakim_zones
FOR SELECT
USING (is_active = true);

-- Enable RLS on jakim_zones table
ALTER TABLE jakim_zones ENABLE ROW LEVEL SECURITY;

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_jakim_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_jakim_zones_updated_at ON jakim_zones;
CREATE TRIGGER trigger_update_jakim_zones_updated_at
BEFORE UPDATE ON jakim_zones
FOR EACH ROW
EXECUTE FUNCTION update_jakim_zones_updated_at();

-- 9. Grant permissions
GRANT SELECT ON jakim_zones TO anon;
GRANT SELECT ON masjids TO anon;
GRANT SELECT, UPDATE, DELETE ON masjids TO authenticated;

-- Logging
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_log') THEN
    INSERT INTO migration_log (migration_name, status, executed_at)
    VALUES ('auto_populate_jakim_zones', 'completed', CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
