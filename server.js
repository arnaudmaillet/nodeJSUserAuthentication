const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

// Init Bcryot (Encryption package)
const bcrypt = require('bcrypt')
const salt = 10

// Init const express
const app = express();


app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    key: "userId",
    secret: "codeRouge004DeltaCobra",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}))

// loginsystem DataBase connection
const loginsystemDatabase = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "loginsystem"
})

// Skills DataBase connection
const skillsDatabase = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "basecompetencessio",
    multipleStatements: true
})


// Register
app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password, salt, (err, hash) => {
        loginsystemDatabase.query(
            "INSERT INTO user (username, password) VALUES (?,?)",
            [username, hash],
            (err, result) => {
                result ? res.send({ message: "Bienvenue " + username + " ! Votre compte a bien été créé !" }) : res.send({ err: err });
            }
        )
    })
})


//Login
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    loginsystemDatabase.query(
        "SELECT username, password FROM user WHERE username = ?;",
        username,
        (err, result) => {
            err ? res.send({ err: err }) : null;
            result.length > 0 ? bcrypt.compare(password, result[0].password, (error, response) => {
                if (response) {
                    req.session.user = result
                    res.send({ message: "Bienvenue " + username + " !" })
                } else {
                    res.send({ messageErr: "Erreur : Utilisateur ou mot de passe invalide !" })
                }
            }) : res.send({ messageErr: "Erreur : Utilisateur non reconnu !" });
        }
    )
})

app.post('/logout', (req, res) => {
    if (req.session.user) {
        res.clearCookie('userId');
        req.session.destroy();
        res.send({ loggedIn: false, message: "Vous êtes bien déconnecté. A bientôt !" })
    } else {
        res.send({ message: "Erreur : Veuillez essayer de vous reconnecter !" })
    }
})

app.get('/login', (req, res) => {
    req.session.user ? res.send({ loggedIn: true, user: req.session.user }) : res.send({ loggedIn: false })
})

// app.get('/skillsArray', (req, res) => {
//     skillsDatabase.query(
//         "Select numProc, libProc from processus",
//         (err, rowsProc) => {
//             for (let i in rowsProc) {
//                 let promise = new Promise((resolve, reject) => {
//                     skillsDatabase.query(
//                         "Select processus.numProc, domaine.numDom, libDom from processus, domaine where domaine.numProc = processus.numProc and processus.numProc = " + rowsProc[i].numProc,
//                         (err, rowsDom) => {
//                             let arrayDom = [];
//                             for (let x in rowsDom){
//                                 dom = {numDom : rowsDom[x].numDom, libDom : rowsDom[x].libDom}
//                                 arrayDom.push(dom)
//                             }
//                             resolve(arrayDom)
//                         }
//                     )
//                 })
//                 return promise.then((domaines) => {
//                     for (let z in domaines){
//                         let promise = new Promise((resolve, reject) => {
//                             skillsDatabase.query(
//                                 "Select distinct processus.numProc, domaine.numDom, numAct, libAct from processus, domaine, activite where activite.numDom = domaine.numDom and activite.numProc = processus.numProc and processus.numProc = " + rowsProc[i].numProc + " and domaine.numDom = " + domaines[z].numDom,
//                                 (err, rowsAct) => {
//                                     let arrayAct = [];
//                                     for (let x in rowsAct){
//                                         act = {numAct : rowsAct[x].numAct, libAct : rowsAct[x].libAct}
//                                         arrayAct.push(act)
//                                     }
//                                     resolve(arrayAct)
//                                 }
//                             )
//                         })
//                         return promise.then((activites) => {
//                             domaine = {domaine : domaines[z].libDom, activites};
//                             z = z + 1;
//                         })
//                     }
//                 }).then(() => {
//                     raaa = {processus : rowsProc[i].libProc, domaine: domaine};
//                 })
//             }
//             return i
//         }
//     )
// })

app.get('/skillsArray', (req, res) => {
    result = [];
    skillsDatabase.query(
        "Select numProc, libProc from processus",
        (err, rowsProc) => {  
            for (let p in rowsProc){
                proc = {processus : rowsProc[p].libProc};
                result.push(proc);
                skillsDatabase.query(
                    "Select processus.numProc, domaine.numDom, libDom from processus, domaine where domaine.numProc = processus.numProc and processus.numProc = " + rowsProc[p].numProc,
                    (err, rowsDom) => {
                        arrayDom = [];
                        for (let d in rowsDom){
                            dom = {domaine : rowsDom[d].libDom}
                            arrayDom.push(dom)
                            skillsDatabase.query(
                                "Select distinct processus.numProc, domaine.numDom, numAct, libAct from processus, domaine, activite where activite.numDom = domaine.numDom and activite.numProc = processus.numProc and processus.numProc = " + rowsProc[p].numProc + " and domaine.numDom = " + rowsDom[d].numDom,
                                (err, rowsAct) => {
                                    arrayAct = [];
                                    for (let a in rowsAct){
                                        act = rowsAct[a].libAct
                                        arrayAct.push(act)
                                    }
                                    result[p].domaine[d].activite = arrayAct
                                }
                            )
                        }
                        result[p].domaine = arrayDom
                    }
                )
            }
        }
    )
})


// app.get('/skillsArray', (req, res) => {
//     skillsDatabase.query(
//         "Select libProc, libDom, libAct from processus, domaine, activite where activite.numProc = processus.numProc and activite.numDom = domaine.numDom",
//         (err, data) => {           
//             (data) ? res.json({data}) : res.send({err: err});
//         }
//     )
// })


app.get('/projects', (req, res) => {
    skillsDatabase.query(
        "Select id, libelle from projet",
        (err, data) => {
            (data) ? res.json({ data }) : res.send({ err: err })
        }
    )
})

app.post('/skillsArray', (req, res) => {

})

// Port output config
app.listen(3003, () => {
    console.log("Running server => port 3003");
})