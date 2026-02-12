# 🗺️ K-Map Academy

**K-Map Academy** è una piattaforma interattiva progettata per guidare gli studenti nell'apprendimento delle **Mappe di Karnaugh**. Attraverso un percorso guidato in 8 fasi, il portale permette di trasformare una tabella di verità con 4 ingressi (A, B, C, D) in una funzione logica minima SOP (*Sum Of Products*).

## 🚀 Funzionalità Principali

* **Generazione Casuale**: Ogni esercizio è unico, con un numero di mintermini variabile tra 3 e 8, garantendo una pratica infinita senza ripetizioni.
* **Percorso Didattico in 8 Fasi**: Un sistema passo-passo che copre dall'analisi della tabella di verità fino al calcolo del costo logico finale.
* **Feedback Immediato**: Il sistema controlla ogni passaggio (✅ corretto / ❌ errore), assegnando punti e fornendo suggerimenti in tempo reale.
* **Raggruppamenti Colorati**: Visualizzazione chiara dei gruppi sulla mappa con colori distinti per facilitare l'identificazione delle semplificazioni.

## 📊 Il Percorso di Apprendimento

Il software guida lo studente attraverso i seguenti step:

1. **Analisi della Tabella**: Conteggio dei mintermini ().
2. **Identificazione**: Conversione da binario a decimale degli indici.
3. **Compilazione K-Map**: Posizionamento degli 1 seguendo il *Gray Code*.
4. **Pianificazione**: Calcolo del numero ottimale di gruppi necessari.
5. **Disegno**: Selezione interattiva delle celle per formare gruppi da 1, 2, 4 o 8.
6. **Equazioni**: Scrittura delle equazioni AND per ogni raggruppamento.
7. **SOP Finale**: Unione dei gruppi in un'unica funzione logica.
8. **Costo Logico**: Calcolo delle porte NOT, AND e OR necessarie.

## 🛠️ Installazione e Utilizzo

Il progetto è sviluppato in puro **HTML5, CSS3 e JavaScript**, quindi non richiede installazione di server o database.

1. Clona la repository:
```bash
git clone https://github.com/tuo-username/kmap-academy.git

```


2. Apri il file `karnaugh.html` nel tuo browser preferito.

### Pubblicazione su GitHub Pages

Per trasformare il progetto in una pagina web raggiungibile dai tuoi ragazzi:

1. Carica i file (`karnaugh.html`, `karnaugh.js`, `karnaugh.css`) sul tuo repository GitHub.
2. Vai in **Settings** > **Pages**.
3. Sotto **Build and deployment**, imposta la sorgente su `Deploy from a branch` e seleziona il branch `main`.
4. Salva. Dopo pochi istanti, il sito sarà online su `https://tuo-username.github.io/kmap-academy/`.

## 🎨 Design e UI

Il portale utilizza un tema **Dark Mode** moderno, ispirato agli editor di codice (Palette *Dracula*), per ridurre l'affaticamento visivo durante lo studio.

---

*Sviluppato per scopi didattici - K-Map Academy ⚡*
