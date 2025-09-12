-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    raw_json JSONB NOT NULL, -- stores hashed password and other user data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- for soft deletes
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_sync_email ON users_sync(email);
CREATE INDEX IF NOT EXISTS idx_users_sync_deleted_at ON users_sync(deleted_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_users_sync_updated_at ON users_sync;
CREATE TRIGGER update_users_sync_updated_at
    BEFORE UPDATE ON users_sync
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
