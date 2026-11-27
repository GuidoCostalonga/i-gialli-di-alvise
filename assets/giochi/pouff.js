// Dov'è finito il pouff? Trova gli oggetti nella casa in disordine.
(() => {
  const { $, crea, fumetto, nota } = G;
  // posizioni in percentuale sulla tavola, raggio in percentuale della larghezza
  const oggetti = [
    { id: 'pouff', nome: 'Il pouff di papà', x: 16.4, y: 20.4, r: 3.4, chi: 'gino', frase: '«Lo sapevo che era lì. Lo avevo messo io. Per sicurezza.»' },
    { id: 'chiavi', nome: 'Le chiavi di casa', x: 90.7, y: 49.7, r: 3.2, chi: 'elisa', frase: '«Appese alla pianta. Così non le perde: le coltiva.»' },
    { id: 'scarpa', nome: 'Le scarpe di Elisa', x: 95.9, y: 22.9, r: 3.6, chi: 'elisa', frase: '«Non le ho perse. Le ho messe in alto.»' },
    { id: 'occhiali', nome: 'Gli occhiali di Alvise', x: 19.1, y: 51.0, r: 4.2, chi: 'alvise', frase: '«Mi erano scivolati.»' },
    { id: 'taccuino', nome: 'Il taccuino nero', x: 43.9, y: 66.3, r: 4.2, chi: 'alvise', frase: '«Sotto il tavolino. Ci avevo scritto dove lo mettevo.»' },
    { id: 'cerchietto', nome: 'Il cerchietto di Elisa', x: 82.1, y: 15.0, r: 3.4, chi: 'emma', frase: '«Sull’attaccapanni. Io lo sapevo. Nessuno me l’ha chiesto.»' },
    { id: 'braccialetti', nome: 'I braccialetti di Emma', x: 59.3, y: 86.3, r: 4.4, chi: 'emma', frase: '«Erano lì apposta. Stavo ballando.»' },
    { id: 'carte', nome: 'Le carte d’identità', x: 33.9, y: 87.1, r: 6, chi: 'elena', frase: '«Busta trasparente, elastico. Già in valigia.»' },
  ];
  const scena = $('#scena');
  let trovati;
  const cerchio = (x, y, r, classe) => {
    const c = crea('span', { class: 'cerchio ' + (classe || '') });
    c.style.left = x + '%'; c.style.top = y + '%'; c.style.width = r * 2 + '%'; c.style.aspectRatio = '1';
    scena.append(c); return c;
  };
  const parti = () => {
    trovati = new Set();
    scena.querySelectorAll('.cerchio').forEach((c) => c.remove());
    $('#lista').replaceChildren(...oggetti.map((o) => crea('li', { id: 'voce-' + o.id }, o.nome)));
    $('#fine').hidden = true; conta();
    fumetto('elena', '«Si parte domattina e mancano otto cose. Sono tutte in questa stanza.»');
  };
  const conta = () => ($('#conta').textContent = trovati.size + ' su ' + oggetti.length);
  scena.addEventListener('click', (ev) => {
    const q = scena.getBoundingClientRect();
    const x = ((ev.clientX - q.left) / q.width) * 100, y = ((ev.clientY - q.top) / q.height) * 100;
    const rapporto = q.width / q.height;
    const o = oggetti.find((k) => !trovati.has(k.id) && Math.hypot(x - k.x, (y - k.y) / rapporto) <= k.r * 1.25);
    if (!o) { nota(200, 0.12); const c = cerchio(x, y, 2, 'sbagliato'); setTimeout(() => c.remove(), 650); return; }
    trovati.add(o.id); nota(880, 0.25);
    scena.querySelector('.aiuto')?.remove();
    cerchio(o.x, o.y, o.r);
    $('#voce-' + o.id).classList.add('fatto'); fumetto(o.chi, o.frase); conta();
    if (trovati.size === oggetti.length) {
      $('#fine').hidden = false;
      fumetto('gino', '«Visto? Bastava guardare. Ottima idea la mia, cercare con ordine.»');
    }
  });
  $('#aiuto').addEventListener('click', () => {
    const o = oggetti.find((k) => !trovati.has(k.id));
    if (!o) return;
    scena.querySelector('.aiuto')?.remove();
    const c = cerchio(o.x + (Math.random() * 8 - 4), o.y + (Math.random() * 8 - 4), 12, 'aiuto');
    fumetto('gino', '«' + o.nome + '? Guarda in quella zona. Io noto sempre il dettaglio fuori posto.»');
    setTimeout(() => c.remove(), 6000);
  });
  $('#ancora').addEventListener('click', parti);
  parti();
})();
