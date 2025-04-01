-- Create a function to get the latest status for all services
CREATE OR REPLACE FUNCTION get_latest_status_for_all_services()
RETURNS TABLE (
  service_id UUID,
  name VARCHAR,
  url VARCHAR,
  description TEXT,
  status_code INTEGER,
  response_time INTEGER,
  is_operational BOOLEAN,
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_checks AS (
    SELECT DISTINCT ON (sc.service_id)
      sc.service_id,
      s.name,
      s.url,
      s.description,
      sc.status_code,
      sc.response_time,
      sc.is_operational,
      sc.timestamp
    FROM status_checks sc
    JOIN services s ON sc.service_id = s.id
    ORDER BY sc.service_id, sc.timestamp DESC
  )
  SELECT * FROM latest_checks;
END;
$$ LANGUAGE plpgsql; 