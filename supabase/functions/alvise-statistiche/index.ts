// Restituisce le statistiche di igiallidialvise.it a chi conosce la password.
// La password sta nel segreto STATISTICHE_PASSWORD del progetto, mai nel codice né nel sito.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGINE = "https://igiallidialvise.it";
const MESI_DI_CONSERVAZIONE = 24;
const ATTESA_DOPO_ERRORE_MS = 900;
const CORS = {
  "Access-Control-Allow-Origin": ORIGINE,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Vary": "Origin",
};

const json = (stato: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status: stato, headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function impronta(testo: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(testo)));
}

// Confronto a tempo costante, su impronte della stessa lunghezza.
async function uguali(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([impronta(a), impronta(b)]);
  let diversi = 0;
  for (let i = 0; i < x.length; i++) diversi |= x[i] ^ y[i];
  return diversi === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { errore: "metodo non ammesso" });
  if (req.headers.get("origin") !== ORIGINE) return json(403, { errore: "origine non ammessa" });

  const attesa = Deno.env.get("STATISTICHE_PASSWORD") ?? "";
  if (attesa.length < 12) return json(503, { errore: "password non impostata" });

  let password = "";
  try {
    const dati = await req.json();
    password = typeof dati.password === "string" ? dati.password.slice(0, 200) : "";
  } catch {
    return json(400, { errore: "richiesta non valida" });
  }
  if (!password || !(await uguali(password, attesa))) {
    await new Promise((r) => setTimeout(r, ATTESA_DOPO_ERRORE_MS));
    return json(401, { errore: "password errata" });
  }

  const banca = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const limite = new Date();
  limite.setMonth(limite.getMonth() - MESI_DI_CONSERVAZIONE);
  const pulizia = await banca.from("alvise_visite").delete().lt("quando", limite.toISOString());
  if (pulizia.error) console.error("alvise-statistiche: pulizia non riuscita:", pulizia.error.message);

  const { data, error } = await banca.rpc("alvise_statistiche");
  if (error) {
    console.error("alvise-statistiche: lettura non riuscita:", error.message);
    return json(500, { errore: "lettura non riuscita" });
  }
  return json(200, data);
});
