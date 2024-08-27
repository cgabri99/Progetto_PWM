- [x] creare collection per la gestione degli scambi
```js
// idea di struttura dell'bson degli scambi
{
	_id: "univoco creato dal db",
	venditore: "id dell'utente che possiede la figurina",
	da_scambiare: 123456 //id del personaggio messo in scambio
	desiderata: 123456 //id del personaggio con cui scambiare la figurina (se non presente indica che si accettano proposte di scambio)
}
```
- [x] aggiungere link "indietro" nella pagina scheda personaggio
- [x] controllo della mail con regexp
- [x] controllare la validità dell'id del personaggio al momento dell'aggiunta della figurina
- [x] post gestione figurine 
- [x] put gestione figurine
- [ ] rimuovere tutte le stampe di debug
- [x] dare la possibilità ad admin di creare offerte per bustine **premium**
- [x] paginazione scheda personaggio per serie comics e events
- [x] setting dei timer prima dei cambi di finestra (come in album nel caso di vendita figurine)
- [x] controllo di consistenza durante la vendita di una figurina
- [x] sistemare dispaly bottone possedute in album
- [x] sostituire gli splice con deleteOne in index.js
- [x] filtraggio degli scambi disponibli
- [x] modifica struttura delle figurine con inserimento di disponibili al posto di countScambio
- [x] spostare figurine in una collection a parte
- [x] **Valutare bene come salvare i dati delle figurine in album, ora sono *statici* forse meglio renderli dinamici tenendo in memoria solo l'ID e caricando volta per volta i risultati dal server Marvel**
- [x] Visualizzare lista a aprte per gli scambi inseriti dall'utente
- [x] Completare form selezione figurine
- [x] Sistemare pagina acquisto bustine
- [x] Inserire visualizzazione [caricamenti](https://getbootstrap.com/docs/5.3/components/spinners/) o  [placeolders](https://getbootstrap.com/docs/5.3/components/placeholders/)
- [x] controllare se il problema di connessione (getScambi) al db é stato risolto correttamente
- [x] aggiungere disabled a tutti i pulsanti quando si accetta uno scambio
- [x] gestire i controlli di integrità negli scambi in modo che non si possano accettare scambi dove la figurina in arrivo é già presente nell’album
- [x] aggiungi messaggio di errore in  crea scambio se non viene trovato nessun supereroe
- [x] in album disabilitare bottoni paginazione fino alla fine del caricamento altrimenti si distrugge tutto
- [x] aggiornare readme
- [x] placeolder scheda personaggio
- [x] inserire btn group in modifica dati
- [x] riscrivi funzione deleteuser
- [x] aggiungi navbar a tutte le pagine
- [x] aggiorna documentazione index.js
- [x] aggiungere controllo nella sezione crea scambio se l'utente non ha figurine disponibili allo scambio
- [x] aggiungi placeholder in dettagli personaggio per events, comics e series
- [x] modifica struttura navbar rimuovendo login in quanto non viene più utilizzata la home come atterraggio a seguito del logout
- [x] aggiungi logica di controllo refresh di acquistobustine anche su accetta scambio
- [x] screenshot esempi di utilizzo della pagina per la consegna
- [x] impedire all'utente la possibilità di cambiare pagina in album durante il caricamento
- [x]inserire [transaction](https://www.mongodb.com/docs/manual/core/transactions/) per la gestione delle operazioni che lo richiedono
- [x] aggiornare readme.m
- [ ] gestire frontend album vuoto
- [ ] gestire frontend placeolder comics, events, series dopo pagina 1