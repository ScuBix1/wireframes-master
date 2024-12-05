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
      question: 'What is visual hierarchy primarily used for in design?',
      answers: [
        'To organize visual elements based on their importance.',
        'To increase the number of visual elements on a page.',
        'To create chaos and random placement of elements.',
        'To remove any form of structure.',
      ],
      correct: 'To organize visual elements based on their importance.',
    },
    {
      question:
        'Which element has the most impact on establishing visual hierarchy?',
      answers: ['Color', 'Contrast', 'Alignment', 'Grid systems'],
      correct: 'Contrast',
    },
    {
      question:
        'When applying visual hierarchy, which principle helps direct the viewer’s gaze?',
      answers: ['Rhythm', 'Focal point', 'Gradient maps', 'Repetition'],
      correct: 'Repetition',
    },
    {
      question:
        'Which of the following is NOT a principle of visual hierarchy?',
      answers: [
        'Scale and size',
        'Proximity',
        'Typographic weight',
        'Random alignment',
      ],
      correct: 'Proximity',
    },
    {
      question: 'How does whitespace affect visual hierarchy?',
      answers: [
        'It clutters the design.',
        'It emphasizes nearby elements.',
        'It removes contrast from the design.',
        'It prevents scalability.',
      ],
      correct: 'It emphasizes nearby elements.',
    },
  ],
  [
    {
      question: 'What is the main focus of interaction design?',
      answers: [
        'User behavior during interaction with a product.',
        'The visual appearance of a website.',
        'Data storage in applications.',
        'Physical product design.',
      ],
      correct: 'User behavior during interaction with a product.',
    },
    {
      question:
        'Which of the following is an example of interaction design in action?',
      answers: [
        'A static image',
        'A navigation menu that expands on hover',
        'Printed brochures',
        'Typography adjustments',
      ],
      correct: 'A navigation menu that expands on hover',
    },
    {
      question: 'Which term is closely associated with interaction design?',
      answers: ['Affordance', 'Serialization', 'Rasterization', 'Materiality'],
      correct: 'Affordance',
    },
    {
      question:
        'What is a key goal of microinteractions in interaction design?',
      answers: [
        'To frustrate users with unnecessary actions.',
        'To add fun, functionality, and feedback to user actions.',
        'To create non-functional designs.',
        'To eliminate all animations.',
      ],
      correct: 'To add fun, functionality, and feedback to user actions.',
    },
    {
      question:
        'Which of the following is the least effective practice in interaction design?',
      answers: [
        'Making feedback instantaneous',
        'Designing for consistency',
        'Overloading the user with options',
        'Providing clear affordances',
      ],
      correct: 'Overloading the user with options',
    },
  ],
  [
    {
      question: 'What does a low-fidelity wireframe focus on?',
      answers: [
        'Detailed typography and colors',
        'Basic structure and layout',
        'Finalized user interactions',
        'Marketing copy',
      ],
      correct: 'Basic structure and layout',
    },
    {
      question:
        'Which tool is most commonly used for creating high-fidelity wireframes?',
      answers: ['Adobe Photoshop', 'Microsoft Excel', 'Figma', 'Google Sheets'],
      correct: 'Figma',
    },
    {
      question: 'What is the main disadvantage of high-fidelity wireframes?',
      answers: [
        'They lack clarity in layout.',
        'They are quick to create.',
        'They can mislead stakeholders into thinking the design is finished.',
        'They don’t allow for user testing.',
      ],
      correct:
        'They can mislead stakeholders into thinking the design is finished.',
    },
    {
      question:
        'How does a mid-fidelity wireframe differ from a low-fidelity one?',
      answers: [
        'It introduces more detailed visuals and interactions.',
        'It replaces layouts with animations.',
        'It uses sketches instead of digital tools.',
        'It focuses only on typography.',
      ],
      correct: 'It introduces more detailed visuals and interactions.',
    },
    {
      question:
        'Why is it essential to choose the correct wireframe fidelity level?',
      answers: [
        'To impress clients with polished designs.',
        'To align the wireframe with the project’s stage and goals.',
        'To reduce the overall project budget.',
        'To avoid showing stakeholders any progress.',
      ],
      correct: 'To align the wireframe with the project’s stage and goals.',
    },
  ],
  [
    {
      question: 'What is the purpose of accessibility in design?',
      answers: [
        'To enhance design aesthetic.',
        'To make digital products usable for all, including people with disabilities.',
        'To optimize performance for high-end devices only.',
        'To reduce usability.',
      ],
      correct:
        'To make digital products usable for all, including people with disabilities.',
    },
    {
      question:
        "Which of these tools helps in checking a website's accessibility?",
      answers: [
        'Google Analytics',
        'Web Content Accessibility Guidelines (WCAG)',
        'Figma',
        'Axe Accessibility Tool',
      ],
      correct: 'Axe Accessibility Tool',
    },
    {
      question: 'What is the principle of POUR in accessibility?',
      answers: [
        'Presentation, Optimization, Uniformity, Readability',
        'Perceivable, Operable, Understandable, Robust',
        'Progressive, Open, Usable, Responsive',
        'None of the above',
      ],
      correct: 'Perceivable, Operable, Understandable, Robust',
    },
    {
      question: 'What does ARIA stand for in accessibility design?',
      answers: [
        'Accessible Rich Internet Applications',
        'Adaptive Responsive Interaction Access',
        'Automated Resource Integration API',
        'Alternate Readable Internet Application',
      ],
      correct: 'Accessible Rich Internet Applications',
    },
    {
      question: 'Which practice does NOT promote inclusion in design?',
      answers: [
        'Using universal design principles',
        'Offering captions for videos',
        'Designing primarily for a specific demographic',
        'Ensuring keyboard navigation works properly',
      ],
      correct: 'Designing primarily for a specific demographic',
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
  socket.on('submitAnswer', (username, subject, answer, roomId) => {
    let gagnant = 0;
    const currentQuestion = themes[subject][question];
    if (currentQuestion.correct == answer) {
      rooms[roomId - 1].players.map((player) => {
        if (player.username === username) {
          player.win = true;
          gagnant++;
        }
      });

      rooms.map((r) => {
        if (r.id === roomId) {
          r.players = [];
        }
      });
    }
    if (gagnant === 1) {
      io.emit('gameMessage', `${username} has won the token for the category `);
    }
  });
});
