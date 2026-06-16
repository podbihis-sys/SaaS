-- 0002_harden_handle_new_user.sql
--
-- Security hardening flagged by the Supabase advisor: a SECURITY DEFINER
-- function is, by default, EXECUTE-able by PUBLIC, which exposes it via the
-- PostgREST RPC endpoint (/rest/v1/rpc/handle_new_user) to anon/authenticated.
--
-- public.handle_new_user() is only ever meant to run as the on_auth_user_created
-- trigger. Revoking EXECUTE from the API roles removes the RPC exposure; the
-- trigger keeps working because it fires inside the auth.users INSERT.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
