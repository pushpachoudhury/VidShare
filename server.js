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

function writeUsersToFile(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4));
    } catch (error) {
        console.error('Error writing to users.json:', error);
    }
}

app.get('/api', (req, res) => {
    res.send('Hello from the API!');
});

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/auth/register', (req, res) => {
    res.render('register');
});

app.post('/auth/register', (req, res) => {
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
        res.render('login', { error: 'Incorrect email or password. Please try again.' });
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

app.get('/video/new_video', authenticateUser, (req, res) => {
    res.render('shareVid');
});

const videosFilePath = './videos.json';

function readVideosFromFile() {
    try {
        const videosData = fs.readFileSync(videosFilePath);
        return JSON.parse(videosData);
    } catch (error) {
        return [];
    }
}

function writeVideosToFile(videos) {
    try {
        fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 4));
    } catch (error) {
        console.error('Error writing to videos.json:', error);
    }
}

app.post('/video/new', (req, res) => {
    const isLoggedIn = req.session && req.session.user; 
    if (!isLoggedIn) {
        return res.redirect('/auth/login');
    }
    
    const { videoURL, title } = req.body;

    if (!videoURL || !title) {
        return res.render('shareVid', { error: 'Video URL and title are required' });
    }

    const currentUserEmail = req.session.user.email;

    const newVideo = { videoURL, title, owner: currentUserEmail };

    const existingVideos = readVideosFromFile();

    existingVideos.push(newVideo);

    writeVideosToFile(existingVideos);

    res.render('shareVid', { success: 'Video added successfully, you may add more videos.' });
});

app.get('/video/dashboard/:videofilter', authenticateUser, (req, res) => {
    const videofilter = req.params.videofilter;

    const existingVideos = readVideosFromFile();


    let filteredVideos = existingVideos;
    if (videofilter === 'mine') {
        const currentUserEmail = req.session.user.email;
        filteredVideos = existingVideos.filter(video => video.owner === currentUserEmail);
    } else if (videofilter === 'all') { 
        
    }

    res.render('vidDashboard', { videos: filteredVideos, videofilter });
});



app.listen(3000, function(){
    console.log("Running on port 3000!")
})
