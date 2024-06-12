- [ ] creare db per la gestione degli scambi
```js
// idea di struttura dell'bson degli scambi
{
	_id: "univoco creato dal db",
	id_utente: "id dell'utente che possiede la figurina",
	characther: 123456 //id del personaggio messo in scambio
	characther_wanted: 12345 //id del personaggio con cui scambiare la figurina (se non presente indica che si accettano proposte di scambio)
}
```
- [ ] spostare la lista delle figurine possedute da parametro dell'user a nuovo db ? da valutare
```js
// idea di struttura dell'bson di figurine possedute
{
	_id: "univoco creato dal db",
	id_utente: "id dell'utente che possiede la figurina",
	characther: 123456 //id del personaggio della carta nel portale marvel
}
```
- [x] aggiungere link "indietro" nella pagina scheda personaggio
- [ ] valutare se e dove mettere keyword "async" per gestione dei caricamenti delle pagine
	- [ ] scheda personaggio (serie, comics e eventi)
	- [ ] home (caricamento figurine) probabilmente non necessario
	- [ ] album (al momento caricamento singolo delle figurine)
- [x] controllo della mail con regexp
- [ ] controllare la validità dell'id del personaggio al momento dell'aggiunta della figurina
- [ ] post gestione figurine 
- [ ] put gestione figurine