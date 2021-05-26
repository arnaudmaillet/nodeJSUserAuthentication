const express = require('express');
const mysql = require('mysql');
const cors = require('cors');


const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

// Init const express
const app = express();


app.use(express.json());
app.use(cors({
    origin: ["http://monsite80.fr/"],
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
        expires: 60 * 60 * 24 * 1000
    }
}))

// loginsystem DataBase connection
const loginsystemDatabase = mysql.createConnection({
    user: "newuser",
    host: "localhost",
    password: "password",
    database: "loginsystem"
})

// Skills DataBase connection
const skillsDatabase = mysql.createConnection({
    user: "newuser",
    host: "localhost",
    password: "password",
    database: "basecompetencessio"
})

if (loginsystemDatabase.connect((err) => {
    if (err) throw err
}))

if (skillsDatabase.connect((err) => {
    if (err) throw err
}))

// Register
app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    loginsystemDatabase.query(
        "INSERT INTO user (username, password) VALUES (?,?)",
        [username, password],
        (err, result) => {
            result ? res.send({ message: "Bienvenue " + username + " ! Votre compte a bien été créé !" }) : res.send({ err: err });
        }
    )
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
            if (result.length > 0){
                if (result[0].password === password){
                    req.session.user = result
                    res.send({ message: "Bienvenue " + username + " !" })
                } else {
                    res.send({ messageErr: "Erreur : Utilisateur ou mot de passe invalide !" })
                }
            } else {
                res.send({ messageErr: "Erreur : Utilisateur non reconnu !" });
            }
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


// result = [];
// app.get('/skillsArray', (req, res) => {
//     skillsDatabase.query(
//         "Select numProc, libProc from processus",
//         (err, rowsProc) => {  
//             for (let p in rowsProc){
//                 proc = {processus : rowsProc[p].libProc};
//                 result.push(proc);
//                 skillsDatabase.query(
//                     "Select processus.numProc, domaine.numDom, libDom from processus, domaine where domaine.numProc = processus.numProc and processus.numProc = " + rowsProc[p].numProc,
//                     (err, rowsDom) => {
//                         arrayDom = [];
//                         for (let d in rowsDom){
//                             dom = {domaine : rowsDom[d].libDom}
//                             arrayDom.push(dom)
//                             skillsDatabase.query(
//                                 "Select distinct processus.numProc, domaine.numDom, numAct, libAct from processus, domaine, activite where activite.numDom = domaine.numDom and activite.numProc = processus.numProc and processus.numProc = " + rowsProc[p].numProc + " and domaine.numDom = " + rowsDom[d].numDom,
//                                 (err, rowsAct) => {
//                                     arrayAct = [];
//                                     for (let a in rowsAct){
//                                         act = rowsAct[a].libAct
//                                         arrayAct.push(act)
//                                     }
//                                     result[p].domaine[d].activite = arrayAct
//                                 }
//                             )
//                         }
//                         result[p].domaine = arrayDom
//                     }
//                 )
//             }
//         }
//     )
// })



app.get('/skillsArray', (req, res) => {
    skillsDatabase.query(
        'Select processus.numProc, processus.libProc, domaine.numDom, domaine.libDom, activite.numAct, activite.libAct, competence.numComp, competence.libComp from processus, domaine, activite, competence where processus.numProc = domaine.numProc and processus.numProc = activite.numProc and processus.numProc = competence.numProc and domaine.numDom = activite.numDom and domaine.numDom = competence.numDom and activite.numAct = competence.numAct;',
        (err, data) => {           
            (data) ? res.json({data}) : res.send({err: err});
        }
    )
})


app.get('/projects', (req, res) => {
    skillsDatabase.query(
        "Select id, libelle from projet",
        (err, data) => {
            (data) ? res.json({ data }) : res.send({ err: err })
        }
    )
})

app.get('/estValide', (req, res) => {
    skillsDatabase.query(
        "Select numProc, numDom, numAct, numComp, idProjet, libelle from estvalide, projet where estvalide.idProjet = projet.id",
        (err, data) => {
            (data) ? res.json({ data }) : res.send({ err: err })
        }
    )
})

app.post('/setSkills', (req, res) => {
    let array = [];
    req.body.skills.map((skill) => (
        val = [skill.numProc, skill.numDom, skill.numAct, skill.numComp, skill.idProjet],
        array.push(val)
    ))
    
    skillsDatabase.query(
        "TRUNCATE TABLE estvalide",
        (err, result) => {
            result ? 
            skillsDatabase.query(
                "INSERT INTO estvalide (numProc, numDom, numAct, numComp, idProjet) VALUES ?", [array],
                (err, result) => {
                    result ? res.send({ message: "Données enregistrées" }) : res.send({err})
                }
            )
            :
            res.send({err})
        }
    )
})

// Port output config
app.listen(3003, () => {
    console.log("Running server => port 3003");
})