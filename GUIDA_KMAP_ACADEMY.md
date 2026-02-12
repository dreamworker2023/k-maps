# 🗺️ K-Map Academy - Guida Completa

## 📋 Panoramica

**K-Map Academy** è un portale interattivo per insegnare le **Mappe di Karnaugh**, progettato specificamente per studenti che devono semplificare reti logiche con **4 ingressi (A, B, C, D)** e **1 uscita (U)**.

---

## ✨ Caratteristiche Principali

### 🎲 Generazione Casuale
- Ogni esercizio genera automaticamente una **tabella di verità unica**
- Numero di mintermini: **3-8** (sempre casuali)
- Gli indici sono scelti in modo casuale tra 0-15
- Mai lo stesso esercizio due volte

### 📊 7 Fasi Progressive

1. **Analizza la Tabella** → Conta i mintermini (U = 1)
2. **Identifica i Mintermini** → Scrivi gli indici decimali
3. **Compila la K-Map** → Posiziona gli 1 nella mappa (Gray Code)
4. **Pianifica i Raggruppamenti** → Quanti gruppi servono?
5. **Disegna i Raggruppamenti** → Seleziona celle per ogni gruppo (F1, F2, ...)
6. **Scrivi le Equazioni** → Equazione AND per ogni gruppo
7. **Equazione SOP Finale** → Combina tutto con OR

### 🎨 Raggruppamenti Colorati
- Ogni gruppo ha un **colore distinto** (rosso, azzurro, giallo, viola, etc.)
- Visualizzazione immediata sulla K-Map
- Fino a 8 colori diversi disponibili

### ✅ Verifica Automatica
- Controllo **passo-passo** per ogni fase
- Feedback immediato (✅ corretto / ❌ errore)
- Sistema di punteggio (+100/+400 punti per fase)
- Penalità per errori (-10 punti)

---

## 🎯 Come Funziona

### Fase 1: Conta i Mintermini

**Obiettivo:** Leggere la tabella di verità e contare quante righe hanno U = 1.

**Input richiesto:**
```
Numero di mintermini: [3-8]
```

**Esempio:**
Se la tabella ha U=1 nelle righe 0, 3, 7, 12, 15 → risposta: **5**

**Feedback:**
- ✅ Corretto → evidenzia le righe con animazione pulse
- ❌ Errore → messaggio di ricontrollo

---

### Fase 2: Identifica i Mintermini

**Obiettivo:** Scrivere gli **indici decimali** di tutte le righe con U = 1.

**Input richiesto:**
```
Mintermini (separati da virgola): 0,3,7,12
```

**Conversione Binario → Decimale:**
| A | B | C | D | Decimale |
|---|---|---|---|----------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 3 |
| 0 | 1 | 1 | 1 | 7 |
| 1 | 1 | 0 | 0 | 12 |

Formula: `Decimale = A×8 + B×4 + C×2 + D×1`

**Feedback:**
- ✅ Corretto → passa alla fase 3
- ❌ Errore → suggerisce di ricontrollare la conversione

---

### Fase 3: Compila la Mappa di Karnaugh

**Obiettivo:** Cliccare sulle celle della K-Map per inserire gli 1.

**Layout K-Map (Gray Code):**
```
AB\CD | 00 | 01 | 11 | 10 |
------|----|----|----|----|
  00  |  0 |  1 |  3 |  2 |
  01  |  4 |  5 |  7 |  6 |
  11  | 12 | 13 | 15 | 14 |
  10  |  8 |  9 | 11 | 10 |
```

**Mappatura Gray Code:**
- Colonne AB: 00, 01, **11**, 10 (NOT 00, 01, 10, 11!)
- Righe CD: 00, 01, **11**, 10

**Interazione:**
- **Click su cella** → toggle 0/1
- Celle evidenziate quando corrispondono ai mintermini
- Numero decimale mostrato in piccolo nell'angolo

**Feedback:**
- ✅ Corretto → K-Map completa, tooltip di conferma
- ❌ Errore → messaggio sul Gray Code

---

### Fase 4: Pianifica i Raggruppamenti

**Obiettivo:** Calcolare il **numero ottimale** di gruppi necessari.

**Regole per Gruppi Ottimali:**
1. **Dimensioni valide:** 1, 2, 4, o 8 celle (potenze di 2)
2. **Forma rettangolare:** no diagonali, no forme a L
3. **Massimizzare dimensioni:** preferire pochi gruppi grandi
4. **Sovrapposizione permessa:** una cella può stare in più gruppi

**Algoritmo di Ottimizzazione:**
```
1. Cerca gruppi da 8 (2 righe o 2 colonne complete)
2. Cerca gruppi da 4 (quadrati 2×2, rettangoli 1×4, 4×1)
3. Cerca gruppi da 2 (coppie orizzontali/verticali)
4. Celle singole rimaste (gruppo da 1)
```

**Esempio:**
Mintermini: 0, 1, 2, 3, 8, 9, 10, 11
→ **2 gruppi**: uno da 4 (0-3 riga superiore) + uno da 4 (8-11 riga inferiore)

**Input richiesto:**
```
Numero di gruppi: 2
```

---

### Fase 5: Disegna i Raggruppamenti

**Obiettivo:** Selezionare le celle per ogni gruppo usando i pulsanti colorati.

**Interfaccia:**
```
[F1 (4 celle)] [F2 (4 celle)] [F3 (2 celle)]
    ↓ colore rosso    azzurro      giallo
```

**Procedura:**
1. Click su **F1** → bottone si illumina
2. Click sulle **4 celle** da raggruppare in F1
3. Le celle si colorano di rosso con bordo spesso
4. Click su **F2** → bottone azzurro si illumina
5. Continua per tutti i gruppi

**Validazione Automatica:**
- ✅ Ogni gruppo ha dimensione corretta (1, 2, 4, o 8)
- ✅ Tutti i mintermini sono coperti
- ✅ Numero di gruppi corrisponde a quello dichiarato in Fase 4
- ❌ Altrimenti: errore con suggerimento

---

### Fase 6: Scrivi le Equazioni dei Gruppi

**Obiettivo:** Per ogni gruppo Fi, scrivere l'**equazione AND** che lo rappresenta.

**Algoritmo per Trovare l'Equazione:**

Per ogni gruppo, **elimina** le variabili che **cambiano** al suo interno:

**Esempio 1:**
Gruppo F1 = celle {0, 1, 2, 3}
```
Celle:    A B C D
   0 →    0 0 0 0
   1 →    0 0 0 1
   2 →    0 0 1 0
   3 →    0 0 1 1

Analisi:
- A: sempre 0 → A' (compare negato)
- B: sempre 0 → B' (compare negato)
- C: cambia (0→1) → NON compare
- D: cambia (0→1) → NON compare

Equazione F1 = A'B'
```

**Esempio 2:**
Gruppo F2 = celle {5, 7}
```
Celle:    A B C D
   5 →    0 1 0 1
   7 →    0 1 1 1

Analisi:
- A: sempre 0 → A'
- B: sempre 1 → B
- C: cambia → NON compare
- D: sempre 1 → D

Equazione F2 = A'BD
```

**Notazione:**
- Variabile positiva: `A`, `B`, `C`, `D`
- Variabile negata: `A'`, `B'`, `C'`, `D'` (usa apostrofo)
- Prodotto logico (AND): scrivi le variabili attaccate, es: `A'BD`

**Input richiesto:**
```
F1 = A'B'
F2 = A'BD
F3 = BCD'
```

**Feedback:**
- ✅ Tutte le equazioni corrette → avanza
- ❌ Almeno una errata → mostra quale gruppo è sbagliato

---

### Fase 7: Equazione SOP Finale

**Obiettivo:** Combinare tutti i gruppi con **OR** per ottenere l'equazione finale di U.

**Forma SOP (Sum of Products):**
```
U = F1 + F2 + F3 + ... + Fn
```

Dove `+` rappresenta l'operatore OR.

**Esempio:**
Se hai 3 gruppi:
- F1 = A'B'
- F2 = A'BD
- F3 = BCD'

**Equazione finale:**
```
U = A'B' + A'BD + BCD'
```

**Input richiesto:**
```
U = F1 + F2 + F3
```

OPPURE (sostituendo direttamente):
```
U = A'B' + A'BD + BCD'
```

**Feedback:**
- ✅ Corretto → **ESERCIZIO COMPLETATO!** 🎉
  - Confetti animati
  - Pulsante "Nuovo Esercizio" appare
  - Punteggio finale mostrato
- ❌ Errore → suggerisce il formato corretto

---

## 🎨 Sistema di Colori per Gruppi

I gruppi vengono visualizzati con colori distinti:

| Gruppo | Colore | Codice Hex |
|--------|--------|------------|
| F1 | 🔴 Rosso | #ff6b6b |
| F2 | 🔵 Azzurro | #4ecdc4 |
| F3 | 🟦 Blu | #45b7d1 |
| F4 | 🟡 Giallo | #f9ca24 |
| F5 | 🟣 Viola | #6c5ce7 |
| F6 | 🌸 Rosa | #fd79a8 |
| F7 | 🟪 Indaco | #a29bfe |
| F8 | 🟢 Verde | #00b894 |

---

## 📐 Gray Code nella K-Map

**Perché Gray Code?**
Nelle Mappe di Karnaugh, le intestazioni usano il **Gray Code** invece dell'ordine binario normale. Questo garantisce che celle **adiacenti** differiscano di **1 solo bit**.

**Ordine Gray Code:**
```
00 → 01 → 11 → 10
```

**vs Ordine Binario Normale:**
```
00 → 01 → 10 → 11  ❌ SBAGLIATO per K-Map!
```

**Perché è importante:**
Il Gray Code permette di identificare facilmente gruppi rettangolari che corrispondono a semplificazioni logiche. Se usi l'ordine binario normale, i raggruppamenti non funzionano!

---

## 🏆 Sistema di Punteggio

| Fase | Punti (Corretto) | Penalità (Errore) |
|------|------------------|-------------------|
| 1 - Conta mintermini | +100 | -10 |
| 2 - Identifica mintermini | +150 | -10 |
| 3 - Compila K-Map | +200 | -10 |
| 4 - Numero gruppi | +150 | -10 |
| 5 - Disegna gruppi | +250 | -10 |
| 6 - Equazioni gruppi | +300 | -10 |
| 7 - SOP finale | +400 | -10 |

**Punteggio Massimo:** 1550 punti per esercizio perfetto

---

## ⏱️ Timer

Un timer in tempo reale mostra il tempo trascorso dall'inizio dell'esercizio:
```
⏱️ 05:23
```

Formato: MM:SS

Non c'è limite di tempo, è solo per monitorare le prestazioni dello studente.

---

## 🔄 Nuovo Esercizio

Dopo aver completato un esercizio, appare il pulsante:

```
🔄 Nuovo Esercizio
```

**Cosa succede:**
1. Reset completo di tutte le fasi
2. Generazione di una nuova tabella casuale (3-8 mintermini diversi)
3. Reset del punteggio (opzionale: si può mantenere per sessioni)
4. Reset K-Map e gruppi

---

## 💡 Suggerimenti Pedagogici

### Per l'Insegnante:

1. **Inizia con esempi guidati** - Mostra un esercizio completo prima che gli studenti provino da soli

2. **Enfatizza il Gray Code** - È l'errore più comune! Mostra visivamente perché 00, 01, **11**, 10 è corretto

3. **Regole dei raggruppamenti:**
   - Potenze di 2: 1, 2, 4, 8
   - Rettangolari (no diagonali!)
   - Wrap-around (bordi opposti si toccano)

4. **Equazioni:**
   - Variabili costanti → compaiono
   - Variabili che cambiano → NON compaiono
   - Valore 0 → negato (A')
   - Valore 1 → positivo (A)

### Per lo Studente:

**Trucchi K-Map:**

1. **Cerca prima gruppi grandi** - Un gruppo da 8 è meglio di due da 4!

2. **Wrap-around** - I bordi opposti della mappa si "toccano":
   - Colonna sinistra (00) e colonna destra (10) sono adiacenti
   - Riga superiore (00) e riga inferiore (10) sono adiacenti

3. **Sovrapposizioni** - Una cella può stare in più gruppi (è OK!)

4. **Controllo rapido** - Conta che ogni mintermino sia coperto almeno una volta

---

## 🐛 Risoluzione Problemi

### Problema: "K-Map non si compila"
**Soluzione:** Assicurati di essere alla Fase 3 (le altre fasi hanno celle disabilitate)

### Problema: "Raggruppamenti sempre errati"
**Soluzione:** 
- Controlla che ogni gruppo abbia dimensione 1, 2, 4, o 8
- Verifica che siano rettangolari
- Assicurati di aver coperto TUTTI i mintermini

### Problema: "Equazione F1 sempre sbagliata"
**Soluzione:**
- Usa apostrofo (') per negazione, non altri simboli
- Nessuno spazio tra lettere: `A'BD` not `A' B D`
- Variabile che cambia → non la scrivere!

---

## 📱 Responsive Design

Il portale si adatta a diverse dimensioni schermo:

**Desktop (>1024px):**
- Layout a 2 colonne (fasi | visualizzazioni)
- K-Map e tabella affiancate

**Tablet/Mobile (<1024px):**
- Layout verticale (fasi sopra, visualizzazioni sotto)
- Scroll per vedere tutto

---

## 🎓 Obiettivi di Apprendimento

Alla fine di questa lezione, lo studente sarà in grado di:

✅ Leggere e interpretare tabelle di verità a 4 ingressi  
✅ Identificare mintermini e convertire binario→decimale  
✅ Compilare correttamente una K-Map 4×4 con Gray Code  
✅ Riconoscere raggruppamenti ottimali (potenze di 2)  
✅ Disegnare gruppi rettangolari rispettando le regole  
✅ Derivare equazioni AND da gruppi  
✅ Scrivere l'equazione SOP finale minimizzata  
✅ Applicare la semplificazione a circuiti reali  

---

## 🚀 Uso in Classe

### Modalità Individuale:
Ogni studente lavora al proprio ritmo, completa esercizi infiniti

### Modalità Sfida:
- Chi completa più esercizi in 30 minuti?
- Chi ottiene il punteggio più alto?
- Chi completa senza errori?

### Modalità Collaborativa:
- A coppie: uno compila K-Map, l'altro trova gruppi
- Discussione sui raggruppamenti ottimali

---

## 📊 Esempi Completi

### Esempio 1: Caso Semplice

**Tabella di Verità:**
Mintermini: {0, 2, 8, 10}

**K-Map:**
```
AB\CD | 00 | 01 | 11 | 10 |
------|----|----|----|----|
  00  | 1  | 0  | 0  | 1  |
  01  | 0  | 0  | 0  | 0  |
  11  | 0  | 0  | 0  | 0  |
  10  | 1  | 0  | 0  | 1  |
```

**Raggruppamenti:**
- F1: celle {0, 2, 8, 10} → gruppo da 4

**Equazione:**
- F1 = B'D' (B e D sono sempre 0, A e C cambiano)
- **U = B'D'**

### Esempio 2: Caso Complesso

**Mintermini:** {1, 3, 5, 7, 9, 11, 13, 15}

**K-Map:**
```
AB\CD | 00 | 01 | 11 | 10 |
------|----|----|----|----|
  00  | 0  | 1  | 1  | 0  |
  01  | 0  | 1  | 1  | 0  |
  11  | 0  | 1  | 1  | 0  |
  10  | 0  | 1  | 1  | 0  |
```

**Raggruppamenti:**
- F1: celle {1, 3, 5, 7, 9, 11, 13, 15} → gruppo da 8 (2 colonne complete)

**Equazione:**
- F1 = D (solo D è sempre 1, tutto il resto cambia)
- **U = D**

---

## 🎯 Conclusione

K-Map Academy offre un modo **interattivo, visuale e gamificato** per padroneggiare le Mappe di Karnaugh. Gli studenti ricevono feedback immediato, vedono i risultati in tempo reale, e possono esercitarsi infinite volte con esercizi sempre diversi.

**Buon apprendimento! ⚡🗺️**
