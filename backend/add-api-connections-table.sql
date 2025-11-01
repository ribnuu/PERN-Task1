-- Create API connections table to track person matches and cross-references
CREATE TABLE IF NOT EXISTS api_connections (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  matched_person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  match_type VARCHAR(50) NOT NULL, -- 'duplicate_entry', 'cross_reference', etc.
  source_section VARCHAR(100) NOT NULL, -- Which section triggered the match
  target_sections TEXT[], -- Array of sections where the person exists
  match_details JSONB, -- Additional match information
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_connections_person_id ON api_connections(person_id);
CREATE INDEX IF NOT EXISTS idx_api_connections_matched_person_id ON api_connections(matched_person_id);
CREATE INDEX IF NOT EXISTS idx_api_connections_match_type ON api_connections(match_type);
CREATE INDEX IF NOT EXISTS idx_api_connections_source_section ON api_connections(source_section);
CREATE INDEX IF NOT EXISTS idx_api_connections_created_at ON api_connections(created_at);

-- Add comments for documentation
COMMENT ON TABLE api_connections IS 'Tracks person matches and cross-references for the API Connection feature';
COMMENT ON COLUMN api_connections.person_id IS 'The person being entered/checked';
COMMENT ON COLUMN api_connections.matched_person_id IS 'The existing person that was found';
COMMENT ON COLUMN api_connections.match_type IS 'Type of match found (duplicate_entry, cross_reference, etc.)';
COMMENT ON COLUMN api_connections.source_section IS 'Which section triggered the duplicate check';
COMMENT ON COLUMN api_connections.target_sections IS 'Array of sections where the matched person exists';
COMMENT ON COLUMN api_connections.match_details IS 'Additional details about the match (JSON format)';
COMMENT ON COLUMN api_connections.resolved IS 'Whether this match has been reviewed/resolved';
COMMENT ON COLUMN api_connections.notes IS 'Admin notes about this match';