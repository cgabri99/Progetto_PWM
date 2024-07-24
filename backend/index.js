
const express = require('express');

//modulo gestione hash paddword
const crypto = require('crypto');

//moduli gestione MongoDB
const { MongoClient, ObjectId } = require('mongodb');
const DB_NAME = "PWM";
const uri = "mongodb+srv://cgabri:yaud2eer@cluster0.osp8vca.mongodb.net/";
const client = new MongoClient(uri);

const cors = require('cors');

//moduli swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
const port = 3000;


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(cors());

/**
 * Restituisce l'id associato alla mail se presente, 
 * altrimenti email non presente
*/
async function getUser(res, email) {
    const pwmClient = await client.connect();

    // Cerca un utente con l'email e la password specificate
    const user = await pwmClient.db(DB_NAME).collection("Users").findOne({
        email: email
    });

    await pwmClient.close();

    if (user) {
        res.json({ id: user._id });
    } else {
        res.status(404).json({ error: "Email non presente" });
    }
}

/**
 * Aggiorna le informazioni di un utente nel database.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dell'utente da aggiornare.
 * @param {Object} body - L'oggetto contenente le informazioni aggiornate dell'utente.
 * @returns {Promise<void>} - Una promessa che si risolve quando l'utente viene aggiornato nel database.
 */
async function updateUser(res, id, body) {
    //controllo che le modifiche presenti nel body siano legittime
    const modificeAutorizzate = ["name", "surname", "age", "hero", "psw", "credits"];
    for (const [key, _] of Object.entries(body)) {
        if (modificeAutorizzate.indexOf(key) === -1) {
            res.status(400).json({ "errore": `La chiave ${key} non è accettata` });
            return;
        }
    }

    // Controlla se i campi soddisfano i requisiti di lunghezza
    if (user.name.length < 3) {
        res.status(400).json({ error: "Nome troppo corto" });
        return;
    }
    if (user.surname.length < 3) {
        res.status(400).json({ error: "Cognome troppo corto" });
        return;
    }
    if (user.psw.length < 8) {
        res.status(400).json({ error: "Password troppo corta" });
        return;
    }

    const pwmClient = await client.connect();

    if (body.psw) {
        body.psw = hash(body.psw);
    }

    try {
        var myQuery = { _id: ObjectId.createFromHexString(id) };
        var newValues = { $set: { ...body } }

        await pwmClient.db(DB_NAME).collection("Users")
            .updateOne(myQuery, newValues);
    } catch (e) {
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    res.json({ status: "Modifica effettuata" });
}

/**
 * Restituisce le informazioni di un utente dal database utilizzando l'ID dell'utente.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dell'utente di cui si vogliono ottenere le informazioni.
 * @returns {Promise<void>} - Una promessa che si risolve quando le informazioni dell'utente vengono restituite.
 */
async function getUserById(res, id) {
    const pwmClient = await client.connect();
    var user = undefined;
    try {
        // Cerca un utente con l'email e la password specificate
        user = await pwmClient.db(DB_NAME).collection("Users").findOne({
            _id: ObjectId.createFromHexString(id)
        });
    } catch (e) {
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    if (user) {
        res.json({
            nome: user.name,
            cognome: user.surname,
        });
    } else {
        res.status(404).json({ error: "Id non presente" });
    }
}

//funzione utilizzata per l'hasing delle password degli utenti
function hash(input) {
    return crypto.createHash('sha256')
        .update(input)
        .digest('hex');
}

// Check if the email is a valid address
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Adds a new user to the database.
 * 
 * @param {Object} user - The user object containing the user's information.
 * @param {Object} res - The response object used to send the HTTP response.
 * @returns {Promise<void>} - A promise that resolves when the user is added to the database.
 */
async function addUser(user, res) {
    // Controlla se tutti i campi obbligatori sono presenti
    if (user.name && user.surname && user.email && user.psw) {
        // Controlla se i campi soddisfano i requisiti di lunghezza
        if (user.name.length < 3) {
            res.status(400).json({ error: "Nome troppo corto" });
            return;
        }
        if (user.surname.length < 3) {
            res.status(400).json({ error: "Cognome troppo corto" });
            return;
        }
        if (user.psw.length < 8) {
            res.status(400).json({ error: "Password troppo corta" });
            return;
        }
        if (!isValidEmail(user.email)) {
            res.status(400).json({ error: "La email deve essere un indirizzo valido!" });
            return;
        }
    } else {
        res.status(400).json({ error: "Campi obbligatori assenti" });
        return;
    }

    user.psw = hash(user.psw);

    const pwmClient = await client.connect();
    try {
        // Inserisce il nuovo utente nel database
        await pwmClient.db(DB_NAME).collection("Users").insertOne(user);
        res.status(201).json(user);
    } catch (e) {
        if (e.code == 11000) {
            res.status(400).json({ error: "Email già utilizzata" });
        } else {
            res.status(500).json({ error: `Errore Generico: ${e.code}` });
        }
    } finally {
        await pwmClient.close();
    }
}

/**
 * Elimina un utente dal database.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dell'utente da eliminare.
 * @returns {Promise<void>} - Una promessa che si risolve quando l'utente viene eliminato dal database.
 */
async function deleteUser(res, id) {
    const pwmClient = await client.connect();
    const result = await pwmClient.db(DB_NAME).collection("Users").deleteOne({ _id: ObjectId.createFromHexString(id) });
    await pwmClient.close();
    if (result.deletedCount == 0) {
        res.send(`Nessun utente con ID: ${id} presente`);
    } else {
        res.send(`Eliminato utente con ID: ${id}`);
    }
}

/**
 * Aggiunge crediti all'utente con l'ID specificato.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {number} crediti - I crediti da aggiungere all'utente.
 * @param {string} id - L'ID dell'utente a cui aggiungere i crediti.
 * @returns {Promise<void>} - Una promessa che si risolve quando i crediti sono stati aggiunti all'utente.
 */
async function addCrediti(res, crediti, id) {
    const pwmClient = await client.connect();
    var user = undefined;
    try {
        // Cerca un utente a partire dall'id
        user = await pwmClient.db(DB_NAME).collection("Users").findOne({
            _id: ObjectId.createFromHexString(id)
        });

        crediti += parseInt(user.credits);
        await pwmClient.db(DB_NAME).collection("Users")
            .updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: { "credits": crediti } });
    } catch (e) {
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    if (user) {
        res.status(200).json({ status: "ok", crediti: crediti });
    } else {
        res.status(404).json({ error: "Id non presente" });
    }
}

/**
 *  Restituisce il numero di crediti posseduti dall'utente con l'id specificato
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dell'utente di cui si vuole conoscere il numero di crediti.
 * @returns {Promise<void>} - Una promessa che si risolve quando i crediti dell'utente sono stati restituit
 */
async function getCrediti(res, id) {
    const pwmClient = await client.connect();
    var user = undefined;
    try {
        // Cerca un utente a partire dall'id
        user = await pwmClient.db(DB_NAME).collection("Users").findOne({
            _id: ObjectId.createFromHexString(id)
        });
    } catch (e) {
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    if (user) {
        res.json({
            id: user._id,
            crediti: user.credits
        });
    } else {
        res.status(404).json({ error: "Id non presente" });
    }
}

/**
 * Restituisce le figurine possedute dall'utente con l'id specificato
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dell'utente di cui si vogliono conoscere le figurine possedute.
 * @param {number} num - Il numero di figurine da restituire.
 * @param {number} offset - L'offset a partire dal quale restituire le figurine.
 * @returns {Promise<void>} - Una promessa che si risolve quando le figurine dell'utente sono state restituite.
 */
async function getFigurine(res, id, num, offset) {
    const pwmClient = await client.connect();
    try {
        // Cerca un utente a partire dall'id
        figurine = await pwmClient.db(DB_NAME).collection("Figurine").find({
            proprietario: ObjectId.createFromHexString(id)
        }).sort({ name: 1 }).toArray();

        if (num !== undefined && offset !== undefined) {
            pagina = figurine.slice(offset, offset + num);
        }

        if (figurine) {

            res.json({
                id: id,
                total: figurine.length,
                actual: pagina ? pagina.length : figurine.length,
                figurine: pagina ? pagina : figurine
            });
        } else {
            res.json({
                id: id,
                total: 0,
                actual: 0,
                figurine: []
            });
        }
    } catch (e) {
        if (e.name === "BSONError")
            res.status(404).json({ error: "Id non valido" });
        else
            res.status(500).json({ error: "Errore server" });
        return;
    } finally {
        await pwmClient.close();
    }
}

/**
 * @param {number} id_figurina - l'id della figurina da controllare
 * @returns true se l'id é valido, false se non lo é
 */
function isValid(id_figurina) {
    //todo controllare che l'id della figurina sia un id valido
    return true;
}
/**
 * Aggiunge una o più figurine all'utente con l'id specificato
 * 
 * @param {Object} body - Il body della richiesta contenente la lista delle figurine da aggiungere all'utente.
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'id dell'utente a cui aggiungere le figurine.
 * @returns {Promise<void>} - Una promessa che si risolve quando le figurine sono state aggiunte all'utente.
 */
async function addFigurine(body, res, id) {
    if (!body.figurine) {
        res.status(400).json({ error: "Campo figurine della richiesta mancante!" });
        return;
    }
    var figurine = body.figurine;
    //controllo di validità dell'input
    for (var figurina in figurine) {
        if (!isValid(figurina.id) || figurina.count <= 0) {
            res.status(400).json({ error: "L'id, il conteggio della figurina non é valido" });
            return;
        }
    }
    const pwmClient = await client.connect();
    var user = undefined;
    try {
        // Cerca utente a partire dall'id
        user = await pwmClient.db(DB_NAME).collection("Users").findOne({
            _id: ObjectId.createFromHexString(id)
        });

        // aggiorno la lista delle figurine possedute
        possedute = user.figurine;
        for (var i = 0; i < figurine.length; i++) {
            figurina = figurine[i];
            var found = possedute.find((element) => element.id == figurina.id);
            if (found) {
                found.count += figurina.count;
            } else {
                possedute.push(figurina);
            }
        }

        //update del database con la nuova lista di figurine
        await pwmClient.db(DB_NAME).collection("Users")
            .updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: { "figurine": possedute } });
    } catch (e) {
        console.log(e);
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    res.json({ status: "ok", possedute: possedute });
}

/**
 * Sostituisce la lista delle figurine possedute dall'utente con la nuova lista fornita, utilizzata
 * solo per il testing delle API. Potrebbe tornare utile al professore in fase di convalida del progetto.
 * 
 * @param {Object} body - Il body della richiesta contenente la lista delle figurine da inserire all'utente.
 * @param {Object} res - La risposta da mandare.
 * @param {string} id - L'id dell'utente a cui aggiungere o sostituire le figurine.
 * @returns {Promise<void>} - Una promise che si risolve quando la lista delle figurine è aggiunta o sostituita con successo.
 */
async function sostituisciFigurine(body, res, id) {

    if (!body.figurine) {
        res.status(400).json({ error: "Campo figurine della richiesta mancante!" });
        return;
    }

    var figurine = body.figurine;
    //controllo di validità dell'input
    for (var i = 0; i < figurine.length; i++) {
        figurina = figurine[i];
        if (!figurina.id || !isValid(figurina.id)) {
            res.status(400).json({ error: `Attributo id della figurina ${JSON.stringify(figurina)} mancante o non valido!` });
            return;
        }
        if (!figurina.count || figurina.count <= 0) {
            res.status(400).json({ error: `Attributo count della figurina ${JSON.stringify(figurina)} mancante o non valido!` });
            return;
        }
    }

    const pwmClient = await client.connect();
    var user = undefined;
    try {
        //update del database con la nuova lista di figurine
        await pwmClient.db(DB_NAME).collection("Users")
            .updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: { "figurine": figurine } });
    } catch (e) {
        console.error(e);
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    res.json({ status: "ok", possedute: figurine });
}

/** 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} utente - l'id dell'utente
 * @param {string} venduta - l'id della figurina venduta
 * @returns {Promise<number>} - Una promessa che si risolve con il codice di stato della richiesta.
*/
async function vendiFigurina(utente, venduta) {
    const pwmClient = await client.connect();
    var user = undefined;
    try {
        // Cerca utente a partire dall'id
        user = await pwmClient.db(DB_NAME).collection("Users").findOne({
            _id: ObjectId.createFromHexString(utente)
        });

        // aggiorno la lista delle figurine possedute
        possedute = user.figurine;
        for (var i = 0; i < possedute.length; i++) {
            figurina = possedute[i];
            if (figurina.id === venduta) {
                if (figurina.countScambio !== undefined && figurina.count - figurina.countScambio <= 0) {
                    return 409;
                }
                figurina.count -= 1;
                if (figurina.count === 0) {
                    possedute.splice(i, 1);
                }
                //update del database con la nuova lista di figurine
                await pwmClient.db(DB_NAME).collection("Users")
                    .updateOne({ _id: ObjectId.createFromHexString(utente) }, { $set: { "figurine": possedute } });
                return 200;
            }
        }
        return 404;
    } catch (e) {
        return 404;
    } finally {
        await pwmClient.close();
    }
}

/**
 * Crea una proposta di scambio e la aggiunge alla collection Scambi.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {Object} body - Il body della richiesta contenente i dati relativi allo scambio.
 * @param {string} proprietario - l'id dell'utente che crea la proposta di scambio.
 * @returns {Promise<number>} - Una promessa che si risolve con il codice di stato della richiesta.
*/
async function creaScambio(res, body, proprietario) {
    const pwmClient = await client.connect();
    if (!body.da_scambiare || !body.desiderata) {
        res.status(400).json({ error: "Il codice della figurina da scambiare e/o desiderata non è presente" });
        return;
    }

    try {
        // Cerca utente a partire dall'id
        user = await pwmClient.db(DB_NAME).collection("Users").findOne({
            _id: ObjectId.createFromHexString(proprietario)
        });

        //controllo che la figurina da scambiare sia presente
        var found = false;
        for (var i = 0; i < user.figurine.length; i++) {
            figurina = user.figurine[i];
            if (figurina.id === body.da_scambiare) {
                found = true;
                if (figurina.countScambio === undefined) {
                    //inserico il campo countScambio
                    await pwmClient.db(DB_NAME).collection("Users")
                        .updateOne({ _id: ObjectId.createFromHexString(proprietario), "figurine.id": body.da_scambiare },
                            { $set: { "figurine.$.countScambio": 1 } });
                } else {
                    //controllo che il numero di scambi non superi il numero di copie possedute
                    figurina.countScambio += 1;
                    if (figurina.countScambio > figurina.count) {
                        res.status(400).json({ error: "Non puoi avere in contemporanea più scambi che copie di figurine!" });
                        return;
                    }
                    await pwmClient.db(DB_NAME).collection("Users")
                        .updateOne({ _id: ObjectId.createFromHexString(proprietario), "figurine.id": body.da_scambiare },
                            { $set: { "figurine.$.countScambio": figurina.countScambio } });
                }
                break;
            }
        }

        if (!found) {
            res.status(404).json({ error: "Figurina da scambiare non presente" });
            return;
        }

        //creo il bson scambio
        scambio = {
            "_id": new ObjectId(),
            //la stringa contenente l'id dell'utente proprietario
            "proprietario": proprietario,
            //id figurina da scambiare
            "da_scambiare": body.da_scambiare,
            //id figurina desiderata
            "desiderata": body.desiderata
        }

        //insert nel database
        await pwmClient.db(DB_NAME).collection("Scambi").insertOne(scambio);
        res.status(200).json({ status: "ok", scambio: scambio });
    } catch (e) {
        console.error(e);
        res.status(404).json({ error: "Id proprietario non presente" });
        return;
    } finally {
        await pwmClient.close();
    }
}

/**
 * Effettua il login di un utente.
 * @param {Object} body - Il body della richiesta contenente le credenziali dell'utente.
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @returns {Promise<void>} - Una promessa che si risolve con l'id dell'utente loggato.
 */
async function loginUser(body, res) {
    // Controlla se l'email e la password sono presenti
    if (!body.email) {
        res.status(400).send({ error: "Email Mancante" });
        return;
    }
    if (!body.psw) {
        res.status(400).send({ error: "Password Mancante" });
        return;
    }

    body.psw = hash(body.psw);

    const pwmClient = await client.connect();

    // Cerca un utente con l'email e la password specificate
    const user = await pwmClient.db(DB_NAME).collection("Users").findOne({
        email: body.email,
        psw: body.psw
    });

    await pwmClient.close();

    if (user) {
        res.json({ id: user._id });
    } else {
        res.status(404).json({ error: "Credenziali Errate" });
    }
}


// *Gestione utenti
app.post("/users", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/addUserSchema"
                    }  
                }
            }
        } 
    */
    await addUser(req.body, res);
});

app.put("/users/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/updateUserSchema"
                    }  
                }
            }
        } 
    */
    id = req.params.id;
    body = req.body;
    await updateUser(res, id, body);
});

app.delete("/users/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    id = req.params.id;
    await deleteUser(res, id);
});

app.get("/users", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    email = req.query.email;
    const users = await getUser(res, email);
});

app.get("/users/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    id = req.params.id;
    const users = await getUserById(res, id);
});

// *Gestione crediti
app.put("/credits/:id/:qty", async (req, res) => {
    // #swagger.tags = ['Gestione Crediti Utente']
    id = req.params.id;
    crediti = parseInt(req.params.qty);
    await addCrediti(res, crediti, id);
});

app.get("/credits/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Crediti Utente']
    id = req.params.id;
    await getCrediti(res, id);
});

// *Gestione acquisto figurine
app.get("/figurine/:id/:dim/:offset", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    id = req.params.id;
    dim = parseInt(req.params.dim);
    offset = parseInt(req.params.offset);
    await getFigurine(res, id, dim, offset);
});

app.put("/figurine/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/putFigurineSchema"
                    }  
                }
            }
        } 
    */
    id = req.params.id;
    await addFigurine(req.body, res, id);
});

app.post("/figurine/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/postFigurineSchema"
                    }  
                }
            }
        } 
    */
    id = req.params.id;
    await sostituisciFigurine(req.body, res, id);
});

//* Gestione vedita figurine
app.put("/figurine/:id_utente/:id_figurina", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    utente = req.params.id_utente;
    figurina = parseInt(req.params.id_figurina);
    code = await vendiFigurina(utente, figurina);
    if (code == 404) {
        res.status(code).json({ error: "Id utente o figurina non presente" });
    } else if (code == 409) {
        res.status(code).json({ error: "Non hai abbastanza copie di figurina per venderla, considerando gli scambi che hai in atto!" });
    }
    else {
        await addCrediti(res, 1, utente);
    }
});

// *scambio figurine
app.post("/scambio/:id_proprietario", async (req, res) => {
    // #swagger.tags = ['Scambio Figurine']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/creazioneScambioSchema"
                    }
                }
            }
        } 
    */
    proprietario = req.params.id_proprietario;
    await creaScambio(res, req.body, proprietario);
});

// *login
app.post("/login", async (req, res) => {
    // #swagger.tags = ['Login']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/loginSchema"
                    }  
                }
            }
        } 
    */
    const body = req.body;
    const id = await loginUser(body, res);
    res.json(id);
});


app.listen(port, () => {
    console.log(`PWM porta in ascolto: ${port}`);
});