"""Bundle the web build into one self-contained HTML file.

    npx expo export --platform web --output-dir /tmp/webspa   # web.output: "single"
    python scripts/build_web_preview.py --dist /tmp/webspa \
        --data /tmp/preview_data.json --out /tmp/preview.html

The point is to be able to *look at the app* without deploying anything: one
file, no server, no backend. Two things make that possible.

**Everything is inlined.** The stylesheet and the JS bundle go into the page,
and every asset the bundle references by URL becomes a data: URI, because the
file will be served from somewhere that has no /assets directory.

**The API is answered from a snapshot.** A small shim installed ahead of the
bundle intercepts `fetch` for `/api-preview/...` and replies from catalogue
data captured from the real service — the same places, offices and
responsibilities the app would get from the server. Watches and alerts live in
memory for the length of the visit, so the flows can be clicked through.

What this is not: a deployment. Nothing polls an authority, no appointment is
real, and anything written disappears on reload. It is the interface, driven
by real catalogue data.
"""

from __future__ import annotations

import argparse
import base64
import mimetypes
import re
from pathlib import Path

SHIM = """
<script>
(function () {
  // expo-router matches on the address bar, and a host that serves the page
  // from any path other than "/" would render "Unmatched Route" before a
  // single screen appeared. Rewriting first costs nothing and self-heals on
  // reload, because this runs again.
  if (window.location.pathname !== '/') {
    try {
      window.history.replaceState(null, '', '/');
    } catch (e) {
      /* a sandbox that forbids it will simply show the router's fallback */
    }
  }

  const DATA = __PREVIEW_DATA__;
  const now = Date.now();
  const state = { watches: [], notifications: [], bookings: [] };

  /** Deterministic, plausible appointments so the screens are not empty. */
  function slotsFor(office, service, count) {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      const day = new Date(now + (i + 2) * 86400000);
      day.setHours(9 + (i % 4), (i % 2) * 30, 0, 0);
      out.push({
        id: `slot-${office.id}-${i}`,
        office_id: office.id,
        service_id: service ? service.id : `svc-${i}`,
        starts_at: day.toISOString(),
        ends_at: new Date(day.getTime() + 1800000).toISOString(),
        capacity: 1,
        status: 'available',
        first_seen_at: new Date(now - 3600000).toISOString(),
        last_seen_at: new Date(now).toISOString(),
        office_name: office.name,
        city: office.city,
        service_name: service ? service.name : 'Termin',
        category: service ? service.category : 'sonstiges',
        timezone: office.timezone || 'Europe/Berlin',
      });
    }
    return out;
  }

  function allOffices() {
    return Object.values(DATA.offices).flatMap((page) => page.items);
  }

  function previewSlots() {
    const offices = allOffices().filter((o) => o.scan_enabled).slice(0, 6);
    return offices.flatMap((o, i) => slotsFor(o, (o.services || [])[0], 3 - (i % 2)));
  }

  function searchPlaces(q) {
    const key = (q || '').trim().toLowerCase();
    if (!key) return [];
    if (DATA.places[key]) return DATA.places[key];
    const hit = Object.keys(DATA.places).find((k) => k.startsWith(key));
    return hit ? DATA.places[hit] : [];
  }

  function searchOffices(params) {
    const city = (params.get('city') || params.get('q') || '').trim().toLowerCase();
    if (city && DATA.offices[city]) return DATA.offices[city];
    const items = city
      ? allOffices().filter(
          (o) =>
            o.city.toLowerCase().includes(city) ||
            o.name.toLowerCase().includes(city) ||
            (o.postal_code || '').startsWith(city),
        )
      : allOffices().slice(0, 25);
    return { items: items.slice(0, 25), total: items.length, limit: 25, offset: 0 };
  }

  function reply(body, status) {
    return new Response(JSON.stringify(body === undefined ? null : body), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  function handle(method, path, params, body) {
    if (path === '/auth/device' || path === '/auth/devices') {
      return reply({
        token: 'preview-token',
        expires_at: new Date(now + 31536000000).toISOString(),
        user_id: 'preview-user',
      });
    }
    if (path === '/offices/categories') return reply(DATA.categories);
    if (path === '/offices') return reply(searchOffices(params));
    if (path.startsWith('/offices/')) {
      const id = path.slice('/offices/'.length);
      return reply(allOffices().find((o) => o.id === id) || null, 200);
    }
    if (path === '/places') return reply(searchPlaces(params.get('q')));
    if (path.startsWith('/places/')) {
      return reply(DATA.place_detail[path.slice('/places/'.length)] || null);
    }
    if (path === '/slots') return reply(previewSlots());
    if (path.startsWith('/slots/')) {
      return reply(previewSlots().find((s) => s.id === path.slice('/slots/'.length)) || null);
    }
    if (path === '/watches') {
      if (method === 'POST') {
        const watch = {
          id: `watch-${state.watches.length + 1}`,
          created_at: new Date().toISOString(),
          active: true,
          paused_until: null,
          expires_at: null,
          last_alert_at: null,
          alert_count: 0,
          matching_slots: 0,
          ...body,
        };
        state.watches.unshift(watch);
        return reply(watch, 201);
      }
      return reply(state.watches);
    }
    if (path.startsWith('/watches/')) {
      const id = path.split('/')[2];
      const watch = state.watches.find((w) => w.id === id);
      if (method === 'DELETE') {
        state.watches = state.watches.filter((w) => w.id !== id);
        return reply(null, 204);
      }
      if (method === 'PATCH' && watch) {
        Object.assign(watch, body);
        return reply(watch);
      }
      return reply(watch ? { ...watch, slots: previewSlots().slice(0, 4) } : null);
    }
    if (path === '/notifications') return reply(state.notifications);
    if (path === '/bookings' && method === 'POST') {
      const booking = {
        id: `booking-${state.bookings.length + 1}`,
        slot_id: body && body.slot_id,
        watch_id: (body && body.watch_id) || null,
        status: 'handed_off',
        handoff_url: 'https://example.org/terminportal',
        created_at: new Date().toISOString(),
        resolved_at: null,
        note: null,
      };
      state.bookings.unshift(booking);
      return reply(booking, 201);
    }
    if (path === '/bookings') return reply(state.bookings);
    if (path === '/health' || path === '/health/ready') return reply({ status: 'ok' });
    return reply({ code: 'not_found', message: 'Vorschau: nicht enthalten' }, 404);
  }

  const original = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const raw = typeof input === 'string' ? input : input && input.url;
    if (!raw || raw.indexOf('api-preview') === -1) return original(input, init);
    // The app builds `new URL(base + path)` and so needs an absolute base;
    // the preview build points it at a host that does not exist, and every
    // request to it is answered here instead of going out.
    const url = new URL(raw, window.location.origin);
    const path =
      url.pathname.replace(/^\\/api-preview/, '').replace(/^\\/api\\/v1/, '') || '/';
    const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    let body = null;
    try {
      body = init && init.body ? JSON.parse(init.body) : null;
    } catch (e) {
      body = null;
    }
    return Promise.resolve(handle(method, path, url.searchParams, body));
  };
})();
</script>
"""


def inline_assets(bundle: str, dist: Path) -> tuple[str, int]:
    """Replace every "/assets/..." the bundle names with a data: URI."""
    replaced = 0
    for path in sorted(dist.glob("assets/**/*")):
        if not path.is_file():
            continue
        ref = "/" + path.relative_to(dist).as_posix()
        if ref not in bundle:
            continue
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        bundle = bundle.replace(ref, f"data:{mime};base64,{data}")
        replaced += 1
    return bundle, replaced


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", required=True, help="expo export output (web.output: single)")
    parser.add_argument("--data", required=True, help="API snapshot as JSON")
    parser.add_argument("--out", required=True)
    parser.add_argument("--title", default="TerminRadar — Vorschau")
    args = parser.parse_args()

    dist = Path(args.dist)
    shell = (dist / "index.html").read_text(encoding="utf-8")

    styles = [
        (dist / href.lstrip("/")).read_text(encoding="utf-8")
        for href in dict.fromkeys(re.findall(r'<link[^>]+href="(/_expo/[^"]+\.css)"', shell))
    ]
    # react-native-web needs the page itself to be the viewport; ScrollViews do
    # their own scrolling and a scrolling body fights them.
    # The host paints its own ground in the viewer's theme, so the page states
    # the app's surface colour rather than letting a dark ground show through
    # at the edges of a light interface.
    styles.insert(
        0,
        "html,body{height:100%;margin:0;background:#f8fafc;color-scheme:light}"
        "body{overflow:hidden}#root{display:flex;height:100%;flex:1}",
    )

    match = re.search(r'<script src="(/_expo/[^"]+\.js)"', shell)
    if match is None:
        raise SystemExit("no bundle <script> in index.html — is web.output 'single'?")
    bundle = (dist / match.group(1).lstrip("/")).read_text(encoding="utf-8")
    bundle, replaced = inline_assets(bundle, dist)

    shim = SHIM.replace("__PREVIEW_DATA__", Path(args.data).read_text(encoding="utf-8"))

    # Emitted as a fragment, not a document: the host wraps it in its own
    # <html>/<head>/<body>, and a second set would nest one page inside another.
    page = "\n".join(
        [
            f"<title>{args.title}</title>",
            "<style>" + "\n".join(styles) + "</style>",
            '<div id="root"></div>',
            shim,  # installed before the bundle makes its first request
            f"<script>{bundle}</script>",
        ]
    )

    out = Path(args.out)
    out.write_text(page, encoding="utf-8")
    print(f"{out} — {out.stat().st_size / 1024 / 1024:.1f} MB, {replaced} Assets eingebettet")


if __name__ == "__main__":
    main()
