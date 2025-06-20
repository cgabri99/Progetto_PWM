const n_heroes = 1564;
// eslint-disable-next-line no-unused-vars
const dim_pagina = 30;

/**
 * Imposta un valore nell'oggetto localStorage.
 * 
 * @param {string} item - L'elemento da impostare.
 * @param {string} value - Il valore da assegnare all'elemento.
 */
function setLocalStorage(item, value) {
    localStorage.setItem(item, value);
}

/**
 * Restituisce il valore corrispondente all'elemento specificato nell'oggetto localStorage.
 * 
 * @param {string} item - L'elemento da recuperare.
 * @returns {string|boolean} - Il valore corrispondente all'elemento specificato.
 */
function getLocalStorage(item) {
    if (item === 'logged') {
        var string_item = localStorage.getItem(item);
        return string_item === 'true';
    }
    else {
        return localStorage.getItem(item);
    }
}

function getFromMarvel(url, query = "") {
    var MD5 = function (d) { var r = M(V(Y(X(d), 8 * d.length))); return r.toLowerCase() }; function M(d) { for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++)_ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _); return f } function X(d) { for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++)_[m] = 0; for (m = 0; m < 8 * d.length; m += 8)_[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32; return _ } function V(d) { for (var _ = "", m = 0; m < 32 * d.length; m += 8)_ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255); return _ } function Y(d, _) { d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _; for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) { var h = m, t = f, g = r, e = i; f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e) } return Array(m, f, r, i) } function md5_cmn(d, _, m, f, r, i) { return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m) } function md5_ff(d, _, m, f, r, i, n) { return md5_cmn(_ & m | ~_ & f, d, _, r, i, n) } function md5_gg(d, _, m, f, r, i, n) { return md5_cmn(_ & f | m & ~f, d, _, r, i, n) } function md5_hh(d, _, m, f, r, i, n) { return md5_cmn(_ ^ m ^ f, d, _, r, i, n) } function md5_ii(d, _, m, f, r, i, n) { return md5_cmn(m ^ (_ | ~f), d, _, r, i, n) } function safe_add(d, _) { var m = (65535 & d) + (65535 & _); return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m } function bit_rol(d, _) { return d << _ | d >>> 32 - _ }
    var timestamp = Date.now();
    const publicApiKey = "4d6ff1cbe0cf7f4f2e9a60176ddeb00d";
    const privateApiKey = "a27fda68cbbbafde8e9a53d2abde8857efeb3f1d";
    var parameters = `ts=${timestamp}&apikey=${publicApiKey}&hash=${MD5(timestamp + privateApiKey + publicApiKey)}&`

    return fetch(`http://gateway.marvel.com/v1/${url}?${parameters}${query}`)
        .then(response => response.json())
        .catch(error => console.log('error', error));
}

/**
 * Ottiene i dati da più chiamate API Marvel in modo asincrono.
 * 
 * @param {Array} urls - Un array di URL delle chiamate API Marvel.
 * @returns {Promise<Array>} - Una promessa che si risolve con un array contenente i dati ottenuti dalle chiamate API.
 */
// eslint-disable-next-line no-unused-vars
async function getMultipleMarvel(urls) {
    var promises = [];
    for (let i = 0; i < urls.length; i++) {
        promises.push(await getFromMarvel(urls[i], " "));
    }
    return Promise.all(promises);
}


/**
 * Genera un numero intero casuale compreso tra un valore minimo e un valore massimo.
 *
 * @param {number} min - Il valore minimo (incluso) del range.
 * @param {number} max - Il valore massimo (incluso) del range.
 * @returns {number} Il numero intero casuale generato.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Funzione per acquistare un pacchetto di figurine.
 * @param {number} dim - La dimensione del pacchetto di figurine da acquistare.
 * @returns {Promise<Array<Object>>} Una Promise che restituisce un array di oggetti rappresentanti le figurine acquistate.
 * @throws {Error} Se si verifica un errore durante il processo di acquisto.
 */
function acquistaPacchetto(dim) {
    return new Promise((resolve, reject) => {
        var figurine = [];
        for (let i = 0; i < dim; i++) {
            var offset = getRandomInt(0, n_heroes - 1);
            getFromMarvel("public/characters", `limit=1&offset=${offset}`)
                .then(data => {
                    var hero = data.data.results[0];
                    var dati_hero = {
                        id: hero.id,
                        name: hero.name,
                        count: 1
                    }
                    figurine.push(dati_hero);
                    if (figurine.length === dim) {
                        resolve(figurine);
                    }
                })
                .catch(error => reject(error));
        }
    });
}


/**
 * Controlla se l'utente è loggato.
 * Se l'utente non è loggato, visualizza un messaggio di errore e reindirizza alla pagina di login dopo 2 secondi.
 */
// eslint-disable-next-line no-unused-vars
function checkLoggedInUser() {
    if (!getLocalStorage("logged")) {
        const err = document.getElementById('error');
        err.classList.remove('d-none');
        err.innerHTML = 'Utente non loggato!';
        window.setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    }
}

// eslint-disable-next-line no-unused-vars
async function aggiornaPagina() {
    await aggiornaNavbar();
}

/**
 * Aggiorna la navbar con le informazioni dell'utente loggato.
 */
async function aggiornaNavbar() {
    var menuUtente = document.getElementById('menuUtente');
    var menuFigurine = document.getElementById('menuFigurine');
    var msg = document.getElementById('benvenuto');
    var salvadanaio = document.getElementById('salvadanaio');

    var is_logged = getLocalStorage("logged");

    if (is_logged) {
        var id_utente = getLocalStorage("id_utente");
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        try {
            const response = await fetch(`http://localhost:3000/users/${id_utente}`, requestOptions);
            const text = await response.text();
            const json = await JSON.parse(text);
            if (!json.error) {
                msg.classList.remove('d-none');
                menuUtente.classList.remove('disabled');
                menuFigurine.classList.remove('disabled');
                msg.innerHTML = `Benvenuto ${json.nome}`;
                salvadanaio.classList.remove('d-none');
                salvadanaio.innerHTML = `Crediti: ${json.crediti}`;
            }
        } catch (error) {
            console.error(error);
        }
    }

}


/**
 * Funzione per effettuare il logout dell'utente.
*/
// eslint-disable-next-line no-unused-vars
function sign_out() {
    var menuUtente = document.getElementById('menuUtente');
    var menuFigurine = document.getElementById('menuFigurine');
    var msg = document.getElementById('benvenuto');

    setLocalStorage("logged", false);
    setLocalStorage("id_utente", null);
    setLocalStorage("nome_utente", null);

    msg.classList.add('d-none');
    menuUtente.classList.add('disabled');
    menuFigurine.classList.add('disabled');
    window.location.href = "login.html";
}

module.exports = {
    acquistaPacchetto
};


