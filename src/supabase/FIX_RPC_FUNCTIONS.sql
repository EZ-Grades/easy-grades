-- ============================================================================
-- FIX RPC FUNCTIONS FOR EZ GRADES
-- ============================================================================
-- This adds/fixes RPC functions that were missing or had errors
-- Run this after UNIFIED_SCHEMA.sql and AUTO_PROFILE_TRIGGER.sql
-- ============================================================================

-- ============================================================================
-- GET DAILY INSPIRATION
-- ============================================================================
-- Returns a single inspiration based on the current date
-- Uses deterministic selection so the same quote appears all day

CREATE OR REPLACE FUNCTION get_daily_inspiration()
RETURNS TABLE (
  id UUID,
  type TEXT,
  content TEXT,
  author TEXT,
  category TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.type,
    i.content,  -- Fixed: was 'quote', now 'content'
    i.author,
    i.category,
    i.is_active,
    i.created_at
  FROM inspirations i
  WHERE i.is_active = true
  ORDER BY md5(i.id::text || CURRENT_DATE::text)  -- Deterministic daily selection
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ RPC FUNCTIONS FIXED/CREATED';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Function: get_daily_inspiration()';
  RAISE NOTICE '   - Returns daily inspiration based on current date';
  RAISE NOTICE '   - Uses correct column name: content (not quote)';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
