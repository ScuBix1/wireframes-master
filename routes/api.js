const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/:roomId', (req, res) => {
    const {roomId} = req.params
    const regex = /^[0-9]+$/
    if(roomId && regex.test(roomId)){
        res.sendFile(path.join(__dirname, '../templates/index.html'));
    }else{
        res.status(400).json({message: "This room does not exist ! "})
    }
});

router.get('/:roomId/:username/:role', (req, res) => {
    const { roomId, username, role } = req.params;
    res.sendFile(path.join(__dirname, '../templates/wheel.html'));
});

router.get('/:roomId/:username/:role/:subject', (req, res) => {
    const { roomId, subject } = req.params;
    const roomRegex = /^[0-9]+$/;
    const subjectRegex = /^[0-9]+$/;

    if (roomRegex.test(roomId) && subjectRegex.test(subject)) {
        res.sendFile(path.join(__dirname, '../templates/quizz.html'));
    } else {
        res.status(400).json({ message: "Invalid room ID or subject!" });
    }
});

module.exports = router;
