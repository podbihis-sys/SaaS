/**
 * Shared visual shell for all transactional e-mails. Table-based layout with
 * inline styles only — the lowest common denominator that renders correctly
 * across Gmail, Outlook, Apple Mail and the various webmail clients.
 */

const BRAND = {
  navy: "#0a1230",
  teal: "#1e6d77",
  tealBright: "#2a9d8f",
  aqua: "#79dede",
  bg: "#eef1f6",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
};

export function escHtml(value: string | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Big call-to-action button (table-based so Outlook renders it). */
export function emailButton(url: string, label: string, hint?: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 6px">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" bgcolor="${BRAND.tealBright}" style="border-radius:999px;background:linear-gradient(135deg,${BRAND.teal},${BRAND.tealBright})">
              <a href="${escHtml(url)}" target="_blank"
                 style="display:inline-block;padding:16px 44px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px">
                ✓&nbsp;&nbsp;${escHtml(label)}
              </a>
            </td>
          </tr>
        </table>
        ${hint ? `<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.muted}">${escHtml(hint)}</p>` : ""}
      </td>
    </tr>
  </table>`;
}

/** Highlighted price / total box. */
export function emailHighlight(label: string, value: string, sub?: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
    <tr>
      <td style="background:#f0fbfa;border:1px solid #bfe8e5;border-radius:12px;padding:20px 24px;text-align:center">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.teal}">${escHtml(label)}</p>
        <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:bold;color:${BRAND.navy}">${escHtml(value)}</p>
        ${sub ? `<p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted}">${escHtml(sub)}</p>` : ""}
      </td>
    </tr>
  </table>`;
}

/** Two-column detail row for the positions table. */
export function emailRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:11px 4px;border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.text}">${label}</td>
    <td align="right" style="padding:11px 4px;border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${BRAND.navy};white-space:nowrap">${value}</td>
  </tr>`;
}

/**
 * Wraps content in the branded shell: soft background, centered 600px card,
 * gradient header with wordmark, white content area, footer.
 */
export function emailShell(opts: {
  /** Short teaser shown next to the subject in the inbox preview. */
  preheader: string;
  /** Subtitle under the wordmark in the header. */
  tagline: string;
  /** Inner HTML of the white content area. */
  content: string;
  /** Footer site URL. */
  siteUrl: string;
}): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg}">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.bg}">
    <tr>
      <td align="center" style="padding:32px 12px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td bgcolor="${BRAND.navy}" style="background:linear-gradient(135deg,${BRAND.navy} 0%,${BRAND.teal} 100%);border-radius:16px 16px 0 0;padding:32px 36px">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:.5px">
                adria<span style="color:${BRAND.aqua}">web</span>code<span style="color:${BRAND.tealBright}">.</span>
              </p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.aqua}">${escHtml(opts.tagline)}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td bgcolor="#ffffff" style="padding:36px;border:1px solid ${BRAND.border};border-top:0">
              ${opts.content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td bgcolor="#ffffff" style="padding:20px 36px 28px;border:1px solid ${BRAND.border};border-top:0;border-radius:0 0 16px 16px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid ${BRAND.border};padding-top:18px">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.muted};text-align:center">
                    <a href="${escHtml(opts.siteUrl)}" style="color:${BRAND.teal};text-decoration:none;font-weight:bold">adriawebcode.com</a>
                    &nbsp;·&nbsp; Web Design &amp; Development
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${BRAND.text}">${text}</p>`;
}

export function emailSmall(text: string): string {
  return `<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted}">${text}</p>`;
}

export function emailHeading(text: string): string {
  return `<h2 style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:19px;color:${BRAND.navy}">${text}</h2>`;
}

export { BRAND };
