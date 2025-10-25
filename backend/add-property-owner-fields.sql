-- Add property owner information fields to properties table
-- These fields will store information about who owns/owned the property (different from the person who has it in the investigation)

ALTER TABLE properties 
ADD COLUMN owner_full_name VARCHAR(200),
ADD COLUMN owner_nic VARCHAR(20),
ADD COLUMN owner_passport VARCHAR(20);

-- Add indexes for better performance on owner information lookups
CREATE INDEX idx_properties_owner_nic ON properties(owner_nic);
CREATE INDEX idx_properties_owner_passport ON properties(owner_passport);

-- Add a comment to document the purpose of these fields
COMMENT ON COLUMN properties.owner_full_name IS 'Full name of the property owner (may differ from the person in investigation)';
COMMENT ON COLUMN properties.owner_nic IS 'NIC number of the property owner';
COMMENT ON COLUMN properties.owner_passport IS 'Passport number of the property owner';