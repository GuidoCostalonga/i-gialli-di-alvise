// Registra una pagina vista di igiallidialvise.it, in forma anonima.
// Non salva indirizzo IP né stringa del navigatore: solo pagina, provenienza e tipo di dispositivo.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGINE = "https://igiallidialvise.it";
const SITO = "igiallidialvise.it";
const CORS = {
  "Access-Control-Allow-Origin": ORIGINE,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Vary": "Origin",
};
const AUTOMI = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|facebookexternalhit|whatsapp|curl|wget|python|node-fetch|axios/i;
const PAGINA_VALIDA = /^\/[a-z0-9\-._/]{0,199}$/i;

const risposta = (stato: number) => new Response(null, { status: stato, headers: CORS });

function leggiProvenienza(valore: unknown): string {
  if (typeof valore !== "string" || !valore) return "diretta";
  try {
    const host = new URL(valore).hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return "diretta";
    return host === SITO ? "interna" : host.slice(0, 100);
  } catch {
    return "diretta";
  }
}

function leggiDispositivo(navigatore: string): string {
  if (/ipad|tablet/i.test(navigatore)) return "tablet";
  if (/mobi|iphone|android/i.test(navigatore)) return "telefono";
  return "computer";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return risposta(204);
  if (req.method !== "POST") return risposta(405);
  if (req.headers.get("origin") !== ORIGINE) return risposta(403);

  const navigatore = req.headers.get("user-agent") ?? "";
  if (!navigatore || AUTOMI.test(navigatore)) return risposta(204);

  let dati: { p?: unknown; r?: unknown };
  try {
    const testo = await req.text();
    if (testo.length > 2000) return risposta(413);
    dati = JSON.parse(testo);
  } catch {
    return risposta(400);
  }
  const pagina = typeof dati.p === "string" ? dati.p : "";
  if (!PAGINA_VALIDA.test(pagina)) return risposta(400);

  const banca = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { error } = await banca.from("alvise_visite").insert({
    pagina,
    provenienza: leggiProvenienza(dati.r),
    dispositivo: leggiDispositivo(navigatore),
  });
  if (error) {
    console.error("alvise-visita: scrittura non riuscita:", error.message);
    return risposta(500);
  }
  return risposta(204);
});
