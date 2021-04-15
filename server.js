const express = require('express');
const mysql = require('mysql')

const app = express();

app.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "LoginSystem"
})

app.get('/', (req, res)=>{
    res.send("Hello Word")
})

app.listen(3003, ()=>{
    console.log("Running server => port 3003");
})