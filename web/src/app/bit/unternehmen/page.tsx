import { permanentRedirect } from "next/navigation";

/** Die Unternehmensseite lebt jetzt unter /bit/die-bit (wie im Original /die-bit). */
export default function UnternehmenRedirect() {
  permanentRedirect("/bit/die-bit");
}
