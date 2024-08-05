const express = require('express');

//modulo gestione hash password
const crypto = require('crypto');

//moduli gestione MongoDB
const { MongoClient, ObjectId, BSON } = require('mongodb');
const DB_NAME = "PWM";
const uri = "mongodb+srv://cgabri:yaud2eer@cluster0.osp8vca.mongodb.net/";
const client = new MongoClient(uri);

const cors = require('cors');

//moduli swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
// const { count } = require('console');

const app = express();
const port = 3000;

const adminID = "6655c92fbfd3008190d30378";


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(cors());

/**
 * Restituisce l'id associato alla mail se presente, altrimenti email non presente
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} email - L'email dell'utente da cercare.
*/
async function getUserId(res, email) {
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
 * La modifica hai credits é permessa solo a scopo di testing e potrebbe tornare utile
 * al professore in fase di convalida del progetto.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dell'utente da aggiornare.
 * @param {Object} body - L'oggetto contenente le informazioni aggiornate dell'utente.
 * @returns {Promise<void>} - Una promessa che si risolve quando l'utente viene aggiornato nel database.
 */
async function updateUser(res, id, body) {
    //controllo che le modifiche presenti nel body siano legittime
    const modificeAutorizzate = ["name", "surname", "age", "hero", "psw"];
    for (const [key] of Object.entries(body)) {
        if (modificeAutorizzate.indexOf(key) === -1) {
            res.status(400).json({ "errore": `La chiave ${key} non è accettata` });
            return;
        }
    }

    // Controlla se i campi soddisfano i requisiti di lunghezza
    if (body.name && body.name.length < 3) {
        res.status(400).json({ error: "Nome troppo corto" });
        return;
    }
    if (body.surname && body.surname.length < 3) {
        res.status(400).json({ error: "Cognome troppo corto" });
        return;
    }
    if (body.psw && body.psw.length < 8) {
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
        console.error(e);
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
        console.error(e);
        res.status(404).json({ error: "Id non presente" });
        return;
    } finally {
        await pwmClient.close();
    }

    if (user) {
        res.json({
            nome: user.name,
            cognome: user.surname,
            email: user.email
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
        console.error(e);
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
        console.error(e);
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
        // Cerca le figurine di un utente a partire dall'id
        const figurine = await pwmClient.db(DB_NAME).collection("Figurine").find({
            proprietario: ObjectId.createFromHexString(id)
        }).sort({ name: 1 }).toArray();

        if (num !== undefined && offset !== undefined) {
            var pagina = figurine.slice(offset, offset + num);
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
        console.error(e);
        if (e instanceof BSON.BSONError)
            res.status(404).json({ error: "Id non valido" });
        else
            res.status(500).json({ error: "Errore server" });
        return;
    } finally {
        await pwmClient.close();
    }
}

/*
* Restituisce il totale delle figurine possedute dall'utente con l'id specificato
*
* @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
* @param {string} id - L'ID dell'utente di cui si vogliono conoscere le figurine possedute.
* @returns {Promise<void>} - Una promessa che si risolve quando il totale delle figurine dell'utente è stato restituito.
*/
async function getTotalFigurine(res, id) {
    const pwmClient = await client.connect();
    try {
        // Cerca le figurine di un utente a partire dall'id
        const figurine = await pwmClient.db(DB_NAME).collection("Figurine").find({
            proprietario: ObjectId.createFromHexString(id)
        }).sort({ name: 1 }).toArray();

        if (figurine) {
            res.json({
                id: id,
                total: figurine.length,
                figurine: figurine
            });
        } else {
            res.json({
                id: id,
                total: 0,
                figurine: []
            });
        }
    } catch (e) {
        console.error(e);
        if (e instanceof BSON.BSONError) {
            res.status(404).json({ error: "Id non valido" });
        } else {
            res.status(500).json({ error: "Errore server" });
        }
    } finally {
        await pwmClient.close();
    }
}

// /**
//  * @param {number} id_figurina - l'id della figurina da controllare
//  * @returns true se l'id é valido, false se non lo é
//  */
// function isValid(id_figurina) {
//     //todo controllare che l'id della figurina sia un id valido
//     return true;
// }

/**
 * Aggiunge una o più figurine all'utente con l'id specificato
 * 
 * @param {Object} body - Il body della richiesta contenente la lista delle figurine da aggiungere all'utente.
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'id dell'utente a cui aggiungere le figurine.
 * @returns {Promise<void>} - Una promessa che si risolve quando le figurine sono state aggiunte all'utente.
 */
async function addFigurine(body, res, id) {
    var figurine = body.figurine;
    if (!body.figurine) {
        res.status(400).json({ error: "Campo figurine della richiesta mancante!" });
        return;
    }
    for (let i = 0; i < figurine.length; i++) {
        if (!figurine[i].id) {
            res.status(400).json({ error: "Campo id figurina mancante!" });
            return;
        }
        if (!figurine[i].count) {
            res.status(400).json({ error: "Campo count figurina mancante!" });
            return;
        } if (figurine[i].count <= 0) {
            res.status(400).json({ error: "Campo count non valido!" });
            return;
        }
        if (!figurine[i].name) {
            res.status(400).json({ error: "Campo name figurina mancante!" });
            return;
        }
    }
    // //controllo di validità dell'input
    // for (var figurina in figurine) {
    //     if (!isValid(figurina.id) || figurina.count <= 0) {
    //         res.status(400).json({ error: "L'id, il conteggio della figurina non é valido" });
    //         return;
    //     }
    // }
    const pwmClient = await client.connect();
    try {
        // Cerca le figurine di un utente a partire dall'id
        var possedute = await pwmClient.db(DB_NAME).collection("Figurine").find({
            proprietario: ObjectId.createFromHexString(id)
        }).sort({ name: 1 }).toArray();

        //aggiorno la lista delle figurine possedute
        for (let i = 0; i < figurine.length; i++) {
            var figurina = figurine[i];
            if (possedute.find(f => f.id === figurina.id) === undefined) {
                await pwmClient.db(DB_NAME).collection("Figurine")
                    .insertOne({
                        proprietario: ObjectId.createFromHexString(id),
                        id: figurina.id,
                        name: figurina.name,
                        count: figurina.count,
                        disponibili: figurina.count
                    });
                possedute = await pwmClient.db(DB_NAME).collection("Figurine").find({
                    proprietario: ObjectId.createFromHexString(id)
                }).sort({ name: 1 }).toArray();
            } else {
                await pwmClient.db(DB_NAME).collection("Figurine")
                    .updateOne({
                        id: figurina.id,
                        proprietario: ObjectId.createFromHexString(id)
                    }, {
                        $inc: {
                            count: figurina.count,
                            disponibili: figurina.count
                        }
                    });
            }
        }

        possedute = await pwmClient.db(DB_NAME).collection("Figurine").find({
            proprietario: ObjectId.createFromHexString(id)
        }).sort({ name: 1 }).toArray()

        res.json({
            status: "ok",
            possedute: possedute
        });
    } catch (e) {
        console.error(e);
        if (e instanceof BSON.BSONError)
            res.status(404).json({ error: "Id non valido" });
        else
            res.status(500).json({ error: "Errore server" });
        return;
    } finally {
        await pwmClient.close();
    }
}
/** 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} utente - l'id dell'utente
 * @param {string} id_figurina - l'id della figurina da vendere
 * @returns {Promise<number>} - Una promessa che si risolve con il codice di stato della richiesta.
*/
async function vendiFigurina(utente, id_figurina) {
    const pwmClient = await client.connect();
    try {

        // Cerca le figurine di un utente a partire dall'id
        var possedute = await pwmClient.db(DB_NAME).collection("Figurine").find({
            proprietario: ObjectId.createFromHexString(utente)
        }).toArray();

        var daVendere = possedute.find(f => f.id === id_figurina);

        if (daVendere === undefined) {
            return 404;
        } else {
            if (daVendere.disponibili <= 0) {
                return 409;
            } else if (daVendere.count === 1) {
                await pwmClient.db(DB_NAME).collection("Figurine").deleteOne({
                    id: id_figurina,
                    proprietario: ObjectId.createFromHexString(utente)
                });
            } else {
                await pwmClient.db(DB_NAME).collection("Figurine").updateOne({
                    id: id_figurina,
                    proprietario: ObjectId.createFromHexString(utente)
                }, {
                    $inc: {
                        count: -1,
                        disponibili: -1
                    }
                });
            }
            return 200;
        }
    } catch (e) {
        console.error(e);
        return 500;
    } finally {
        await pwmClient.close();
    }
}

/**
 * Crea una proposta di scambio e la aggiunge alla collection Scambi.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {Object} body - Il body della richiesta contenente i dati relativi allo scambio.
 * @returns {Promise<number>} - Una promessa che si risolve con il codice di stato della richiesta.
*/
async function creaScambio(res, body) {
    const pwmClient = await client.connect();
    if (!body.da_scambiare) {
        res.status(400).json({ error: "Campo id figurina da scambiare mancante!" });
        return;
    } else if (!body.desiderata) {
        res.status(400).json({ error: "Campo id figurina desiderata mancante!" });
        return;
    } else if (!body.venditore) {
        res.status(400).json({ error: "Campo id venditore mancante!" });
        return;
    } else if (!body.nome_da_scambiare) {
        res.status(400).json({ error: "Campo nome figurina da scambiare mancante!" });
        return;
    } else if (!body.nome_desiderata) {
        res.status(400).json({ error: "Campo nome figurina desiderata mancante!" });
        return;
    } else if (!body.nome_venditore) {
        res.status(400).json({ error: "Campo nome venditore mancante!" });
        return;
    } else if (body.da_scambiare === body.desiderata) {
        res.status(400).json({ error: "Non puoi scambiare una carta con se stessa!" });
        return;
    }

    try {
        const found = await pwmClient.db(DB_NAME).collection("Figurine")
            .findOne(
                {
                    id: body.da_scambiare,
                    proprietario: ObjectId.createFromHexString(body.venditore)
                });

        if (found === null) {
            res.status(404).json({ error: `Non possiedi figurine con id ${body.da_scambiare}` });
            return;
        }

        if (found.disponibili <= 0) {
            res.status(409).json({ error: `Hai già raggiunto il numero massimo di scambi creati per questa figurina!` });
            return;
        }

        await pwmClient.db(DB_NAME).collection("Figurine")
            .updateOne(
                {
                    id: body.da_scambiare,
                    proprietario: ObjectId.createFromHexString(body.venditore)
                },
                {
                    $inc:
                        { disponibili: -1 }
                });

        //creo il bson scambio
        const scambio = {
            "_id": new ObjectId(),
            //la stringa contenente l'id dell'utente proprietario
            "venditore": ObjectId.createFromHexString(body.venditore),
            "nome_venditore": body.nome_venditore,
            //id figurina da scambiare
            "da_scambiare": body.da_scambiare,
            "nome_da_scambiare": body.nome_da_scambiare,
            //id figurina desiderata
            "desiderata": body.desiderata,
            "nome_desiderata": body.nome_desiderata
        }

        //insert nel database
        await pwmClient.db(DB_NAME).collection("Scambi").insertOne(scambio);
        res.status(200).json({ status: "ok", scambio: scambio });
    } catch (e) {
        console.error(e);
        if (e instanceof BSON.BSONError)
            res.status(404).json({ error: "Id non valido" });
        else
            res.status(500).json({ error: "Errore server" });
    } finally {
        await pwmClient.close();
    }
}

/**
 * Restituisce la lista degli scambi creati o disponibili per l'utente con l'id specificato.
 *  
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {boolean} creati - Indica se si vogliono ottenere gli scambi creati o disponibili per l'utente.
 * @param {string} id - L'ID dell'utente di cui si vogliono ottenere gli scambi.
 * @returns {Promise<void>} - Una promessa che si risolve quando la lista degli scambi viene restituita.
 * */
async function getScambi(res, creati, id) {
    const pwmClient = await client.connect();
    try {
        var scambi = [];
        if (creati === true) {
            // fornisce la lista degli scambi creati dall'utente
            scambi = await pwmClient.db(DB_NAME).collection("Scambi").find({
                venditore: ObjectId.createFromHexString(id)
            }).toArray();
        } else {
            // fornisce la lista degli scambi disponibili per l'utente
            scambi = await pwmClient.db(DB_NAME).collection("Scambi").find({
                venditore: { $ne: ObjectId.createFromHexString(id) }
            }).toArray();

            var possedute = await pwmClient.db(DB_NAME).collection("Figurine").find({
                proprietario: ObjectId.createFromHexString(id)
            }).toArray();

            scambi = scambi.filter((s) => {
                return possedute.find(f => (f.id === s.desiderata && f.disponibili >= 1)) !== undefined;
            });
        }
        res.status(200).json({ scambi: scambi });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Errore server" });

    } finally {
        await pwmClient.close();
    }
}

/**
 * Elimina uno scambio dal database.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id - L'ID dello scambio da eliminare.
 * @returns {Promise<void>} - Una promessa che si risolve quando lo scambio viene eliminato dal database.
 */
async function deleteScambio(res, body) {
    if (!body.id_scambio || !body.id_acquirente) {
        res.status(400).json({ error: "Richiesta errata!" });
        return;
    }

    const pwmClient = await client.connect();
    try {
        //cerca lo scambio con l'id specificato
        const scambio = await pwmClient.db(DB_NAME).collection("Scambi").findOne({ _id: ObjectId.createFromHexString(body.id_scambio) });
        if (scambio === null) {
            res.status(404).json({ error: "Scambio non presente" });
            return;
        }

        const posseduteAcquirente = await pwmClient.db(DB_NAME).collection("Figurine")
            .find({ proprietario: ObjectId.createFromHexString(body.id_acquirente) }).toArray();

        if (posseduteAcquirente.find(f => f.id === scambio.da_scambiare) !== undefined) {
            res.status(409).json({ error: "L'acquirente possiede già la figurina messa in scambio!" });
            return;
        }

        await aggiornaAcquirenti(pwmClient, scambio.venditore.toString(), scambio, false);
        await aggiornaAcquirenti(pwmClient, body.id_acquirente, scambio, true);

        //elimina lo scambio con l'id specificato
        await pwmClient.db(DB_NAME).collection("Scambi").deleteOne({ _id: ObjectId.createFromHexString(body.id_scambio) });
        res.status(200).json({ status: "ok", scambio_effettuato: scambio });
    } catch (e) {
        console.error(e);
        if (e instanceof BSON.BSONError)
            res.status(404).json({ error: "Id non valido" });
        else
            res.status(500).json({ error: "Errore server" });
        return;
    } finally {
        await pwmClient.close();
    }
}

/**
 * Aggiorna le informazioni degli acquirenti nel database a seguito di uno scambio riuscito.
 * 
 * @param {Object} res - L'oggetto di risposta utilizzato per inviare la risposta HTTP.
 * @param {string} id_utente - L'ID dell'utente da aggiornare.
 * @param {Object} scambio - L'oggetto contenente le informazioni relative allo scambio.
 * @param {boolean} isAcquirente - Descrive se l'utente e' l'acquirente o il venditore.
 * @returns {Promise<void>} - Una promessa che si risolve quando l'acquirente viene aggiornato nel database.
 */

async function aggiornaAcquirenti(client, id_utente, scambio, isAcquirente) {
    var inUsita = isAcquirente ? scambio.desiderata : scambio.da_scambiare;
    var inArrivo = isAcquirente ? scambio.da_scambiare : scambio.desiderata;

    var posseduta = await client.db(DB_NAME).collection("Figurine")
        .findOne({ proprietario: ObjectId.createFromHexString(id_utente), id: inUsita });

    if (posseduta.count === 1) {
        // possiedo solo una copia della carta da scambiare
        await client.db(DB_NAME).collection("Figurine")
            .deleteOne({
                proprietario: ObjectId.createFromHexString(id_utente),
                id: inUsita
            });
    } else {
        var count = isAcquirente ? -1 : 0;
        //possiedo più copie della carta da scambiare
        await client.db(DB_NAME).collection("Figurine")
            .updateOne(
                {
                    id: inUsita,
                    proprietario: ObjectId.createFromHexString(id_utente)
                },
                {
                    $inc:
                    {
                        disponibili: count,
                        count: -1
                    }
                });
    }

    posseduta = await client.db(DB_NAME).collection("Figurine")
        .findOne({ proprietario: ObjectId.createFromHexString(id_utente), id: inArrivo });

    if (posseduta === null) {
        //non possiedo la carta che mi serve
        await client.db(DB_NAME).collection("Figurine")
            .insertOne({
                proprietario: ObjectId.createFromHexString(id_utente),
                id: inArrivo,
                name: isAcquirente ? scambio.nome_da_scambiare : scambio.nome_desiderata,
                count: 1,
                disponibili: 1
            });
    } else {
        await client.db(DB_NAME).collection("Figurine")
            .updateOne(
                {
                    id: inArrivo,
                    proprietario: ObjectId.createFromHexString(id_utente)
                },
                {
                    $inc:
                    {
                        count: 1,
                        disponibili: 1
                    }
                });
    }
}

async function creaOffertaMaxiPacchetto(res, body) {
    if (!body.admin) {
        res.status(400).json({ error: "Manca l'id dell'utente!" });
        return;
    }
    if (body.admin !== adminID) {
        res.status(401).json({ error: "Solo l'admin può creare offerte per maxi pacchetti!" });
        return;
    }
    if (!body.n_figurine) {
        res.status(400).json({ error: "Manca il numero di figurine dell'offerta!" });
        return;
    } if (!body.price) {
        res.status(400).json({ error: "Manca il prezzo dell'offerta!" });
        return;
    }
    if (body.price <= 0 || body.price > 5) {
        res.status(400).json({ error: "Il prezzo deve essere compreso tra 1 e 5!" });
        return;
    }
    if (body.n_figurine <= 0 || body.n_figurine > 30) {
        res.status(400).json({ error: "Il numero delle figurine deve essere compreso tra 1 e 30!" });
        return;
    }

    const pwmClient = await client.connect();
    try {
        //creo il bson offerta
        var offerta = {
            "_id": new ObjectId(),
            "n_figurine": body.n_figurine,
            "price": body.price
        }

        //insert nel database
        await pwmClient.db(DB_NAME).collection("MaxiPacchetti").insertOne(offerta);
        res.status(200).json({ status: "ok", offerta: offerta });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Errore server" });
    } finally {
        await pwmClient.close();
    }
}

async function getOfferteMaxiPacchetti(res) {
    const pwmClient = await client.connect();
    try {
        var offerte = await pwmClient.db(DB_NAME).collection("MaxiPacchetti").find().toArray();
        res.status(200).json({ offerte: offerte });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Errore server" });
    } finally {
        await pwmClient.close();
    }
}

async function accettaOffertaMaxiPacchetto(res, body) {
    if (!body.id_offerta || !body.id_acquirente) {
        res.status(400).json({ error: "Richiesta errata!" });
        return;
    }

    const pwmClient = await client.connect();
    try {
        //cerca l'offerta con l'id specificato
        const offerta = await pwmClient.db(DB_NAME).collection("MaxiPacchetti").findOne({ _id: ObjectId.createFromHexString(body.id_offerta) });
        if (offerta === null) {
            res.status(404).json({ error: "Offerta non presente" });
            return;
        }

        const credits = await pwmClient.db(DB_NAME).collection("Users").findOne({ _id: ObjectId.createFromHexString(body.id_acquirente) }).credits;

        if (credits < offerta.price) {
            res.status(409).json({ error: "Crediti insufficienti" });
            return;
        } else {
            await pwmClient.db(DB_NAME).collection("Users").updateOne({ _id: ObjectId.createFromHexString(body.id_acquirente) }, { $inc: { credits: -offerta.price } });
        }

        //elimina l'offerta con l'id specificato
        await pwmClient.db(DB_NAME).collection("MaxiPacchetti").deleteOne({ _id: ObjectId.createFromHexString(body.id_offerta) });
        res.status(200).json({ status: "ok", offerta: offerta });
    } catch (e) {
        console.error(e);
        if (e instanceof BSON.BSONError)
            res.status(404).json({ error: "Id non valido" });
        else
            res.status(500).json({ error: "Errore server" });
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
        res.json({ id: user._id, nome: user.name, cognome: user.surname });
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
    var id = req.params.id;
    var body = req.body;
    await updateUser(res, id, body);
});

app.delete("/users/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    var id = req.params.id;
    await deleteUser(res, id);
});

app.get("/users", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    var email = req.query.email;
    await getUserId(res, email);
});

app.get("/users/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Utenti']
    var id = req.params.id;
    await getUserById(res, id);
});

// *Gestione crediti
app.put("/credits/:id/:qty", async (req, res) => {
    // #swagger.tags = ['Gestione Crediti Utente']
    var id = req.params.id;
    var crediti = parseInt(req.params.qty);
    await addCrediti(res, crediti, id);
});

app.get("/credits/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Crediti Utente']
    var id = req.params.id;
    await getCrediti(res, id);
});

// *Gestione figurine
app.get("/figurine/:id/:dim/:offset", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    var id = req.params.id;
    var dim = parseInt(req.params.dim);
    var offset = parseInt(req.params.offset);
    await getFigurine(res, id, dim, offset);
});

app.get("/figurine/:id", async (req, res) => {
    // #swagger.tags = ['Gestione Figurine']
    var id = req.params.id;
    await getTotalFigurine(res, id);
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
    var id = req.params.id;
    await addFigurine(req.body, res, id);
});

//* Gestione vendita figurine
app.put("/figurine/:id_utente/:id_figurina", async (req, res) => {
    // #swagger.tags = ['Vendita figurine']
    var utente = req.params.id_utente;
    var figurina = parseInt(req.params.id_figurina);
    var code = await vendiFigurina(utente, figurina);
    if (code == 404) {
        res.status(code).json({ error: "Id utente o figurina non presente" });
    } else if (code == 409) {
        res.status(code).json({ error: "Non hai abbastanza copie di figurina disponibili per venderla!" });
    } else if (code == 500) {
        res.status(code).json({ error: "Errore server!" });
    }
    else {
        await addCrediti(res, 1, utente);
    }
});

// *scambio figurine
app.post("/scambio", async (req, res) => {
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
    await creaScambio(res, req.body);
});

app.get("/scambio/:id_utente", async (req, res) => {
    // #swagger.tags = ['Scambio Figurine']
    var utente = req.params.id_utente;
    var creati = req.query.creati === 'true';
    await getScambi(res, creati, utente);
});

app.delete("/scambio", async (req, res) => {
    // #swagger.tags = ['Scambio Figurine']
    await deleteScambio(res, req.body);
});

// *Gestione offerte maxi pacchetti
app.post("/maxiPacchetti", async (req, res) => {
    // #swagger.tags = ['Offerte Maxi Pacchetti']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/creaOffertaSchema"
                    }
                }
            }
        } 
    */
    await creaOffertaMaxiPacchetto(res, req.body);
});


app.get("/maxiPacchetti", async (req, res) => {
    // #swagger.tags = ['Offerte Maxi Pacchetti']
    await getOfferteMaxiPacchetti(res);
});

app.delete("/maxiPacchetti", async (req, res) => {
    // #swagger.tags = ['Offerte Maxi Pacchetti']
    /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/accettaOffertaSchema"
                    }
                }
            }
        } 
    */
    await accettaOffertaMaxiPacchetto(res, req.body);
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