// Quattro valigie e mezza: riempi le valigie seguendo la lista della mamma.
(() => {
  const { $, crea, mescola, fumetto, nota, IMG } = G;
  const I = (n) => IMG + 'giochi/' + n + '.jpg';
  const voci = [
    { id: 'carte', testo: 'Carte d’identità', nota: 'Germania: non serve il passaporto, Gino', quante: 1 },
    { id: 'inalatore', testo: 'Pouff × 3', nota: 'due indispensabili, uno di scorta', quante: 3 },
    { id: 'adattatore-europeo', testo: 'Adattatore corrente', nota: 'quello con due spinotti tondi', quante: 1 },
    { id: 'scarpe', testo: 'Elisa: due paia di scarpe', nota: 'DUE, non sei', quante: 2 },
    { id: 'taccuino', testo: 'Taccuino di Alvise', quante: 1 },
    { id: 'caricatore', testo: 'Caricatore', quante: 1 },
    { id: 'spazzolino', testo: 'Spazzolino', quante: 1 },
    { id: 'giacca', testo: 'Giacca a vento', quante: 1 },
    { id: 'ombrello', testo: 'Ombrello', quante: 1 },
  ];
  const nomi = { carte: 'Carte d’identità', inalatore: 'Pouff', 'adattatore-europeo': 'Adattatore con due spinotti tondi', scarpe: 'Scarpe di Elisa', taccuino: 'Taccuino', caricatore: 'Caricatore', spazzolino: 'Spazzolino', giacca: 'Giacca a vento', ombrello: 'Ombrello', 'adattatore-inglese': 'Adattatore con tre spinotti piatti', passaporto: 'Passaporto', carciofi: 'Vasetto di carciofi', ferro: 'Ferro da stiro', wurstel: 'Wurstel' };
  const trappole = {
    'adattatore-inglese': ['elena', '«Gino, non comprarlo tu. Quello è inglese.»'],
    passaporto: ['alvise', '«Non serve il passaporto, papà. È Germania. Basta la carta d’identità.»'],
    carciofi: ['elena', '«Emma. Il vasetto resta a casa.»'],
    ferro: ['elisa', '«Papà, andiamo in vacanza. Non in lavanderia.»'],
    wurstel: ['emma', '«Quelli no. Non mi piace dentro.»'],
  };
  const giusti = { inalatore: ['gino', '«Il mio lo tengo io.» Fra undici giorni ne riparliamo.'], scarpe: ['elisa', '«Queste sì. Sono abbinate.»'], taccuino: ['alvise', '«Questo lo tengo in tasca. Ma va bene.»'], carte: ['elena', '«Cinque carte d’identità. Busta trasparente, elastico.»'] };
  let fatti, errori;

  const disegna = () => {
    fatti = {}; errori = 0;
    const lista = $('#lista');
    lista.replaceChildren(...voci.map((v) => {
      const li = crea('li', { id: 'voce-' + v.id }, v.testo);
      if (v.nota) li.append(crea('small', {}, v.nota));
      return li;
    }), crea('li', { id: 'voce-respirare' }, 'Respirare'));
    const pezzi = [];
    voci.forEach((v) => { for (let i = 0; i < (v.id === 'scarpe' ? 4 : v.quante); i++) pezzi.push(v.id); });
    Object.keys(trappole).forEach((t) => pezzi.push(t));
    $('#stanza').replaceChildren(...mescola(pezzi).map((id) => {
      const b = crea('button', { class: 'oggetto', type: 'button', 'aria-label': nomi[id] });
      b.append(crea('img', { src: I(id), alt: '' }));
      b.addEventListener('click', () => tocca(id, b));
      return b;
    }));
    $('#fine').hidden = true; $('#respira').hidden = true;
    aggiorna();
    fumetto('elena', '«La lista è questa. Tocca le cose giuste e finiscono in valigia.»');
  };
  const aggiorna = () => {
    const n = voci.filter((v) => (fatti[v.id] || 0) >= v.quante).length;
    $('#conta').textContent = n + ' su ' + (voci.length + 1);
  };
  const tocca = (id, b) => {
    const v = voci.find((x) => x.id === id);
    if (!v) { sbaglio(b, ...trappole[id]); return; }
    if ((fatti[id] || 0) >= v.quante) { sbaglio(b, 'elena', '«Due paia, Elisa. DUE, non sei.»'); return; }
    fatti[id] = (fatti[id] || 0) + 1;
    b.classList.add('fatto'); b.disabled = true; nota(660, 0.15);
    if (fatti[id] >= v.quante) { $('#voce-' + id).classList.add('fatto'); nota(880, 0.25); }
    if (giusti[id]) fumetto(...giusti[id]);
    aggiorna();
    if (voci.every((x) => (fatti[x.id] || 0) >= x.quante)) {
      fumetto('elena', '«Manca l’ultima voce. La quarantadue.»');
      $('#respira').hidden = false; $('#respira').focus();
    }
  };
  const sbaglio = (b, chi, frase) => {
    errori++; nota(180, 0.3); fumetto(chi, frase);
    b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
  };
  $('#respira').addEventListener('click', () => {
    $('#voce-respirare').classList.add('fatto'); $('#respira').hidden = true;
    $('#conta').textContent = (voci.length + 1) + ' su ' + (voci.length + 1);
    fumetto('gino', '«Ottima idea la mia, partire con la lista.»');
    $('#fine-testo').textContent = errori === 0
      ? 'Quattro valigie e mezza, chiuse al primo colpo. Il taxi è sotto casa.'
      : 'Quattro valigie e mezza, chiuse. La mamma ha detto «no» ' + errori + (errori === 1 ? ' volta' : ' volte') + '. Il taxi è sotto casa.';
    $('#fine').hidden = false; $('#fine').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#ancora').addEventListener('click', disegna);
  disegna();
})();
