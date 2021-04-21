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
app.use(bodyParser.urlencoded({extended: true}))

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
    database: "basecompetencessio"
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
                result ? res.send({message: "Bienvenue " + username + " ! Votre compte a bien été créé !"}) : res.send({err: err});
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
            err ? res.send({err: err}) : null;
            result.length > 0 ? bcrypt.compare(password, result[0].password, (error, response) => {
                if (response) {
                    req.session.user = result
                    res.send({message: "Bienvenue " + username + " !"})
                } else {
                    res.send({messageErr: "Erreur : Utilisateur ou mot de passe invalide !"})
                }
            }) : res.send({messageErr: "Erreur : Utilisateur non reconnu !"});
        }
    )
})

app.post('/logout', (req, res) => {
    if (req.session.user) {
        res.clearCookie('userId');
        req.session.destroy();
        res.send({loggedIn: false, message: "Vous être bien déconnecté. A bientôt !"})
    } else {
        res.send({message: "Erreur : Veuillez essayer de vous reconnecter !"})
    }
})

app.get('/login', (req, res) => {
    req.session.user ? res.send({loggedIn: true, user: req.session.user}) : res.send({loggedIn: false})
})


// SkillsArray
app.get('/SkillsArray', async(req, res) => {
    skillsDatabase.query(
        "Select libProc, libDom, libAct from processus, domaine, activite where activite.numProc = processus.numProc and activite.numDom = domaine.numDom",
        (err, data) => {
            (data) ? res.json({data}) : res.send({err: err});
        }
    )
})


// Port output config
app.listen(3003, ()=>{
    console.log("Running server => port 3003");
})