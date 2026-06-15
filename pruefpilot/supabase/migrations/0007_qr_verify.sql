-- Öffentliche QR-Verifikation: unguessbares Token je Gerät + kuratierte Read-RPC.

-- 128-Bit URL-sicheres Token (hex). gen_random_bytes ist volatile -> pro Bestandszeile eigener Wert.
alter table devices
    add column verify_token text not null default encode(gen_random_bytes(16), 'hex');

create unique index devices_verify_token_idx on devices (verify_token);

-- Liefert NUR unkritische Felder + letzte Prüfung. security definer umgeht RLS;
-- anon erhält kein direktes Tabellenrecht, nur Ausführung dieser Funktion.
create or replace function verify_device(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    select jsonb_build_object(
        'name', d.name,
        'category_id', d.category_id,
        'status', d.status,
        'next_due_date', d.next_due_date,
        'last_inspected_at', li.inspected_at,
        'last_result', li.result,
        'last_inspector', li.inspector_name
    )
    from devices d
    left join lateral (
        select inspected_at, result, inspector_name
        from inspections i
        where i.device_id = d.id
        order by i.inspected_at desc, i.created_at desc
        limit 1
    ) li on true
    where d.verify_token = p_token;
$$;

revoke all on function verify_device(text) from public;
grant execute on function verify_device(text) to anon, authenticated;
