-- Insert default preferences for existing users who don't have preferences yet
INSERT INTO user_preferences (user_id, temperature_unit, notifications_enabled, auto_location, refresh_interval, theme)
SELECT 
  id as user_id,
  'celsius' as temperature_unit,
  true as notifications_enabled,
  true as auto_location,
  300000 as refresh_interval,
  'system' as theme
FROM users_sync 
WHERE id NOT IN (SELECT user_id FROM user_preferences);
