/**
 * Scrum poker app with nodejs
 *
 * @category  [[category]]
 * @copyright [[Copyright]]
 * @author    Benedikt Grande <benedikt.grande@mayflower.de>
 */

var port = 3000,
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    storage = {
        'admin': null,
        'isOpen': true,
        'users': [],
        'desks': []
    };

server.listen(port);

console.log('Server running at port ' + port);

// @todo routes will be separated into own module
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/:subdir/:name', function(req, res) {
    var name = req.params.name;
    var subdir = req.params.subdir;
    res.sendfile(__dirname + '/public/' + subdir + '/' + name);
});

// initialize connection for socketio
io.sockets.on('connection', function(socket) {
    var userId = socket.id,
        deskCount = storage.desks.length;

    // set first user as desk admin
    if (0 == deskCount) {
        storage.admin = userId;
        storage.desks[0] = {};
        storage.desks[0].cards = [];
        if (!storage.desks[0].cards[userId]) {
            storage.desks[0].cards[userId] = {
                'value': false
            };
        }
    }

    // send initial userlist
    socket.on('username', function(data) {
        updateUsername(data, userId);
        socket.emit('users', getUsers(userId));
        socket.broadcast.emit('users', getUsers(userId))
    });

    socket.on('isOpen', function(data) {
        var response = false;
        if (undefined !== data && null !== data && true === storage.isOpen) {
            response = data;
        }
        socket.emit('isOpenSuccess', response);
    });

    socket.on('setCard', function(data) {
        var deskCount = storage.desks.length;
        if (!storage.desks[deskCount - 1].cards[userId]) {
            storage.desks[deskCount -1].cards[userId] = {
                'value': false
            };
        }
        storage.desks[deskCount -1].cards[userId].value = data;
        storage.users[userId].cardValue = data;
        
        socket.broadcast.emit('sendCard', {
            'username': storage.users[userId].username,
            'cardValue': '...'
        });
        socket.emit('sendCard', data);
        // check if all cards are set: if true: close desk and open cards
    });

    socket.on('changeUsername', function(data) {
        updateUsername(data, userId);
        socket.emit('users', getUsers(userId));
        socket.broadcast.emit('users', getUsers(userId));
    });

    socket.on('disconnect', function (data) {
        // remove specific user!
    });

    // connect and add user
    // disconnect and remove user
    // add table
    // start game
    // end game
    // auto open table
    // manage users
    // allow visitor
    // edit/add title/name
});

function getUsers(userId) {
    var userList = {
            'users': []
        },
        i = 0;

    for (x in storage.users) {
        if (!userList.users[i]) {
            userList.users[i] = {};
        }

        userList.users[i].username = storage.users[x].username;
        
        if (undefined !== storage.users[x].cardValue && null !== storage.users[x].cardValue) {
            userList.users[i].cardValue = '...';
        }

        if (userId === x || false === storage.isOpen) {       
            userList.users[i].cardValue = storage.users[x].cardValue;
        }
        i++;
    }

    return userList;
}

function updateUsername(data, id) {
    if ('string' == typeof data) {
        if (!storage.users[id]) {
            storage.users[id] = {};
        }
        storage.users[id].username = data;
    }
}
