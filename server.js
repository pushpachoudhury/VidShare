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


const usersFilePath = './users.json';


function readUsersFromFile() {
    try {
        const usersData = fs.readFileSync(usersFilePath);
        return JSON.parse(usersData);
    } catch (error) {
        return [];
    }
}

// Function to write users to JSON file
function writeUsersToFile(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4));
    } catch (error) {
        console.error('Error writing to users.json:', error);
    }
}


app.get('/', (req, res) => {
    res.render('main');
});

app.get('/auth/register', (req, res) => {
    res.render('register');
});


app.post('/auth/register', (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.render('register', { error: 'All fields are required' });
    }


    const users = readUsersFromFile();


    const isEmailTaken = users.some(user => user.email === email);
    if (isEmailTaken) {
        return res.render('register', { error: 'Email is already registered' });
    }
    users.push({ email, name, password });
    writeUsersToFile(users);
    res.redirect('/auth/login');
});

app.get('/auth/login', (req, res) => {
    res.render('login');
});


app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

  
    const users = readUsersFromFile();

   
    const user = users.find(user => user.email === email);

    if (user && user.password === password) {
     
        req.session.user = user;
        

        res.redirect('/video/dashboard');
    } else {

        res.render('login', { error: 'Invalid email or password. Please try again.' });
    }
});


function authenticateUser(req, res, next) {
    const isLoggedIn = req.session && req.session.user; 
    if (isLoggedIn) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}


app.get('/video/dashboard', authenticateUser, (req, res) => {
    res.render('dashboard');
});

app.get('/video/new_video', (req, res) => {
    res.render('shareVid');
});

app.post('/auth/register', (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.render('register', { error: 'All fields are required' });
    }


    const users = readUsersFromFile();


    const isEmailTaken = users.some(user => user.email === email);
    if (isEmailTaken) {
        return res.render('register', { error: 'Email is already registered' });
    }

    users.push({ email, name, password });

    writeUsersToFile(users);

    res.render('register', { success: 'Account created successfully. Please login.' });
});

app.listen(3000);
