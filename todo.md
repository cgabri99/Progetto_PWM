- [ ] creare collection per la gestione degli scambi
```js
// idea di struttura dell'bson degli scambi
{
	_id: "univoco creato dal db",
	id_utente: "id dell'utente che possiede la figurina",
	characther: 123456 //id del personaggio messo in scambio
	characther_wanted: 123456 //id del personaggio con cui scambiare la figurina (se non presente indica che si accettano proposte di scambio)
}
```
- [x] aggiungere link "indietro" nella pagina scheda personaggio
- [ ] valutare se e dove mettere keyword "async" per gestione dei caricamenti delle pagine
	- [ ] scheda personaggio (serie, comics e eventi)
	- [ ] home (caricamento figurine) probabilmente non necessario
	- [x] album (al momento caricamento singolo delle figurine)
- [x] controllo della mail con regexp
- [x] controllare la validità dell'id del personaggio al momento dell'aggiunta della figurina
- [x] post gestione figurine 
- [x] put gestione figurine
- [ ] rimuovere tutte le stampe di debug
- [ ] modificare pagina acquisto bustine con bustine *premium*
- [ ] paginazione scheda personaggio per serie comics e events
- [ ] setting dei timer prima dei cambi di finestra (come in album nel caso di vendita figurine)