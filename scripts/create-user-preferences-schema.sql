-- Create user_preferences table for storing user settings and preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  temperature_unit VARCHAR(10) DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  notifications_enabled BOOLEAN DEFAULT true,
  auto_location BOOLEAN DEFAULT true,
  refresh_interval INTEGER DEFAULT 300000, -- 5 minutes in milliseconds
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  default_location JSONB, -- {lat: number, lon: number, city: string, country: string}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Update existing favorites table to ensure proper foreign key relationship
ALTER TABLE favorites 
ADD CONSTRAINT fk_favorites_user_id 
FOREIGN KEY (user_id) REFERENCES users_sync(id) ON DELETE CASCADE;
