const express = require('express');
const mysql = require('mysql')
const cors = require('cors')

const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "loginsystem"
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    db.query(
        "INSERT INTO user (username, password) values (?,?)",
        [username, password],
        (err, result) => {
            console.log(err);
        }
    )
    console.log(username, password);
})

app.get('/', (req, res)=>{
    res.send("Hello Word")
})

app.listen(3003, ()=>{
    console.log("Running server => port 3003");
})