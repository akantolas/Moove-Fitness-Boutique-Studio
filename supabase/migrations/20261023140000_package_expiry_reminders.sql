-- The expiry the member was last reminded about. A later expiry (e.g. an admin +1)
-- differs from it, so that package is reminded again.
alter table public.user_packages add column if not exists expiry_reminder_for timestamptz;
