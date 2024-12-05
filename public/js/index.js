const topics = [
  'visual-hierarchy',
  'interaction-design',
  'wireframe-fidelity',
  'accessibility-inclusion',
];

const roomNumber = window.location.href.split('/')[3];

const socket = io();

const baseUrl = 'http://10.26.133.125:3000';

if (document.getElementById('saveUsername')) {
  const usernameForm = document.getElementById('saveUsername');
  if (document.getElementById('username')) {
    const username = document.getElementById('username');
    usernameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      player = {
        role: 'player',
        username: username.value,
        socketId: socket.id,
        roomId: roomNumber,
        win: false,
      };
      socket.emit('playerData', player, roomNumber);
      window.location.href = `${baseUrl}/${roomNumber}/${player.username}/${player.role}`;
    });
  }
}

if (document.getElementById('players')) {
  const playersList = document.getElementById('players');
  socket.emit('getPlayersRoomById', roomNumber);
  socket.on('listPlayers', (players) => {
    let html = '';
    players.map((player) => {
      html += `<li>${player.username}</li>`;
    });
    playersList.innerHTML = html;
  });
}

if (document.getElementById('spinButton')) {
  const spinButton = document.getElementById('spinButton');
  player = {
    role: 'player',
    username: window.location.href.split('/')[4],
    socketId: socket.id,
    roomId: roomNumber,
    win: false,
  };
  spinButton.addEventListener('click', () => {
    socket.emit('spinWheel');
  });
  socket.on('updateWheel', (data, choiceTopic) => {
    const { angle } = data;
    const wheel = document.getElementById('wheel');
    if (wheel) {
      wheel.style.transform = `rotate(${angle}deg)`;
    }
    setTimeout(() => {
      window.location.href = `${baseUrl}/${roomNumber}/${player.username}/${player.role}/${choiceTopic}`;
    }, 6500);
  });
}

if (document.getElementById('form-container')) {
  socket.emit(
    'selectQuestion',
    window.location.href.split('/')[3],
    window.location.href.split('/')[4],
    window.location.href.split('/')[6]
  );
  socket.on('sendQuestion', (question) => {
    const container = document.getElementById('form-container');
    container.innerHTML = '';
    const questionElement = document.createElement('h3');
    questionElement.textContent = question.question;
    container.appendChild(questionElement);
    const form = document.createElement('form');
    form.id = 'quiz-form';
    question.answers.forEach((answer, index) => {
      const div = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'answer';
      checkbox.value = answer;
      checkbox.id = `answer${index}`;

      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = answer;

      div.appendChild(checkbox);
      div.appendChild(label);
      form.appendChild(div);

      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          const checkboxes = form.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach((otherCheckbox) => {
            if (otherCheckbox !== e.target) {
              otherCheckbox.checked = false;
            }
          });
        }
      });
    });
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.id = 'submitButton'
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      const checkboxes = form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          socket.emit(
            'submitAnswer',
            window.location.href.split('/')[4],
            window.location.href.split('/')[6],
            checkbox.value,
            roomNumber
          );
        }
      });
    });
    form.appendChild(submitButton);
    container.appendChild(form);
    socket.on('gameMessage', (message) => {
      container.innerHTML = '';
      container.style.display = 'none';
      document.getElementById('winner').innerHTML = `<p>${message}</p>`;
    });
  });
}
