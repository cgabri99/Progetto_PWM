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
- [ ] valutare se e dove mettere keyword "async" per gestione dei caricamenti delle pagine
	- [ ] scheda personaggio (serie, comics e eventi)
	- [ ] home (caricamento figurine) probabilmente non necessario
	- [ ] album (al momento caricamento singolo delle figurine)
- [x] controllo della mail con regexp
- [x] controllare la validità dell'id del personaggio al momento dell'aggiunta della figurina
- [x] post gestione figurine 
- [x] put gestione figurine
- [ ] rimuovere tutte le stampe di debug
- [x] dare la possibilità ad admin di creare offerte per bustine **premium**
- [ ] paginazione scheda personaggio per serie comics e events
- [ ] setting dei timer prima dei cambi di finestra (come in album nel caso di vendita figurine)
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
- [ ] in album disabilitare bottoni paginazione fino alla fine del caricamento altrimenti si distrugge tutto