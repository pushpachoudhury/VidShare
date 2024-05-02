const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const fs = require('fs'); 
const app = express(); 
const pug = require('pug');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'WebAppDev2024', 
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'pug');
app.use(express.static('views'));

const vidRoute = require('./vidRoute');
const authRoute = require('./authRoute');


const usersFilePath = './users.json';

app.get('/', (req, res) => {
    res.render('main');
});

app.use('/', authRoute);
app.use('/', vidRoute);

app.listen(3000, function(){
    console.log("Running on port 3000!")
});
