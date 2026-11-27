// Pagina riservata: chiede la password, la spedisce alla funzione di servizio e disegna i numeri.
// La password non viene salvata: resta in memoria finché la pagina è aperta.
(() => {
  const INDIRIZZO = 'https://xaccwdyyqqnoqpnbomtc.supabase.co/functions/v1/alvise-statistiche';
  const PERIODI = [['oggi', 'Oggi'], ['ieri', 'Ieri'], ['sette_giorni', 'Ultimi 7 giorni'], ['trenta_giorni', 'Ultimi 30 giorni'], ['totale', 'Dall’inizio']];
  const NOMI_PAGINE = {
    '/': 'Pagina iniziale', '/giochi/': 'I giochi', '/giochi/valigie.html': 'Gioco: le valigie', '/giochi/pouff.html': 'Gioco: Pouff',
    '/giochi/biscotti.html': 'Gioco: i biscotti', '/giochi/due-secondi.html': 'Gioco: due secondi', '/giochi/passo-di-emma.html': 'Gioco: il passo di Emma',
    '/giochi/che-bertolin-sei.html': 'Gioco: che Bertolin sei', '/libri/l-orologio-di-alexanderplatz/': 'L’orologio di Alexanderplatz',
    '/libri/le-transenne-del-louvre/': 'Le transenne del Louvre', '/libri/cinque-orologi-da-otto-euro/': 'Cinque orologi da otto euro',
    '/genitori-e-insegnanti/': 'Genitori e insegnanti', '/glossario/': 'Glossario', '/grazie-aid/': 'Grazie ad AID', '/riservatezza/': 'Riservatezza',
  };
  const NOMI_VOCI = { diretta: 'Diretta', telefono: 'Telefono', tablet: 'Tablet', computer: 'Computer' };
  const ERRORI = {
    401: 'Password errata.',
    403: 'Questa pagina funziona soltanto da igiallidialvise.it.',
    503: 'La password non è ancora stata impostata nel servizio.',
  };

  const $ = (id) => document.getElementById(id);
  const numero = (n) => Number(n || 0).toLocaleString('it-IT', { useGrouping: 'always' });
  const crea = (nome, testo, classe) => {
    const e = document.createElement(nome);
    if (testo !== undefined) e.textContent = testo;
    if (classe) e.className = classe;
    return e;
  };
  const giornoLeggibile = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

  let password = '';

  function mostraNumeri(contenitore, valori) {
    contenitore.replaceChildren(...PERIODI.map(([chiave, etichetta]) => {
      const blocco = crea('div');
      blocco.append(crea('dt', etichetta), crea('dd', numero(valori && valori[chiave])));
      return blocco;
    }));
  }

  function mostraElenco(contenitore, voci, nomi) {
    if (!voci || !voci.length) {
      contenitore.replaceChildren(crea('li', 'Ancora nessun dato.', 'vuoto'));
      return;
    }
    const massimo = Math.max(...voci.map((v) => v.n));
    contenitore.replaceChildren(...voci.map((v) => {
      const riga = crea('li');
      riga.style.setProperty('--quota', Math.round((v.n / massimo) * 100) + '%');
      riga.append(crea('span', (nomi && nomi[v.voce]) || v.voce), crea('span', numero(v.n)));
      return riga;
    }));
  }

  function mostraGiorni(giorni) {
    const massimo = Math.max(1, ...giorni.map((g) => g.pagine));
    $('giorni').replaceChildren(...giorni.map((g, i) => {
      const colonna = crea('div', undefined, 'stat__colonna' + (i === giorni.length - 1 ? ' stat__colonna--oggi' : ''));
      colonna.title = giornoLeggibile(g.giorno) + ': ' + numero(g.ingressi) + ' ingressi, ' + numero(g.pagine) + ' pagine viste';
      const interne = crea('span');
      interne.style.height = ((g.pagine - g.ingressi) / massimo) * 100 + '%';
      const esterni = crea('span', undefined, 'esterni');
      esterni.style.height = (g.ingressi / massimo) * 100 + '%';
      colonna.append(interne, esterni);
      return colonna;
    }));
    $('tabella-giorni').tBodies[0].replaceChildren(...giorni.slice().reverse().map((g) => {
      const riga = crea('tr');
      riga.append(crea('td', giornoLeggibile(g.giorno)), crea('td', numero(g.ingressi)), crea('td', numero(g.pagine)));
      return riga;
    }));
  }

  function mostra(dati) {
    mostraNumeri($('numeri-ingressi'), dati.ingressi);
    mostraNumeri($('numeri-pagine'), dati.pagine_viste);
    mostraGiorni(dati.giorni || []);
    mostraElenco($('provenienze'), dati.provenienze, NOMI_VOCI);
    mostraElenco($('dispositivi'), dati.dispositivi, NOMI_VOCI);
    mostraElenco($('pagine'), dati.pagine, NOMI_PAGINE);
    $('aggiornato').textContent = dati.aggiornato ? 'Aggiornato alle ' + dati.aggiornato.slice(11) + ' del ' + giornoLeggibile(dati.aggiornato.slice(0, 10)) + '.' : '';
    $('dal').textContent = dati.dal ? 'Il conteggio è iniziato il ' + new Date(dati.dal + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + '.' : 'Il conteggio non ha ancora registrato visite.';
    $('ingresso').hidden = true;
    $('quadro').hidden = false;
  }

  async function carica() {
    $('avviso').textContent = 'Un momento…';
    let risposta;
    try {
      risposta = await fetch(INDIRIZZO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }), cache: 'no-store' });
    } catch (e) {
      $('avviso').textContent = 'Il servizio non risponde. Riprova tra poco.';
      return false;
    }
    if (!risposta.ok) {
      $('avviso').textContent = ERRORI[risposta.status] || 'Qualcosa non ha funzionato (errore ' + risposta.status + ').';
      return false;
    }
    try {
      mostra(await risposta.json());
    } catch (e) {
      $('avviso').textContent = 'La risposta del servizio non è leggibile.';
      return false;
    }
    $('avviso').textContent = '';
    return true;
  }

  function esci() {
    password = '';
    $('password').value = '';
    $('quadro').hidden = true;
    $('ingresso').hidden = false;
    $('password').focus();
  }

  $('modulo').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    password = $('password').value;
    const riuscito = await carica();
    $('password').value = '';
    if (!riuscito) { password = ''; $('password').focus(); }
  });
  $('ricarica').addEventListener('click', async () => { if (!(await carica())) esci(); });
  $('esci').addEventListener('click', esci);
})();
