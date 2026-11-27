// Che Bertolin sei? Sette domande, cinque sguardi diversi.
(() => {
  const { $, crea, mescola, persone, nota } = G;
  const ordine = ['alvise', 'elisa', 'emma', 'elena', 'gino'];
  const domande = [
    ['In una piazza piena di gente, che cosa guardi?', ['Quante persone stanno ferme, e per quanto', 'Chi porta due cose che non stanno insieme', 'Come camminano', 'Chi sta male davvero e chi finge', 'La cosa che ieri non c’era']],
    ['La sera prima di partire…', ['Controllo tutto. Poi ricontrollo', 'Scelgo i vestiti per colore', 'Ballo in corridoio', 'Scrivo una lista', 'Prendo anche il passaporto, per sicurezza']],
    ['Qualcuno ti racconta una cosa strana. Tu…', ['Non ci credo e non la nego: controllo', 'Rispondo con una frase sola, gentile', 'Lo sapevo già. Nessuno me l’aveva chiesto', 'Dico «mmh»', 'La spiego a tutti, con calma, per punti']],
    ['A tavola…', ['Conto i minuti fino al dolce', 'Sto attenta a non macchiarmi', 'Mangio tutto. Tranne i wurstel', 'Guardo chi non mangia', 'Rispondo al telefono']],
    ['Il tuo oggetto è…', ['Un taccuino nero con l’elastico', 'Una borsetta a tracolla', 'Un braccialetto elastico', 'Una penna rossa', 'Il telefono']],
    ['Di che cosa hai paura?', ['Di essermi perso un dettaglio', 'Di quasi tutto. Lo faccio lo stesso', 'Di dover stare ferma', 'Delle cose che non sono scritte', 'Di aver perso le chiavi. Di nuovo']],
    ['Per ricordare una cosa…', ['La scrivo, con l’ora', 'Mi ricordo il colore', 'Ci faccio una canzoncina', 'La metto in lista', 'Mi accorgo se è fuori posto']],
  ];
  const esiti = {
    alvise: ['Sei Alvise', 'Conti, misuri, metti in fila. Non sei un genio solitario: sei quello che si accorge che due cose viste da due persone diverse sono la stessa cosa. Ti serve solo un taccuino.'],
    elisa: ['Sei Elisa', 'Vedi quello che gli altri chiamano frivolo: un colore, un abbinamento, una cosa fuori posto. Hai paura di quasi tutto e lo fai lo stesso. E chiudi le discussioni con una frase.'],
    emma: ['Sei Emma', 'Tu le persone le senti: ognuna cammina con la sua musica, e ti accorgi subito quando è rotta. Ricordi con il corpo, e dici le cose importanti come se fossero ovvie.'],
    elena: ['Sei mamma Elena', 'Guardi una stanza due secondi e sai che cosa manca. Fai liste, scrivi regole, non alzi mai la voce. Decidi tu, e lasci che lo annunci qualcun altro.'],
    gino: ['Sei papà Gino', 'Noti il dettaglio fuori posto: la targa vista una volta, il soprammobile spostato di due dita. Perdi le chiavi, non stacchi mai dal lavoro, e un fatto senza ora per te è un’opinione.'],
  };
  let n, punti, ultima;
  const mostra = () => {
    const [testo, risposte] = domande[n];
    $('#passo').textContent = 'Domanda ' + (n + 1) + ' di ' + domande.length;
    $('#domanda').textContent = testo;
    $('#risposte').replaceChildren(...mescola(risposte.map((r, i) => [r, ordine[i]])).map(([r, chi]) => {
      const b = crea('button', { class: 'risposta', type: 'button' }, r);
      b.addEventListener('click', () => { punti[chi]++; ultima = chi; nota(520 + n * 40, 0.12); n++; n < domande.length ? mostra() : fine(); });
      return b;
    }));
  };
  const fine = () => {
    const max = Math.max(...Object.values(punti));
    const chi = punti[ultima] === max ? ultima : ordine.find((c) => punti[c] === max);
    $('#gioco').hidden = true; $('#fine').hidden = false;
    $('#esito-img').src = persone[chi].img; $('#esito-img').alt = 'Ritratto a china di ' + persone[chi].nome;
    $('#esito-titolo').textContent = esiti[chi][0]; $('#esito-testo').textContent = esiti[chi][1];
    $('#condividi').onclick = async () => {
      const dati = { title: 'Che Bertolin sei?', text: esiti[chi][0].replace('Sei', 'Io sono') + '. E tu, che Bertolin sei?', url: location.href.split('#')[0] };
      try {
        if (navigator.share) await navigator.share(dati);
        else { await navigator.clipboard.writeText(dati.text + ' ' + dati.url); $('#condividi').textContent = 'Copiato: incollalo dove vuoi'; }
      } catch (e) { /* condivisione annullata */ }
    };
  };
  const parti = () => { n = 0; punti = Object.fromEntries(ordine.map((c) => [c, 0])); $('#fine').hidden = true; $('#gioco').hidden = false; mostra(); };
  $('#ancora').addEventListener('click', parti);
  parti();
})();
