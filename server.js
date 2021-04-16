const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// Init Bcryot (Encryption package)
const bcrypt = require('bcrypt')
const salt = 10

// Init const express
const app = express();


app.use(express.json());
app.use(cors());


// DataBase connection
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "loginsystem"
})


// Register
app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password, salt, (err, hash) => {
        db.query(
            "INSERT INTO user (username, password) VALUES (?,?)",
            [username, hash],
            (err, result) => {
                err ? res.send({err: err}) : null;
                result ? res.send({message: "Vous êtes bien enregistré"}) : null;
            }
        )
    })
})


//Login
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    db.query(
        "SELECT username, password FROM user WHERE username = ?;",
        username,
        (err, result) => {
            err ? res.send({err: err}) : null;
            result.length > 0 ? bcrypt.compare(password, result[0].password, (error, response) => {
                response ? res.send(result) : res.send({message: "Login ou mot de passe invalide !"})
            }) : res.send({message: "Utilisateur non connu !"});
        }
    )
})


// Port output config
app.listen(3003, ()=>{
    console.log("Running server => port 3003");
})