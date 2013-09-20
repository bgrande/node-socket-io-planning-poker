/**
 * Scrum poker app with nodejs
 *
 * @category  [[category]]
 * @copyright [[Copyright]]
 * @author    Benedikt Grande <benedikt.grande@mayflower.de>
 * @author    Diana Hartmann <diana.hartmann@mayflower.de>
 */

var port, app, server, io, storage, helpers;

port    = process.env.PORT || 3000;
app     = require('express')();
server  = require('http').createServer(app);
io      = require('socket.io').listen(server);
helpers = require('./helpers');
storage = require('./storage');

// switch to xhr polling for heroku and disable debug output
if ('production' === process.env.NODE_ENV) {
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
        io.set('log level', 1);
    });
}

server.listen(port);

console.log('Server running at port ' + port);

// @todo routes will be separated into own module
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/:subdir/:subsubdir/:name', function(req, res) {
    var name = req.params.name;
    var subdir = req.params.subdir;
    var subsubdir = req.params.subsubdir;

    res.sendfile(__dirname + '/public/' + subdir + '/' + subsubdir + '/' + name);
});

app.get('/:subdir/:name', function(req, res) {
    var name = req.params.name;
    var subdir = req.params.subdir;

    res.sendfile(__dirname + '/public/' + subdir + '/' + name);
});

// @todo socket handling will be exported into own module
// initialize connection for socketio
io.sockets.on('connection', function(socket) {
    'use strict';
    var userId = socket.id;

    if (null === storage.getAdmin()) {
        storage.setAdmin(userId);
        console.log('initial admin: ' + userId);
    }

    // set first user as desk admin
    if (0 == storage.desks.length) {
        storage.desks[0] = {};
        storage.desks[0].cards = [];        
    }

    // send initial userlist
    socket.on('username', function(data) {
        var username = data,
            oldUserId = null,
            cardValue = null; 
        
        if ('object' == typeof data) {
            if (null !== data.userId) {
                oldUserId = data.userId;
            }
            username = data.username;
        } 

        // if we got a new userId update the user and kill the old one!
        if (oldUserId !== userId && helpers.isSet(storage.users[oldUserId])) {
            var desk = storage.desks.length - 1,
                card = storage.desks[desk].cards[oldUserId];
            
            delete storage.users[oldUserId];
            
            if (storage.getAdmin() === oldUserId) {
                console.log('old admin: ' + oldUserId);
                storage.setAdmin(userId);
                console.log('admin: ' + userId);
            }
            
            if (undefined !== card && undefined !== card.value) {
                cardValue = card.value;
                delete storage.desks[desk].cards[oldUserId];
                storage.desks[desk].cards[userId] = {};
                storage.desks[desk].cards[userId].value = cardValue;
            }
        }
    
        if (!storage.checkUsername(username)) {
            //noinspection JSUnusedAssignment
            data += '2';
        }
        storage.updateUsername(username, userId);
        
        if (null !== cardValue) {
            storage.users[userId].cardValue = cardValue;
        }

        var userList = storage.getUsers(userId);

        console.log('admin: ' + storage.isAdmin(userId));
        socket.emit('users', {
            'userId': userId,
            'users': userList,
            'admin': storage.isAdmin(userId)
        });
        socket.broadcast.emit('users', userList)
    });

    socket.on('isOpen', function(data) {
        var response = false;
        if (helpers.isSet(data) && true === storage.isOpen) {
            response = data;
        }
        socket.emit('isOpenSuccess', response);
    });

    socket.on('setCard', function(data) {
        var deskCount = storage.desks.length;        
        
        if (!storage.checkCardValue(data)) {
            socket.emit('sendCard', false);
            return;
        }
        
        if (!storage.desks[deskCount - 1].cards[userId]) {
            storage.desks[deskCount -1].cards[userId] = {};
        }
        
        storage.desks[deskCount -1].cards[userId].value = data;
        storage.users[userId].cardValue = data;
        
        socket.broadcast.emit('sendCard', {
            'username': storage.users[userId].username,
            'cardValue': '...'
        });
        
        socket.emit('sendCard', data);

        var closedDesk;
        if (storage.checkIfAllCardsSet(deskCount)) {
            var cardValues = storage.getCardValuesByUsername(storage.desks[deskCount - 1].cards);
            storage.isOpen = false;
            closedDesk = {
                'desk': deskCount,
                'cards': cardValues
            };
            socket.emit('closeDesk', closedDesk);
            socket.broadcast.emit('closeDesk', closedDesk);
        }
    });

    socket.on('changeUsername', function(data) {
        if (!helpers.isSet(data)) {
            socket.emit('users', {
                'error': 'username not allowed!'
            });
            return;
        }
        
        if (!storage.checkUsername(data)) {
            socket.emit('users', {
                'error': 'username already in use!'
            });            
            return;
        } 
        
        storage.updateUsername(data, userId);      
        var userList = storage.getUsers(userId);
        
        socket.emit('users', {
            'userId': userId,
            'users': userList
        });
        socket.broadcast.emit('users', userList);
    });

    socket.on('addTicket', function (data) {
        storage.addTicket(data);
        socket.emit('changedTickets', storage.getTickets());
        socket.broadcast.emit('changedTickets', storage.getTickets());
    });

    socket.on('disconnect', function (data) {
        // storage.removeUser(userId);
        // @todo remove specific user from storage only if session timed out!
    });

    // disconnect and remove user
    // add table
    // start game
    // end game
    // manage users
    // allow visitor
    // edit/add title/name
});

