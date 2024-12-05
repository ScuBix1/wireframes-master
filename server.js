require('dotenv').config(); 
const { Socket } = require('socket.io');
const express = require('express');
const app = express();
const http = require('http').createServer(app);

const apiRoutes = require('./routes/api');
/**
 * @type {Socket}
 */
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use('/', apiRoutes);
app.use(express.static('public'));

http.listen(PORT, () => {
  console.log(`Serveur lancé sur ${process.env.BASE_URL}:${PORT}`);
});
const question = Math.floor(Math.random() * 2);
let rooms = [];
const themes = [
  [
    {
      question: 'What is visual hierarchy?',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'A',
    },
    {
      question: 'Define contrast.',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'B',
    },
  ],
  [
    {
      question: 'What is a microinteraction?',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'C',
    },
    {
      question: 'Define UX design.',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'D',
    },
  ],
  [
    {
      question: 'What is low-fidelity wireframe?',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'A',
    },
    {
      question: 'Explain high-fidelity wireframe.',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'B',
    },
  ],
  [
    { question: 'What is WCAG?', answers: ['A', 'B', 'C', 'D'], correct: 'C' },
    {
      question: 'Define inclusive design.',
      answers: ['A', 'B', 'C', 'D'],
      correct: 'D',
    },
  ],
];

io.on('connect', (socket) => {
  socket.on('playerData', (player, roomId) => {
    if (rooms.length === 0) {
      player.role = 'admin';
      rooms.push({ id: roomId, players: [player] });
    } else {
      let cpt = 0;
      rooms.map((room) => {
        room.id === roomId ? cpt++ : cpt;
      });
      if (cpt === 0) {
        player.role = 'admin';
        rooms.push({ id: roomId, players: [player] });
      } else {
        rooms.map((room) => {
          if (room.id === roomId) {
            room.players.push(player);
          }
        });
      }
    }
    rooms.map((room) => {
      if (
        room.players.length >= 2 &&
        room.players.length <= 6 &&
        room.id === roomId
      ) {
        io.to(room.id).emit('startSpin', room.players);
      }
    });
  });

  socket.on('getPlayersRoomById', (idRoom) => {
    if (rooms.length > 0) {
      rooms.map((room) => {
        if (room.id == idRoom) {
          io.emit('listPlayers', room.players);
        }
      });
    }
  });

  socket.on('spinWheel', () => {
    const choiceTopic = Math.floor(Math.random() * 4);
    io.emit('updateWheel', { angle: choiceTopic * 90 + 1440 }, choiceTopic);
  });
  socket.on('selectQuestion', (roomId, username, subject) => {
    
    io.emit('sendQuestion', themes[subject][question]);
  });
  socket.on('submitAnswer', ( username, subject, answer ) => {
      const currentQuestion = themes[subject][question];
      console.log(currentQuestion)
      if (currentQuestion.correct === answer) {
        io.emit('gameMessage', `${username} a gagné`);
      }
  });
});
