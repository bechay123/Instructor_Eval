-- Create instant setup requests table
CREATE TABLE IF NOT EXISTS instant_setup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    request_type TEXT DEFAULT 'instant_setup',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_instant_setup_requests_email ON instant_setup_requests(email);

-- Add index for created_at to sort by newest first
CREATE INDEX IF NOT EXISTS idx_instant_setup_requests_created_at ON instant_setup_requests(created_at DESC);

-- Enable Row Level Security (optional - for public access)
ALTER TABLE instant_setup_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for landing page form)
CREATE POLICY "Allow public insert for instant setup requests"
ON instant_setup_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Only authenticated users (admins) can view
CREATE POLICY "Allow authenticated users to view instant setup requests"
ON instant_setup_requests FOR SELECT
TO authenticated
USING (true);

-- Grant permissions
GRANT INSERT ON instant_setup_requests TO anon;
GRANT SELECT ON instant_setup_requests TO authenticated;

-- Comment on table
COMMENT ON TABLE instant_setup_requests IS 'Stores email addresses of users requesting instant setup/onboarding assistance';
