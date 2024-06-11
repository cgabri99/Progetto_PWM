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

//Aggiorna i dati dell'utente, se non presenti nel body della richiesta
//i dati non vengono modificati, vengono invece sovrascritti se presenti
//non é permessa la modifica della mail
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
 * Indica la presenza o meno nel database di un utente con id specificato
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

/**
 * Aggiungi un nuovo utente al database
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
        //TODO controllo email
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
 * Elimina un utente per ID dal database se esiste un utente con quell'id, 
 * altrienti non elimina nessun utente
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
 * Aggiunge crediti all'utente
 */
async function addCrediti
    (res, crediti, id) {
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
        res.send("OK");
    } else {
        res.status(404).json({ error: "Id non presente" });
    }
}

/**
 * Restituisce il numero di crediti dell'utente
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
 * Restituisce la lista delle figurine possedute dall'utente con la relativa quantità
 */
async function getFigurine(res, id) {
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
            figurine: user.figurine
        });
    } else {
        res.status(404).json({ error: "Id non presente" });
    }
}

/**
 * 
 * @param {l'id della figurina da controllare} id_figurina 
 * @returns true se l'id é valido, false se non lo é
 */
function isValid(id_figurina) {
    //todo controllare che l'id della figurina sia un id valido
    return true;
}
/**
 * 
 * @param {il body della richiesta contenete la lista delle figurine (id e quantità) da inserire all'utente} body 
 * @param {la risposta da mandare} res 
 * @param {l'id dell'utente a cui aggiungere le figurine} id 
 */
async function addFigurine(body, res, id) {

    if (!body.figurine) {
        res.status(400).json({ error: "Campo figurine della richiesta mancante!" });
        return;
    }
    var figurine = body.figurine;
    //controllo di validità dell'input
    for (var figurina in figurine) {
        if (!isValid(figurina.id)) {
            res.status(400).json({ error: "L'id della figurina non é valido" });
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

//Effettua il login di un utente
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
app.get("/figurine/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    id = req.params.id;
    await getFigurine(res, id);
});

app.put("/figurine/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    id = req.params.id;
    await addFigurine(req.body, res, id);
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