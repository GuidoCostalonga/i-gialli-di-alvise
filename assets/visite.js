// Conta la pagina vista, in forma anonima: niente cookie, niente memoria sul dispositivo.
// Rispetta la richiesta di non essere tracciati impostata nel navigatore.
(() => {
  try {
    if (location.hostname !== 'igiallidialvise.it') return;
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    const indirizzo = 'https://xaccwdyyqqnoqpnbomtc.supabase.co/functions/v1/alvise-visita';
    const dati = JSON.stringify({ p: location.pathname, r: document.referrer || '' });
    const spedito = navigator.sendBeacon && navigator.sendBeacon(indirizzo, dati);
    if (!spedito) fetch(indirizzo, { method: 'POST', body: dati, keepalive: true }).catch(() => {});
  } catch (e) { /* il conteggio non deve mai disturbare la pagina */ }
})();
