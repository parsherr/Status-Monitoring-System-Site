-- Update services with test URLs that actually exist
UPDATE services
SET url = 'https://www.google.com'
WHERE name = 'SetScript Ana Sayfa';

UPDATE services
SET url = 'https://www.github.com'
WHERE name = 'SetScript API';

UPDATE services
SET url = 'https://www.microsoft.com'
WHERE name = 'SetScript Docs';

UPDATE services
SET url = 'https://www.apple.com'
WHERE name = 'SetScript AI';

-- Verify the updates
SELECT * FROM services; 