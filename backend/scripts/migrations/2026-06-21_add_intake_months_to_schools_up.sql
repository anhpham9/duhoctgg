-- Add intake_months to schools
-- Allowed values: 1, 4, 7, 10

ALTER TABLE schools
ADD COLUMN IF NOT EXISTS intake_months SMALLINT[];

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'schools_intake_months_valid'
    ) THEN
        ALTER TABLE schools
        ADD CONSTRAINT schools_intake_months_valid
        CHECK (
            intake_months IS NULL OR (
                intake_months <@ ARRAY[1, 4, 7, 10]::SMALLINT[]
                AND COALESCE(array_length(intake_months, 1), 0) > 0
            )
        );
    END IF;
END $$;
