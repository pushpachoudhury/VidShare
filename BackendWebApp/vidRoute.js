const express = require('express');
const router = express.Router();
const fs = require('fs');

const usersFilePath = './users.json';


function authenticateUser(req, res, next) {
    const isLoggedIn = req.session && req.session.user; 
    if (isLoggedIn) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

router.get('/video/dashboard', authenticateUser, (req, res) => {
    res.render('dashboard');
});

router.get('/video/new_video', authenticateUser, (req, res) => {
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
module.exports = router;

function writeVideosToFile(videos) {
    try {
        fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 4));
    } catch (error) {
        console.error('Error writing to videos.json:', error);
    }
}

router.post('/video/new', (req, res) => {
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

router.get('/video/dashboard/:videofilter', authenticateUser, (req, res) => {
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
