-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  temperature_unit VARCHAR(10) DEFAULT 'celsius',
  notifications_enabled BOOLEAN DEFAULT true,
  aut```sql file="scripts/create-user-preferences.sql"
-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  temperature_unit VARCHAR(10) DEFAULT 'celsius',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_location BOOLEAN DEFAULT false,
  refresh_interval INTEGER DEFAULT 300000,
  theme VARCHAR(10) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user locations table for storing user's saved locations
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lon NUMERIC(10, 7) NOT NULL,
  country VARCHAR(100),
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
