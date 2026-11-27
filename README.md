# I gialli di Alvise

Sito della serie di romanzi gialli per ragazzi «I gialli di Alvise» di Guido Costalonga, pubblicato su https://igiallidialvise.it/.

## Com'è fatto

| Percorso | Contenuto |
|---|---|
| `index.html` | La pagina: libri, famiglia Bertolin, primo capitolo, sezione per genitori e insegnanti, autore |
| `assets/stile.css` | Lo stile: china e un solo rosso (`#c43a2f`) |
| `assets/img/` | Copertine e tavole |
| `assets/fonts/` | Caratteri Crimson Pro, Caveat e Archivo Black, serviti dal sito stesso |
| `CNAME` | Dominio personalizzato per GitHub Pages |

Il sito non usa cookie né servizi di statistica di terzi. Conta le visite in forma anonima
(pagina, giorno, sito di provenienza, tipo di dispositivo) con due funzioni di servizio su Supabase:
il codice sta in `supabase/`, la spiegazione per i lettori in `riservatezza/`.
La pagina `statistiche/` mostra i numeri ed è protetta da una password custodita nel segreto
`STATISTICHE_PASSWORD` del progetto Supabase, mai nel codice.

## Regole

- Il testo del primo capitolo è quello del libro e non si modifica.
- Le trame riprendono le quarte di copertina: nessuna anticipazione sul colpevole.
- Niente trattini come segno di pausa, niente inglesismi, sigle esplicitate alla prima occorrenza.

© 2026 Guido Costalonga. Tutti i diritti riservati.
