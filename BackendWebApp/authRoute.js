const express = require('express');
const router = express.Router();
const fs = require('fs');

const usersFilePath = './users.json';

function readUsersFromFile() {
    try {
        const usersData = fs.readFileSync(usersFilePath);
        return JSON.parse(usersData);
    } catch (error) {
        return [];
    }
}

function writeUsersToFile(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4));
    } catch (error) {
        console.error('Error writing to users.json:', error);
    }
}

router.get('/auth/register', (req, res) => {
    res.render('register');
});

router.post('/auth/register', (req, res) => {
    const { email, name, password } = req.body;

    if (!email && !password && !name) {
        return res.render('register', { error: 'Please enter required fields' });
    }
    else if (!email) {
        return res.render('register', { error: 'Please enter your email' });
    }
    else if (!name) {
        return res.render('register', { error: 'Please enter your name' });
    }
    else if (!password) {
        return res.render('register', { error: 'Please enter your password' });
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

router.get('/auth/login', (req, res) => {
    res.render('login');
});

router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsersFromFile();
    const user = users.find(user => user.email === email);

    if (user && user.password === password) {
        req.session.user = user;
        res.redirect('/video/dashboard');
    } else {
        res.render('login', { error: 'Incorrect email or password. Please try again.' });
    }
});
module.exports = router;