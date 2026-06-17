-- Publishes the JWT secret/expiry to the database settings so PostgREST and
-- the SQL helpers (auth.jwt(), auth.uid(), RLS policies) can verify tokens.
-- Values are read from the container environment at first DB init.

\set jwt_secret `echo "$JWT_SECRET"`
\set jwt_exp `echo "$JWT_EXP"`

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO :'jwt_exp';
