-- Rollback intake_months addition on schools

ALTER TABLE schools
DROP CONSTRAINT IF EXISTS schools_intake_months_valid;

ALTER TABLE schools
DROP COLUMN IF EXISTS intake_months;
