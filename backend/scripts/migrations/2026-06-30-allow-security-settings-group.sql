-- Extend settings.group_name constraint to allow security category.
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_group_name_check;

ALTER TABLE settings
ADD CONSTRAINT settings_group_name_check
CHECK (group_name IN ('general', 'contact', 'seo', 'security'));
