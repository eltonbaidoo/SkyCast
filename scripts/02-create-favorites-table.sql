-- Create favorites table for storing user's favorite cities
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users_sync(id) ON DELETE CASCADE,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_city_name ON favorites(city_name);
