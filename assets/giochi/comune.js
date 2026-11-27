// Funzioni condivise dai giochi. Nessun dato esce dal dispositivo.
const G = (() => {
  const IMG = '../assets/img/';
  const persone = {
    alvise: { nome: 'Alvise', img: IMG + 'ritratto-alvise.webp' },
    elisa: { nome: 'Elisa', img: IMG + 'ritratto-elisa.webp' },
    emma: { nome: 'Emma', img: IMG + 'ritratto-emma.webp' },
    elena: { nome: 'Mamma Elena', img: IMG + 'ritratto-elena.webp' },
    gino: { nome: 'Papà Gino', img: IMG + 'ritratto-gino.webp' },
    vidoni: { nome: 'Il comandante Vidoni', img: IMG + 'ritratto-vidoni.webp' },
  };
  const $ = (s, r = document) => r.querySelector(s);
  const crea = (tag, attr = {}, testo) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attr)) k === 'class' ? (e.className = v) : e.setAttribute(k, v);
    if (testo !== undefined) e.textContent = testo;
    return e;
  };
  const mescola = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));
  let inVoce = null;
  const parla = (testo) => {
    if (!('speechSynthesis' in window)) return;
    // Su iPhone un «cancel» a vuoto, subito prima di parlare, può azzittire anche la frase nuova.
    const eraOccupata = speechSynthesis.speaking || speechSynthesis.pending;
    if (eraOccupata) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(testo.replace(/[«»]/g, ''));
    u.lang = 'it-IT';
    u.rate = 0.95;
    inVoce = u;
    const via = () => { try { speechSynthesis.resume(); } catch (e) { /* non serve ovunque */ } speechSynthesis.speak(u); };
    if (eraOccupata) setTimeout(via, 150); else via();
  };
  let ultimo = '';
  const fumetto = (chi, testo) => {
    const box = $('#fumetto');
    if (!box) return;
    const p = persone[chi];
    ultimo = testo;
    box.replaceChildren(
      crea('img', { src: p.img, alt: '', width: 72, height: 72 }),
      (() => {
        const d = crea('div');
        d.append(crea('p', { class: 'fumetto__nome' }, p.nome), crea('p', { class: 'fumetto__testo' }, testo));
        return d;
      })()
    );
  };
  let audio;
  const nota = (freq, durata = 0.25) => {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.18, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + durata);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + durata);
    } catch (e) { /* senza suono si gioca lo stesso */ }
  };
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-ascolta]');
    if (!b) return;
    const sel = b.getAttribute('data-ascolta');
    parla(sel === 'fumetto' ? ultimo : ($(sel)?.innerText || ''));
  });
  return { $, crea, mescola, aspetta, parla, fumetto, nota, persone, IMG };
})();
