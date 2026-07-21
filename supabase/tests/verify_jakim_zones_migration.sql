-- Verification script: 20260716000001_auto_populate_jakim_zones.sql
-- Purpose: enforce zone and masjid invariants for TV landing discovery.

DO $$
DECLARE
  v_zone_count integer;
  v_generated_count integer;
  v_missing_zone_count integer;
  v_multi_zone_count integer;
  v_missing_display_id_count integer;
  v_display_violation_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_zone_count
  FROM jakim_zones
  WHERE is_active = true;

  IF v_zone_count <> 58 THEN
    RAISE EXCEPTION 'Expected 58 active JAKIM zones, got %', v_zone_count;
  END IF;

  SELECT COUNT(*)
  INTO v_generated_count
  FROM masjids
  WHERE is_auto_populated = true
    AND tier = 'asas'
    AND status = 'active';

  IF v_generated_count <> v_zone_count THEN
    RAISE EXCEPTION 'Expected one generated Asas masjid per active zone (%), got %', v_zone_count, v_generated_count;
  END IF;

  SELECT COUNT(*)
  INTO v_missing_zone_count
  FROM jakim_zones z
  LEFT JOIN masjids m
    ON m.zone_code = z.zone_code
   AND m.is_auto_populated = true
   AND m.tier = 'asas'
   AND m.status = 'active'
  WHERE z.is_active = true
    AND m.id IS NULL;

  IF v_missing_zone_count <> 0 THEN
    RAISE EXCEPTION 'Found % active zones without generated Asas masjid', v_missing_zone_count;
  END IF;

  SELECT COUNT(*)
  INTO v_multi_zone_count
  FROM (
    SELECT m.zone_code
    FROM masjids m
    JOIN jakim_zones z ON z.zone_code = m.zone_code AND z.is_active = true
    WHERE m.is_auto_populated = true
      AND m.tier = 'asas'
      AND m.status = 'active'
    GROUP BY m.zone_code
    HAVING COUNT(*) <> 1
  ) violations;

  IF v_multi_zone_count <> 0 THEN
    RAISE EXCEPTION 'Found % zones violating 1:1 generated Asas masjid mapping', v_multi_zone_count;
  END IF;

  SELECT COUNT(*)
  INTO v_missing_display_id_count
  FROM masjids m
  JOIN jakim_zones z ON z.zone_code = m.zone_code AND z.is_active = true
  WHERE m.is_auto_populated = true
    AND m.tier = 'asas'
    AND m.status = 'active'
    AND m.display_id IS NULL;

  IF v_missing_display_id_count <> 0 THEN
    RAISE EXCEPTION 'Found % generated Asas masjids without display_id', v_missing_display_id_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tv_displays') THEN
    SELECT COUNT(*)
    INTO v_display_violation_count
    FROM (
      SELECT m.id
      FROM masjids m
      JOIN jakim_zones z ON z.zone_code = m.zone_code AND z.is_active = true
      LEFT JOIN tv_displays d ON d.masjid_id = m.id
      WHERE m.is_auto_populated = true
        AND m.tier = 'asas'
        AND m.status = 'active'
      GROUP BY m.id
      HAVING COUNT(d.id) <> 1
    ) violations;

    IF v_display_violation_count <> 0 THEN
      RAISE EXCEPTION 'Found % generated masjids without exactly one tv_display', v_display_violation_count;
    END IF;
  END IF;

  RAISE NOTICE 'verify_jakim_zones_migration: PASS (active_zones=%, generated_asas=%)', v_zone_count, v_generated_count;
END $$;
