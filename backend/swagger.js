const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        title: 'Scambio di figurine',
        description: 'Applicazione web che permette lo scambio, acquisto, e apertura di pacchetti di figurine Marvel'
    },
    components: {
        schemas: {
            addUserSchema: {
                $name: "Gabriele",
                $surname: "Cucchi",
                age: 18,
                hero: "Batman",
                $email: "gabriele.cucchi@studenti.unimi.it",
                $psw: "password",
                $credits: 0
            }, updateUserSchema: {
                name: "Gabriele",
                surname: "Cucchi",
                age: 18,
                hero: "Superman",
                psw: "password",
                credits: 0
            }, putFigurineSchema: {
                $figurine: [{
                    id: 123456,
                    name: "figurina1",
                    count: 1
                }]
            }, creazioneScambioSchema: {
                venditore: "id_venditore",
                nome_venditore: "nome_venditore",
                da_scambiare: 1010831,
                nome_da_scambiare: "figurina_da_scambiare",
                desiderata: 1011200,
                nome_desiderata: "figurina_desiderata"

            }, loginSchema: {
                $email: "gabriele.cucchi@studenti.unimi.it",
                $psw: "password"
            }
        }
    },
    host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);