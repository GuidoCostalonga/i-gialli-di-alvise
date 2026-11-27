// Lettura facilitata: righello di lettura e sintesi vocale. Tutto resta sul dispositivo.
(() => {
  const crea = (tag, attr = {}, testo) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attr)) k === 'class' ? (e.className = v) : e.setAttribute(k, v);
    if (testo !== undefined) e.textContent = testo;
    return e;
  };
  const memoria = {
    leggi(k) { try { return localStorage.getItem('alvise-' + k); } catch (e) { return null; } },
    scrivi(k, v) { try { localStorage.setItem('alvise-' + k, v); } catch (e) { /* si funziona anche senza */ } },
  };
  const haVoce = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const BLOCCHI = 'h1, h2, h3, p, li, figcaption';
  const INTERATTIVI = 'a, button, summary, input, label, select, .oggetto, .persona, .scena';

  // ---------- menu a tendina del telefono ----------
  const tendina = document.querySelector('.tendina');
  if (tendina) {
    tendina.addEventListener('click', (e) => { if (e.target.closest('a')) tendina.open = false; });
    document.addEventListener('click', (e) => { if (tendina.open && !tendina.contains(e.target)) tendina.open = false; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tendina.open) { tendina.open = false; tendina.querySelector('summary').focus(); } });
  }

  // ---------- pannello ----------
  const apri = crea('button', { class: 'lf-apri', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'lf-pannello' }, 'Lettura facilitata');
  const pannello = crea('div', { class: 'lf-pannello', id: 'lf-pannello', hidden: '' });
  const interruttore = (testo, aiuto) => {
    const b = crea('button', { class: 'lf-voce', type: 'button', 'aria-pressed': 'false' });
    b.append(crea('strong', {}, testo), crea('span', {}, aiuto));
    return b;
  };
  const bRighello = interruttore('Righello di lettura', 'Una fascia chiara segue il dito o il mouse e scurisce il resto.');
  const bCarattere = interruttore('Carattere ad alta leggibilità', 'Cambia i testi in OpenDyslexic, con righe più distanziate e senza corsivi.');
  const bVoce = interruttore('Voce che legge', 'Tocca un testo per ascoltarlo, oppure usa «Ascolta» accanto ai titoli.');
  const riga = crea('div', { class: 'lf-riga' });
  const bLento = crea('button', { class: 'lf-piccolo', type: 'button', 'aria-pressed': 'false' }, 'Voce più lenta');
  const bFerma = crea('button', { class: 'lf-piccolo', type: 'button' }, 'Ferma la voce');
  const bAlto = crea('button', { class: 'lf-piccolo', type: 'button', 'aria-pressed': 'false' }, 'Righello più alto');
  riga.append(bAlto, bLento, bFerma);
  const avviso = crea('p', { class: 'lf-avviso', role: 'status' });
  pannello.append(crea('p', { class: 'lf-titolo' }, 'Lettura facilitata'), bCarattere, bRighello, bVoce, riga, avviso);
  document.body.append(apri, pannello);
  apri.addEventListener('click', () => {
    const aperto = pannello.hasAttribute('hidden');
    pannello.toggleAttribute('hidden', !aperto);
    apri.setAttribute('aria-expanded', String(aperto));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!pannello.hasAttribute('hidden')) { pannello.setAttribute('hidden', ''); apri.setAttribute('aria-expanded', 'false'); apri.focus(); }
    ferma();
  });

  // ---------- carattere ad alta leggibilità ----------
  let carattere = false;
  const impostaCarattere = (acceso) => {
    carattere = acceso;
    bCarattere.setAttribute('aria-pressed', String(acceso));
    document.documentElement.classList.toggle('lf-carattere', acceso);
    memoria.scrivi('carattere', acceso ? '1' : '0');
    if (righello) disegna();
  };
  bCarattere.addEventListener('click', () => impostaCarattere(!carattere));

  // ---------- righello ----------
  const sopra = crea('div', { class: 'lf-ombra lf-ombra--sopra', 'aria-hidden': 'true' });
  const sotto = crea('div', { class: 'lf-ombra lf-ombra--sotto', 'aria-hidden': 'true' });
  const fascia = crea('div', { class: 'lf-fascia', 'aria-hidden': 'true' });
  let righello = false, alto = false, yRighello = window.innerHeight * 0.4;
  const disegna = () => {
    const h = alto ? 150 : 84;
    const y = Math.max(h / 2, Math.min(window.innerHeight - h / 2, yRighello));
    sopra.style.height = y - h / 2 + 'px';
    sotto.style.top = y + h / 2 + 'px';
    fascia.style.top = y - h / 2 + 'px';
    fascia.style.height = h + 'px';
  };
  const muovi = (e) => { if (!righello) return; yRighello = e.touches ? e.touches[0].clientY : e.clientY; disegna(); };
  const impostaRighello = (acceso) => {
    righello = acceso;
    bRighello.setAttribute('aria-pressed', String(acceso));
    if (acceso) { document.body.append(sopra, sotto, fascia); disegna(); } else { sopra.remove(); sotto.remove(); fascia.remove(); }
    memoria.scrivi('righello', acceso ? '1' : '0');
  };
  window.addEventListener('pointermove', muovi, { passive: true });
  window.addEventListener('touchstart', muovi, { passive: true });
  window.addEventListener('touchmove', muovi, { passive: true });
  window.addEventListener('resize', () => righello && disegna());
  bRighello.addEventListener('click', () => impostaRighello(!righello));
  bAlto.addEventListener('click', () => { alto = !alto; bAlto.setAttribute('aria-pressed', String(alto)); memoria.scrivi('alto', alto ? '1' : '0'); disegna(); });

  // ---------- voce ----------
  let voce = false, lento = false, turno = 0, italiana = null;
  const scegliVoce = () => {
    const voci = speechSynthesis.getVoices();
    italiana = voci.find((v) => v.lang === 'it-IT') || voci.find((v) => v.lang && v.lang.toLowerCase().startsWith('it')) || null;
    if (voce && voci.length && !italiana) avviso.textContent = 'Su questo dispositivo non trovo una voce italiana: la lettura potrebbe avere un accento straniero.';
  };
  const visibile = (el) => !!(el.offsetParent || el.getClientRects().length);
  const testoDi = (el) => {
    const copia = el.cloneNode(true);
    copia.querySelectorAll('.lf-ascolta, button').forEach((x) => x.remove());
    return copia.textContent.replace(/\s+/g, ' ').replace(/[«»]/g, '').trim();
  };
  function ferma() {
    turno++;
    if (haVoce) speechSynthesis.cancel();
    document.querySelectorAll('.lf-letto').forEach((x) => x.classList.remove('lf-letto'));
  }
  const leggi = (elementi) => {
    ferma();
    const mio = turno;
    const coda = elementi.filter((el) => visibile(el) && testoDi(el));
    const prossimo = () => {
      if (mio !== turno) return;
      document.querySelectorAll('.lf-letto').forEach((x) => x.classList.remove('lf-letto'));
      const el = coda.shift();
      if (!el) return;
      el.classList.add('lf-letto');
      if (coda.length || el.getBoundingClientRect().bottom > window.innerHeight || el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const u = new SpeechSynthesisUtterance(testoDi(el));
      u.lang = 'it-IT';
      if (italiana && italiana instanceof SpeechSynthesisVoice) u.voice = italiana;
      u.rate = lento ? 0.75 : 0.95;
      u.onend = prossimo;
      u.onerror = () => { if (mio === turno) ferma(); };
      speechSynthesis.speak(u);
    };
    prossimo();
  };
  const blocchiDi = (contenitore) => [...contenitore.querySelectorAll(BLOCCHI)].filter((el) => !el.closest('.lf-pannello') && !el.querySelector(BLOCCHI));
  const mettiPulsanti = () => {
    document.querySelectorAll('main section, main .giochi-testa, main article.capitolo').forEach((sez) => {
      const titolo = sez.querySelector('h1, h2, .capitolo__numero');
      if (!titolo || sez.dataset.lfPronto) return;
      sez.dataset.lfPronto = '1';
      const b = crea('button', { class: 'lf-ascolta', type: 'button' }, 'Ascolta');
      b.addEventListener('click', (e) => { e.stopPropagation(); leggi(blocchiDi(sez)); });
      const testa = titolo.closest('header');
      testa ? testa.append(b) : titolo.after(b);
    });
  };
  const impostaVoce = (acceso) => {
    voce = acceso;
    bVoce.setAttribute('aria-pressed', String(acceso));
    document.documentElement.classList.toggle('lf-voce-attiva', acceso);
    if (acceso) { scegliVoce(); mettiPulsanti(); } else { ferma(); document.querySelectorAll('.lf-ascolta').forEach((b) => b.remove()); document.querySelectorAll('[data-lf-pronto]').forEach((x) => delete x.dataset.lfPronto); avviso.textContent = ''; }
    memoria.scrivi('voce', acceso ? '1' : '0');
  };
  if (haVoce) {
    speechSynthesis.addEventListener?.('voiceschanged', scegliVoce);
    bVoce.addEventListener('click', () => impostaVoce(!voce));
    bLento.addEventListener('click', () => { lento = !lento; bLento.setAttribute('aria-pressed', String(lento)); memoria.scrivi('lento', lento ? '1' : '0'); });
    bFerma.addEventListener('click', ferma);
    document.addEventListener('click', (e) => {
      if (!voce || e.target.closest(INTERATTIVI) || e.target.closest('.lf-pannello')) return;
      const el = e.target.closest(BLOCCHI);
      if (!el || !el.closest('main, footer')) return;
      if (el.classList.contains('lf-letto')) { ferma(); return; }
      leggi([el]);
    });
    window.addEventListener('pagehide', ferma);
  } else {
    bVoce.disabled = true; bLento.hidden = true; bFerma.hidden = true;
    bVoce.querySelector('span').textContent = 'Questo navigatore non ha la sintesi vocale.';
  }

  // ---------- preferenze salvate ----------
  if (memoria.leggi('alto') === '1') { alto = true; bAlto.setAttribute('aria-pressed', 'true'); }
  if (memoria.leggi('lento') === '1') { lento = true; bLento.setAttribute('aria-pressed', 'true'); }
  if (memoria.leggi('carattere') === '1') impostaCarattere(true);
  if (memoria.leggi('righello') === '1') impostaRighello(true);
  if (haVoce && memoria.leggi('voce') === '1') impostaVoce(true);
})();
