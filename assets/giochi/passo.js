// Il passo di Emma: ripeti la sequenza di passi.
(() => {
  const { $, aspetta, fumetto, nota } = G;
  const toni = [392, 494, 587, 698];
  const tasti = [...document.querySelectorAll('#pose .oggetto')];
  let sequenza = [], passo = 0, record = 0, attivo = false;
  const accendi = async (i, ms = 480) => {
    tasti[i].classList.add('acceso'); nota(toni[i], ms / 1000);
    await aspetta(ms); tasti[i].classList.remove('acceso'); await aspetta(140);
  };
  const mostra = async () => {
    attivo = false; $('#pose').classList.add('blocco');
    $('#conta').textContent = 'Passi: ' + sequenza.length;
    fumetto('emma', '«Guarda.»');
    await aspetta(600);
    for (const i of sequenza) await accendi(i);
    fumetto('emma', '«Adesso tu.»');
    passo = 0; attivo = true; $('#pose').classList.remove('blocco');
  };
  const nuovo = () => { sequenza.push(Math.floor(Math.random() * 4)); mostra(); };
  tasti.forEach((t, i) => t.addEventListener('click', async () => {
    if (!attivo) return;
    if (i !== sequenza[passo]) {
      attivo = false; nota(160, 0.5);
      const fatti = sequenza.length - 1;
      record = Math.max(record, fatti);
      fumetto('emma', fatti >= 8 ? '«Fuori tempo. Però ' + fatti + ' passi: balli quasi come me.»' : '«Fuori tempo. La tua musica si è rotta al passo ' + sequenza.length + '.»');
      $('#record').textContent = 'Il tuo massimo: ' + record + (record === 1 ? ' passo' : ' passi');
      $('#parti').textContent = 'Riprova'; $('#parti').hidden = false;
      return;
    }
    attivo = false; await accendi(i, 220); attivo = true;
    passo++;
    if (passo === sequenza.length) { attivo = false; await aspetta(500); nuovo(); }
  }));
  $('#parti').addEventListener('click', () => { sequenza = []; $('#parti').hidden = true; nuovo(); });
  fumetto('emma', '«Io le cose le ricordo ballando. Ti faccio vedere i passi, tu li rifai uguali.»');
})();
