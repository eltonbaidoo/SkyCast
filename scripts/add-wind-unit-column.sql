-- Add wind_unit column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS wind_unit VARCHAR(10) DEFAULT 'kmh' CHECK (wind_unit IN ('kmh', 'mph'));

-- Update existing records to have default wind_unit
UPDATE user_preferences 
SET wind_unit = 'kmh' 
WHERE wind_unit IS NULL;
