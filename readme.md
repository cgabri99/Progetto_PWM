# Progetto
Benvenuti nel progetto di Gabriele Cucchi 962790! Questo file README fornisce una panoramica del progetto **Album delle Figurine dei Super Eroi (AFSE)** e delle istruzioni su come utilizzare le funzionalità. Il progetto consiste in un'applicazione web che permette di gestire l'acquisto e scambio di figurine di supereroi Marvel.

## Considerazioni sulle prestazioni
Si vuole sottolineare che durante la realizzazione del progetto (lugio/Agosto 2024) il server marvel incaricato della Gestione delle chiamte API è notevolmente rallenatato e al momento l'esperienza dell'utente finale è altamente compromessa, d'altraparte si è scelto di continuare a usufruire del server e non trovare altre soluzioni (per esempio "congelando" i dati in un file statico dal quale attingere) a fini didattici e per attenersi alle richieste del docente. 

## Comandio di avvio
Per avviare il server che gestisce il backend basta eseguire i seguenti comandi
```bash
cd backend/
npm start
```

## Diagramma
![diagramma](images/diagramma%20progetto.excalidraw.png )

## Schema database
![schema database](images/schemaDatabase.png)

## Struttura scehramata home
Nella navbar della home abbiamo 2 sezioni principali:
- gestione utente
    - modifica dati
    - elimina utente
    - log out
- gestione figurine 
    - album
    - crea scambio
    - scambi disponibili
    - acquista bustine
    - maxi pacchetti

## Utilizzo del localstorage
Il localstorage viene utilizzto dall'applicazione per memorizzare i dati di connessione dell'utente in particolare:
- alla chiave *nome_utente* $\to$ viene associato il nome dell'utente loggato o null
- alla chiave *logged* $\to$ viene associato true o false in base allo stato di login
- alla chiave *id_utente* $\to$ viene associato l'id dell'utente loggato o null


## Funzionalità aggiuntive implementate
L'applicazione, oltre alle funzionalità base, offre le seguenti operazioni aggiuntive:
- dalla sezione album ogni utente può [vendere](#vendita-figurine) le sue figurine in cambio di crediti
- l'utente amministratore, nella sezione dedicata, può generare offerte per pacchetti di figurine maxi contenenti da 6 a 30 figurine e il prezzo può andare da 1 a 5 crediti. Nella stesssa sezione tutti gli altri utenti possono acquistare le offerte per i pacchetti di figurine. Per maggiori informazioni realtive all'utente amministratore visita la sezione [dedicata](#utente-amministratore)
- per quanto riguarda gli [scambi](#scambi) sono gestiti i controlli di integritàin modo che:
    - non si possano accettare scambi dove la figurina in arrivo è già presente nell’album
    - non si possono creare scambi dove la figurina in arrivo e in uscita coincidono

## Utente amministratore
L'utente amministratore **DEVE** avere le seguenti caratteristiche:
- nome $\to$ admin
- cognome $\to$ admin
- mail $\to$ admin@admin.it

### Gestione utente amministratore
La stringa esadecimale relativa all'_id legato all'amministratore è salvata nel file [index.js](backend/index.js), più precismanete nella costante adminId, in caso di ricreazione dell'utente amministratore deve essere modificato il valore della costante

## Scelte implementative e descrizione della realizzazione delle operazioni
Per tutte le operazioni dell'applicazione prima dell'esecuzione viene controllato che l'utente sia loggato, altrimenti questo viene rimbalzato alla scghermata di login

### Sign in utente
Al momento della creazione del profilo i campi:
- nome
- cognome
- email
- password

sono obbligatori, mentre gli altri sono facoltativi. 
Al momento della creazione ogni account possiede 0 crediti.

**La email è utilizzata come index** dal database, non è quindi permessa la creazione di più profili con la stessa email.

### Login utente
La pagina di login prevede l'inserimento della password e email in caso non siano corrette non viene fornito l'accesso al sito e vengono segnalati gli errori.
In caso di accesso effettuato i dati relativi alla sessione sono salvati nel [localstorage](#utilizzo-del-localstorage)

### Logout utente
I dati del [localstorage](#utilizzo-del-localstorage) vengono azzearti e l'utente rimbalzato alla schermata di login

### Modifica dati utente
Le modifiche permesse all'utente sono:
- nome
- cognome
- età
- supereroe preferito
- password

Non è permesso modificare l'email in quanto è utilizzata come indice del database e insieme all'id utente definisce univocvamente l'utente nel database

### Eliminazione utente
Al momento dell'eliminazione reperiamo dal [Localstoarge](#utilizzo-del-localstorage) l'id dell'utente loggato e in caso di conferma dell'intezione di eliminare l'account questo viene rimosso dal database e l'utente reindirizzato alla schermta di login

### Acquisto crediti
Nella navbar è presente il "salvadanaio" dell'utente, cliccando sul pulsante si apre la pagina relativa all'acquisto "fittizio" dei crediti.
Non è permesso acquistare un numero di crediti nullo o negativo.

### Album
in questa sezione l'utente può:
- accedere ai dettagli della figurina
- [vendere](#vendita-figurine) la figurina
- monitorare il numero di copie possedute delle figurine

### Acquisto pacchetti
Nella sezione gestione figurine l'utente può accedere alla pagina relativa all'acquisto dei pacchetti di figurine. *Ogni pacchetto base contiene 5 carte e costa 1 credito*

### Vendita figurine
Ad ogni figurina è asseganto il valore "commerciale" di 1 credito.
L'utente può vendere una figurina anche se ne possiede solamente 1 copia.

### Scambi
Nella sezione relativa alla visualizzazione degli scambi sono presenatte due liste separate:
- **scambi creati** $\to$ la lista degli scambi creati dall'utente
- **scambi disponibili** $\to$ la lista degli scambi che l'utente è in condizione di poter accettare.

Per essere in consizione di accettare uno scambio un utente deve essere in possesso della figurina desiderata da chi ha creato lo scambio e deve averene un numero sufficiente di copie [disponibili](#copie-disponibili-di-una-figurina).

**N.B.** Un utente può scambiare una figurina anche se ne possiede solo una copia.
**N.B.** Vengono mostrati nella lista degli scambi disponibili anche gli scambi dovel'utente è già in possesso della figurina messa in scambio, ma non possono essere accettati per maggiori [dettagli](#accettazione-di-uno-scambio)

### Creazione di uno scambio
La lista delle carte che possono essere messe in scambio viene automaticamente generata a partire da quelle disponibili, mentre per la figurina desiderata la lista viene reperita da quella dei supereroi disponibili sul server. In particolare va inserito il nome che si vuole ricercare nell'apposito input e la lista viene popolata in seguito alla rispsota del server.

### Accettazione di uno scambio
Per accettare uno scambio l'utente può cliccare uno dei bottoni relativi alla lista degli scambi disponibili e si possono verificare due situazioni:
- l'utente **non possiede la figurina messa in scambio** $\to$ **lo scambio viene accettao**, le figurine scambiate e la pagina aggionata
- l'utente **possiede la figurina messa in scambio** $\to$ **lo scambio non viene accettao**, la situazione delle figurine rimane invariata e viene visualizzato un messaggio di errore

#### Copie disponibili di una figurina
Le copie disponibili di una figurina sono definite secondo la seguente formula:

$$Copie_{disponibili} = Copie_{possedute} - N_{scambi} $$

dove $N_{scambi}$ indica il numero di scambi creati dall'utente in cui quella figurina viene proposta come oggetto dello scambio.


## Struttura del progetto
All'interno della cartella [frontend](frontend/) sono contenuti i file relativi all'implementazione del frontend.

All'interno della cartella [backend](backend/) sono contenuti i file relativi all'implementazione del backend.
In particolare:
- [index.js](backend/index.js) $\to$ contiene le istruzioni realtive al server
- [script.js](backend/script.js) $\to$ contiene le funzioni comuni a più parti del progetto
- [swagger.js](backend/swagger.js) $\to$ contiene le istruzioni realtive alla creazione dello swagger

## Immagini
Le schermate di prova del funzioanemnto dell'applicazione sono contenute nella cartella [images](images/)