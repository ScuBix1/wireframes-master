const { getRandomElement } = require('../../utils/random');
const rooms = {};

module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('joinRoom', ({ roomId, authorName, role }) => {
            if (!rooms[roomId]) {
                rooms[roomId] = { players: [], admin: null, spinning: false };
            }

            const room = rooms[roomId];
            if (room.players.length >= 6) {
                socket.emit('error', 'La room est pleine.');
                return;
            }

            room.players.push({ id: socket.id, name: authorName, role });

            if (!room.admin) {
                room.admin = socket.id;
            }

            socket.join(roomId);
            io.to(roomId).emit('updatePlayers', room.players);

            if (room.admin === socket.id) {
                socket.emit('admin', "Vous êtes l'admin de la room.");
            }
        });

        socket.on('spinWheel', (roomId) => {
            const room = rooms[roomId];
            if (!room) {
                socket.emit('error', "Room introuvable.");
                return;
            }

            if (room.admin !== socket.id) {
                socket.emit('error', "Seul l'admin peut lancer la roue.");
                return;
            }

            if (room.spinning) {
                socket.emit('error', 'La roue est déjà en train de tourner.');
                return;
            }

            room.spinning = true;

            const randomWinner = getRandomElement(room.players);
            io.to(roomId).emit('wheelResult', randomWinner);

            setTimeout(() => {
                room.spinning = false;
            }, 5000);
        });

        socket.on('disconnect', () => {
            for (const [roomId, room] of Object.entries(rooms)) {
                room.players = room.players.filter(player => player.id !== socket.id);

                if (room.admin === socket.id && room.players.length > 0) {
                    room.admin = room.players[0].id;
                    io.to(roomId).emit('admin', `Le nouvel admin est ${room.players[0].name}`);
                }

                io.to(roomId).emit('updatePlayers', room.players);
                if (room.players.length === 0) {
                    delete rooms[roomId];
                }
            }
        });
    });
};
