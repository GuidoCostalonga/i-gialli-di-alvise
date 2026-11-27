// Due secondi: guarda, poi di' che cosa manca. Come la mamma.
(() => {
  const { $, crea, mescola, aspetta, fumetto, nota, IMG } = G;
  const nomi = { inalatore: 'il pouff', carte: 'le carte d’identità', 'adattatore-europeo': 'l’adattatore', scarpe: 'le scarpe', taccuino: 'il taccuino', caricatore: 'il caricatore', spazzolino: 'lo spazzolino', giacca: 'la giacca a vento', ombrello: 'l’ombrello', carciofi: 'il vasetto di carciofi', ferro: 'il ferro da stiro', chiavi: 'le chiavi', occhiali: 'gli occhiali', borsetta: 'la borsetta', cerchietto: 'il cerchietto', braccialetti: 'i braccialetti', telefono: 'il telefono', valigia: 'la valigia', cuffie: 'le cuffie', burrocacao: 'il burrocacao', specchietto: 'lo specchietto', mollette: 'le mollette', calzini: 'i calzini', cappello: 'il cappello', bottiglia: 'la bottiglia', mappa: 'la mappa', penna: 'la penna', tazza: 'la tazza', biscotti: 'i biscotti' };
  const tutti = Object.keys(nomi);
  const LIVELLI = 8;
  let livello, punti, lento = false;
  const tessera = (id, cliccabile) => {
    const b = crea(cliccabile ? 'button' : 'div', { class: 'oggetto', 'aria-label': nomi[id] });
    if (cliccabile) b.type = 'button';
    b.append(crea('img', { src: IMG + 'giochi/' + id + '.webp', alt: '', width: 260, height: 260 }));
    return b;
  };
  const giro = async () => {
    const quanti = Math.min(3 + livello, 10);
    const scelti = mescola(tutti).slice(0, quanti);
    const manca = scelti[Math.floor(Math.random() * quanti)];
    const secondi = (2 + quanti * 0.5) * (lento ? 2 : 1);
    $('#livello').textContent = 'Stanza ' + livello + ' di ' + LIVELLI;
    $('#scelte').replaceChildren(); $('#domanda').hidden = true; $('#avanti').hidden = true;
    $('#tavolo').replaceChildren(...scelti.map((id) => tessera(id, false)));
    fumetto('elena', '«Guarda bene. Hai ' + String(secondi).replace('.', ',') + ' secondi.»');
    await aspetta(secondi * 1000);
    $('#tavolo').replaceChildren(crea('p', { class: 'mano' }, '…'));
    await aspetta(700);
    $('#tavolo').replaceChildren(...mescola(scelti.filter((x) => x !== manca)).map((id) => tessera(id, false)));
    fumetto('elena', '«Che cosa manca?»');
    $('#domanda').hidden = false;
    const opzioni = mescola([manca, ...mescola(tutti.filter((x) => !scelti.includes(x))).slice(0, 3)]);
    $('#scelte').replaceChildren(...opzioni.map((id) => {
      const b = tessera(id, true);
      b.addEventListener('click', () => rispondi(id === manca, manca, b));
      return b;
    }));
  };
  const rispondi = (giusto, manca, b) => {
    $('#scelte').querySelectorAll('button').forEach((x) => (x.disabled = true));
    b.classList.add('scelto');
    if (giusto) { punti++; nota(880, 0.25); fumetto('elena', '«Sì. Mancava ' + nomi[manca] + '.»'); }
    else { nota(180, 0.3); fumetto('elena', '«Mmh. Mancava ' + nomi[manca] + '.»'); }
    $('#conta').textContent = punti + ' su ' + livello;
    $('#avanti').textContent = livello < LIVELLI ? 'Prossima stanza' : 'Vedi come è andata';
    $('#avanti').hidden = false; $('#avanti').focus();
  };
  $('#avanti').addEventListener('click', () => {
    if (livello < LIVELLI) { livello++; giro(); return; }
    $('#gioco').hidden = true; $('#fine').hidden = false;
    $('#fine-testo').textContent = punti === LIVELLI
      ? 'Otto stanze su otto. Al pronto soccorso ti assumerebbero.'
      : punti >= 5 ? punti + ' stanze su otto. La mamma dice «mmh», che per lei è quasi un complimento.'
      : punti + ' stanze su otto. Riprova: con l’allenamento bastano due secondi.';
  });
  const parti = () => { livello = 1; punti = 0; $('#conta').textContent = '0 su 0'; $('#inizio').hidden = true; $('#fine').hidden = true; $('#gioco').hidden = false; giro(); };
  $('#parti').addEventListener('click', parti);
  $('#ancora').addEventListener('click', parti);
  $('#lento').addEventListener('change', (e) => (lento = e.target.checked));
  fumetto('elena', '«Io una stanza la guardo due secondi e so che cosa manca. Prova tu.»');
})();
