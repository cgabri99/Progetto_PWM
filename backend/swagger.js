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
                $credits: 0,
                figurine: [{
                    id: 1,
                    count: 2
                }]
            }, updateUserSchema: {
                name: "Gabriele",
                surname: "Cucchi",
                age: 18,
                hero: "Superman",
                psw: "password",
                credits: 0
            }, putFigurineSchema: {
                $figurine: [{
                    id: 1,
                    count: 2
                }]
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