// Chi ha finito i biscotti? Un piccolo giallo domestico: ognuno ha visto una cosa sola.
(() => {
  const { $, crea, fumetto, nota, persone } = G;
  const indizi = {
    alvise: ['«Alle 21.10 erano sette. Li ho contati. Alle 21.40 zero. Chi è stato ha avuto trenta minuti.»', 'Sette biscotti alle 21.10, zero alle 21.40.'],
    elisa: ['«Io ed Emma eravamo in camera a scegliere i vestiti. E comunque papà ha le briciole sul maglione. A cena il pane non l’ha toccato.»', 'Elisa ed Emma erano in camera insieme. Papà ha briciole sul maglione.'],
    emma: ['«Ho sentito dei passi in corridoio. Lunghi, pesanti. Si sono fermati davanti allo studio. La mamma cammina veloce. Quella era un’altra musica.»', 'Passi lunghi e pesanti, fermi davanti allo studio.'],
    elena: ['«Dalla credenza manca la tazza grande. In cucina non c’è. Io ero sotto la doccia: ho ancora i capelli bagnati.»', 'Manca la tazza grande. La mamma ha i capelli bagnati.'],
    gino: ['«Io? Ero nello studio, al telefono con Vidoni. Però una cosa l’ho notata: la scatola è tornata sullo scaffale con il coperchio storto. Chi l’ha presa pensava ad altro.»', 'Papà era nello studio al telefono. Il coperchio è storto: chi l’ha presa era distratto.'],
    vidoni: ['«Assessore, tre cose. Uno: la chiamata è durata dalle 21.12 alle 21.34. Due: non le ho detto niente di urgente. Tre: lei masticava.»', 'Telefonata dalle 21.12 alle 21.34. Dall’altra parte qualcuno masticava.'],
  };
  const sbagliato = {
    alvise: 'Alvise i biscotti li ha contati. Chi li mangia non li conta prima.',
    elisa: 'Elisa era in camera con Emma. E non lascerebbe mai una briciola su un maglione.',
    emma: 'Emma era in camera con Elisa, e i passi che ha sentito andavano verso lo studio.',
    elena: 'La mamma era sotto la doccia: ha ancora i capelli bagnati. E cammina veloce.',
  };
  const prove = ['Briciole sul maglione, e a cena niente pane.', 'Passi pesanti fino allo studio.', 'La tazza grande è nello studio, accanto al portatile.', 'La telefonata cade dentro i trenta minuti.', 'Vidoni lo ha sentito masticare.'];
  let sentiti;
  const bottone = (chi, azione) => {
    const b = crea('button', { class: 'persona', type: 'button' });
    b.append(crea('img', { src: persone[chi].img, alt: '', width: 110, height: 110 }), crea('span', {}, persone[chi].nome));
    b.addEventListener('click', () => azione(chi, b));
    return b;
  };
  const parti = () => {
    sentiti = new Set();
    $('#so').replaceChildren(); $('#penso').textContent = '…'; $('#provo').replaceChildren(crea('li', {}, 'Niente. Per adesso.'));
    $('#testimoni').replaceChildren(...Object.keys(indizi).map((c) => bottone(c, ascolta)));
    $('#sospetti').replaceChildren(...['alvise', 'elisa', 'emma', 'elena', 'gino'].map((c) => bottone(c, accusa)));
    $('#accusa').hidden = true; $('#fine').hidden = true;
    fumetto('alvise', '«Sera prima della partenza. La scatola dei biscotti è vuota. Sentiamo tutti, uno alla volta.»');
  };
  const ascolta = (chi, b) => {
    fumetto(chi, indizi[chi][0]); nota(520, 0.12);
    if (!sentiti.has(chi)) { sentiti.add(chi); $('#so').append(crea('li', {}, indizi[chi][1])); b.classList.add('sentito'); }
    $('#conta').textContent = sentiti.size + ' su 6';
    if (sentiti.size >= 4) $('#accusa').hidden = false;
  };
  const accusa = (chi, b) => {
    $('#sospetti').querySelectorAll('.persona').forEach((x) => x.classList.remove('scelto'));
    b.classList.add('scelto'); $('#penso').textContent = persone[chi].nome + '?';
    if (chi !== 'gino') { nota(180, 0.3); fumetto('alvise', '«No. ' + sbagliato[chi] + '»'); return; }
    nota(880, 0.3); $('#penso').textContent = 'Papà.';
    $('#provo').replaceChildren(...prove.map((p) => crea('li', {}, p)));
    fumetto('gino', '«Erano sette? A me sembravano due.»');
    $('#fine').hidden = false; $('#fine').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  $('#ancora').addEventListener('click', parti);
  parti();
})();
