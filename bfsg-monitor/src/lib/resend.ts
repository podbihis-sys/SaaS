import { Resend } from "resend";

import { DISCLAIMERS } from "./constants";

let client: Resend | null = null;

function getResend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured.");
    client = new Resend(key);
  }
  return client;
}

const FROM = process.env.RESEND_FROM ?? "BFSG-Monitor <onboarding@resend.dev>";

export interface ScoreAlertInput {
  to: string;
  domainLabel: string;
  url: string;
  oldScore: number;
  newScore: number;
  link: string;
}

/** Sends a German alert email when a monitored domain's score regresses. */
export async function sendScoreAlert(input: ScoreAlertInput): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `Barrierefreiheit verschlechtert: ${input.domainLabel}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
        <h2>Verschlechterung erkannt</h2>
        <p>Beim letzten Monitoring von <strong>${input.url}</strong> ist der
        Barrierefreiheits-Score von <strong>${input.oldScore}</strong> auf
        <strong>${input.newScore}</strong> gefallen.</p>
        <p><a href="${input.link}">Details ansehen</a></p>
        <hr />
        <p style="color:#666;font-size:12px">${DISCLAIMERS.automatedCoverage}<br/>${DISCLAIMERS.noLegalAdvice}</p>
      </div>
    `,
  });
}
