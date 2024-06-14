# Ricerca del contorno della superficie terrestre dai dati di scansione laser

## Tecnologie

1. Node.js
2. Typescript
3. Chart.js

## Descrizione

Questo progetto è un'applicazione web sviluppata per esplorare algoritmi di ricerca del contorno della superficie terrestre attraverso la visualizzazione grafica dei dati ottenuti dai file CSV. Si basa sull'uso della libreria `Chart.js`, che fornisce una rappresentazione visiva dinamica e intuitiva dei dati, e `Node.js` per il funzionamento efficiente della parte server. L'uso di `Typescript` è dovuto a considerazioni architetturali. Gli aspetti chiave del progetto includono l'applicazione della geometria computazionale, metodi di regressione e approssimazione utilizzando polinomi, nonché il metodo dei minimi quadrati per ridurre l'errore dei dati originali. Il progetto è stato realizzato con l'ausilio del Chatbot GPT-4 Math Mentor.

![Math mentor AI](/public/AppIcon.png)

## Struttura delle cartelle

- `/public` - cartella per i file statici (HTML, JS, CSS).
- `/filters` - cartella con i moduli dei filtri e degli algoritmi di elaborazione dati.
- `server.js` - file principale del server Node.js.
- `script.js` - script responsabile dell'invio delle richieste al server, della ricezione e dell'elaborazione dei dati, nonché dell'inizializzazione e dell'aggiornamento dei grafici in risposta alle azioni dell'utente.

## Installazione

1. Installare Node.js e npm.
2. Installare le dipendenze: `npm install`

### Note
- Per il corretto funzionamento del browser, assicurarsi che il percorso al file eseguibile di Chromium sia corretto e corrisponda al sistema in uso.
- Il codice prevede la pulizia automatica del processo Chromium alla chiusura del server.

## Avvio

- Aggiungere il file CSV con i dati nel formato [{x.xxx, y.yyy}] (separatore `,`)
- Avviare il server: `npm start`.

## Aggiunta e modifica di algoritmi e filtri

1. Per aggiungere un nuovo algoritmo o filtro, creare il modulo corrispondente nella cartella `/filters`. Il nuovo filtro o algoritmo deve accettare un array di punti nel formato `{ x: number, y: number }` e restituire un array di punti nello stesso formato.
2. Importare e applicare il nuovo algoritmo o filtro nel modulo `/public/ChartDataAggregator.js`. Assicurarsi che i dati in ingresso e in uscita corrispondano al formato richiesto dei punti.
3. Per integrare l'algoritmo o il filtro nel grafico, modificare la funzione `ChartDataAggregator` in modo che includa i risultati del nuovo algoritmo o filtro. Ciò permetterà di integrare automaticamente i risultati nei grafici visualizzati nella pagina web.

## Funzioni principali

### `ChartDataAggregator`

- **Descrizione**: Aggrega ed elabora i dati per la visualizzazione dei grafici.
- **Parametri**:
  - `csvpoints`: Array di punti dal file CSV.
  - `coordinateA`: Coordinata X iniziale per il filtraggio dei dati (trasmessa dal modulo web).
  - `coordinateB`: Coordinata X finale per il filtraggio dei dati (trasmessa dal modulo web).
- **Valore restituito**: Promise -> che restituisce un array di set di dati per la visualizzazione.

### Filtri base dell'algoritmo Enchance-18

#### `weightedGroundLevelMedianFilter`

- **Descrizione**: Filtro mediano pesato per il livello del terreno, che cerca in ogni finestra il punto con la coordinata Y più bassa e gli assegna il peso massimo.
- **Parametri**:
  - `points`: Array di punti da filtrare.
  - `maxWindowSize`: Dimensione massima della finestra per il filtraggio mediano.
  - `maxLength`: Lunghezza massima dell'intervallo per una finestra di filtraggio.
- **Valore restituito**: Set di punti filtrati.

### `CubicPolynomialApproximation`

- **Informazioni generali**: Classe per l'approssimazione dei dati utilizzando il polinomio cubico con il metodo dei minimi quadrati.

#### Descrizione del Metodo `findRandomQualitySegments`
Il metodo `findRandomQualitySegments` rappresenta un approccio unico all'analisi e all'elaborazione di un set di punti per determinare segmenti rettilinei. L'algoritmo utilizza la selezione casuale dei punti come punto di partenza per ogni segmento ed estende progressivamente il segmento in entrambe le direzioni finché le condizioni dell'approssimazione data (in base ai valori di RMSE) non vengono violate.

#### Caratteristiche dell'Algoritmo
1. **Selezione Casuale dei Punti Iniziali:**
   L'algoritmo inizia con un punto scelto casualmente nel set, evitando i pregiudizi associati all'approccio sequenziale e garantendo una copertura più uniforme dell'intero intervallo di dati.

2. **Estensione Dinamica dei Segmenti:**
   I segmenti si estendono a sinistra e a destra dal punto iniziale finché non soddisfano i criteri di approssimazione specificati, garantendo flessibilità nell'elaborazione dei dati.

3. **Gestione Efficace dei Segmenti:**
   L'algoritmo traccia ed esclude i segmenti elaborati, prevenendo la rielaborazione e migliorando l'efficienza.

4. **Evitare Cicli Infiniti:**
   Sono inclusi meccanismi per prevenire cicli infiniti, essenziali per garantire la stabilità e l'affidabilità dell'algoritmo.

## Come utilizzare

1. Importare i moduli necessari nel proprio progetto.
2. Preparare i dati sotto forma di array di punti.
3. Utilizzare `ChartDataAggregator` per aggregare ed elaborare i dati.
4. Applicare filtri aggiuntivi, se necessario.

## Dipendenze

Il progetto dipende dai seguenti moduli e librerie:

- `IDataSet`, `IPoint`, `IFilter` per la strutturazione dei dati.

## Licenza
---
## Sintesi degli algoritmi applicati

### Meccanismi di regressione e filtraggio applicati
- **Filtro mediano pesato**: Riduce il rumore e le anomalie nei dati, adattato dall'autore per le caratteristiche della scansione laser aggiungendo pesi ai punti più vicini alla superficie terrestre.
- **Metodo dei minimi quadrati**: Utilizzato per l'approssimazione lineare dei punti, minimizzando le deviazioni.
- **Approssimazione polinomiale cubica**: Crea curve complesse per una migliore corrispondenza dei dati, con valutazione della precisione tramite RMSE.
- **Ricerca del percorso ottimale nel grafo**: Utilizza la combinatoria e le strategie di ricerca del percorso ottimale per selezionare i migliori segmenti di dati, l'adattamento dell'autore consiste nel calcolo dei punti di incentivo nella **funzione `OptimaFunction`** per la lunghezza del segmento e il numero di vertici rimossi.

### Problemi non risolti
L'autore del codice ha affrontato la sfida dell'approssimazione dei dati con polinomi a pezzi di grado N, ma non è riuscito a implementare completamente questo approccio a causa della complessità della risoluzione del sistema di equazioni, che tiene conto dell'uguaglianza delle coordinate e delle derivate ai bordi dei segmenti. A differenza dell'interpolazione spline cubica, che passa esattamente attraverso tutti i punti dati e ha un sistema di equazioni "quadrato" con una soluzione univoca, l'approssimazione è un compito più complesso che richiede un equilibrio tra la precisione e la levigatezza della funzione approssimata.

### Conclusione
Gli algoritmi e i metodi applicati riflettono un approccio complesso e multilivello all'analisi e all'elaborazione dei dati, dimostrando la capacità dell'autore di risolvere problemi complessi di analisi dei dati utilizzando metodi avanzati di matematica applicata e programmazione. Ciò evidenzia una profonda comprensione dei principi matematici e algoritmici necessari per lavorare efficacemente con set di dati complessi. Gli algoritmi applicati hanno particolare rilevanza nei campi del Data Science e del Machine Learning. In particolare, i concetti di **regressione**, filtraggio e ricerca di soluzioni ottimali sono elementi chiave in queste discipline. I modelli di regressione, come il metodo dei minimi quadrati e l'approssimazione polinomiale, sono utilizzati per modellare e prevedere le dipendenze tra variabili. Il filtraggio dei dati, incluso il filtro mediano pesato, è importante per la pulizia e la preparazione dei dati per l'analisi. La ricerca di soluzioni ottimali in questo contesto può essere paragonata ai compiti di ottimizzazione, dove l'obiettivo non è trovare il percorso più breve, ma massimizzare o minimizzare una

 determinata funzione obiettivo in base ai criteri specificati. Ciò include l'equilibrio tra diversi parametri e vincoli, una competenza fondamentale nel **Data Science e Machine Learning**.

## Descrizione estesa degli algoritmi

### Algoritmo applicato: Filtro Mediano Pesato

#### Descrizione
Questo algoritmo viene utilizzato per la pre-elaborazione dei dati ottenuti dalla scansione laser. Il filtro mediano viene applicato per ridurre il rumore e le anomalie casuali, preservando al contempo le caratteristiche strutturali chiave dei dati. L'idea principale è di scegliere il valore mediano da un set di punti all'interno di una determinata finestra, aiutando a levigare i dati, mantenendo tendenze importanti e riducendo l'influenza delle anomalie.

#### Adattamento dell'Autore: Aggiunta di Pesi ai Punti Vicini alla Superficie Terrestre
Una caratteristica dei dati di scansione laser è che i punti riflessi non possono essere situati al di sotto del livello della superficie terrestre. Sulla base di questa proprietà, è stata sviluppata un'adattamento del filtro mediano. In questa modifica, ai punti situati più vicini alla presunta superficie terrestre viene assegnato un peso maggiore. Questo aumenta la loro influenza sul valore mediano finale, migliorando così la precisione dei dati filtrati. Questo approccio riduce efficacemente l'influenza delle riflessioni anomale, che possono verificarsi a causa del rumore o di altri artefatti della scansione laser.

---

### Algoritmo applicato: Filtro Metodo dei Minimi Quadrati

#### Informazioni generali
Questo algoritmo viene applicato per approssimare un set di punti con una linea retta, utilizzando il metodo dei minimi quadrati. È progettato per trovare la migliore linea che minimizza la somma dei quadrati delle deviazioni di ciascun punto dati da questa linea. Questo è un metodo statistico ampiamente utilizzato per analizzare le relazioni lineari tra variabili.

#### Funzionamento dell'Algoritmo
1. **Calcolo dei Parametri della Linea**
   - Per un set di punti `(x, y)` dato, l'algoritmo calcola prima la pendenza (`slope`) e l'intercetta (`intercept`) della linea.
   - Questi parametri sono determinati calcolando le somme `sumX`, `sumY`, `sumXY`, `sumXX`, e applicando le formule dei minimi quadrati.

2. **Gestione dei Casi Particolari**
   - Se i punti sono meno di due, l'algoritmo restituisce il set di punti originale, poiché per l'approssimazione di una linea sono necessari almeno due punti.

3. **Approssimazione e Restituzione dei Risultati**
   - L'algoritmo restituisce i punti iniziali e finali corrispondenti alla linea calcolata con i minimi quadrati. Questo permette di rappresentare la linea approssimata basata sul set di dati originale.

4. **Calcolo dell'Errore Quadratico Medio (RMSE)**
   - Viene calcolato il RMSE (Root Mean Square Error), che rappresenta la radice quadrata del valore medio dei quadrati delle differenze tra i valori osservati e previsti di Y. È una misura della precisione dell'approssimazione.

---

### Descrizione dell'Algoritmo: Ricerca del percorso più breve con funzione di ottimizzazione basata sui punti di incentivazione per massimizzazione della lunghezza e del numero di vertici rimossi

#### Descrizione Generale
Questo algoritmo rappresenta una combinazione di metodi di combinatoria e ottimizzazione del percorso più breve per determinare i segmenti ottimali in un set di punti ottenuti dalla scansione laser o da dati geologici simili. L'obiettivo è determinare tali segmenti della polilinea che minimizzano l'errore complessivo (RMSE) e allo stesso tempo preservano l'integrità strutturale dei dati.

#### Funzionamento dell'Algoritmo
1. **Calcolo del RMSE con Applicazione del Filtro Metodo dei Minimi Quadrati**
   - Per ogni possibile segmento della polilinea viene calcolato il RMSE (Root Mean Square Error), utilizzando il metodo dei minimi quadrati per l'approssimazione e il confronto con i punti originali della superficie.

2. **Determinazione dei Segmenti Ottimali**
   - L'algoritmo considera iterativamente tutti i possibili segmenti e sceglie quelli che soddisfano la soglia RMSE specificata.
   - Viene inoltre applicata la funzione `optimaFunction`, che tiene conto del numero di vertici rimossi e della lunghezza del segmento, per bilanciare tra precisione dell'approssimazione e conservazione della dettagli della polilinea.

3. **Ricostruzione del Percorso Ottimale**
   - Dopo aver calcolato i segmenti ottimali, viene ricostruito il percorso corrispondente ai segmenti selezionati, per rappresentare la polilinea ottimale.

#### Adattamento dell'Autore: Funzione `optimaFunction`
- Questa funzione è unica per l'algoritmo e serve a determinare l'equilibrio tra la rimozione dei vertici della polilinea e la conservazione della sua lunghezza complessiva.
- Permette di controllare il grado di semplificazione della polilinea, prestando attenzione sia alla rimozione dei punti superflui sia alla conservazione della forma e della dimensione principale della polilinea.

---

### Descrizione dell'Algoritmo: Approssimazione Polinomiale Cubica (regressione) e Filtro Metodo dei Minimi Quadrati

#### Descrizione Generale
L'algoritmo `CubicPolynomialApproximation` rappresenta un approccio complesso all'elaborazione e all'analisi dei dati, basato sull'approssimazione polinomiale cubica e sul metodo dei minimi quadrati. L'obiettivo è trovare la migliore approssimazione per un set di punti, minimizzando gli errori e fornendo una rappresentazione fluida dei dati.

#### Elementi Chiave dell'Algoritmo
1. **Approssimazione Polinomiale Cubica**
   - Calcolo dei coefficienti del polinomio cubico che meglio corrisponde al set di punti originale.
   - Viene utilizzato il metodo di risoluzione del sistema di equazioni lineari per determinare questi coefficienti.

2. **Filtro Metodo dei Minimi Quadrati**
   - Viene applicato per creare un'approssimazione lineare semplificata dei punti originali. Questo fornisce una valutazione aggiuntiva della precisione dell'approssimazione polinomiale.

3. **Valutazione della Precisione**
   - Calcolo del RMSE (Root Mean Square Error) per entrambe le approssimazioni (polinomiale e lineare), che permette di valutare e confrontare la precisione di entrambi i modelli.

4. **Ricerca dei Segmenti Ottimali**
   - L'algoritmo include anche una metodologia per la ricerca e la selezione dei migliori segmenti dei dati, basata sui criteri di precisione specificati e sull'analisi comparativa della differenza in RMSE tra le due approssimazioni.

5. **Adattamento dell'Autore**
   - Una caratteristica è l'introduzione di condizioni aggiuntive nella determinazione dei segmenti ottimali, come valori soglia di RMSE e analisi comparativa della differenza di RMSE tra l'approssimazione polinomiale e quella lineare.
