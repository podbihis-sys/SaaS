-- Sets passwords for the Supabase service roles to the value of $POSTGRES_PASSWORD.
-- The roles themselves are created by the supabase/postgres image's baked-in
-- migrations; this script only (re)sets their passwords on first DB init.
--
-- psql reads the password from the container environment via the backtick shell
-- escape, so no secret is hard-coded in this file.

\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator WITH PASSWORD :'pgpass';
ALTER USER pgbouncer WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_functions_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_admin WITH PASSWORD :'pgpass';
