-- Add checks_run column to audits table to track actual checks performed
ALTER TABLE audits
ADD COLUMN IF NOT EXISTS checks_run INTEGER DEFAULT 0;
