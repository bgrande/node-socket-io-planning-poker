/**
 * Scrum poker app with nodejs
 *
 * @category  [[category]]
 * @copyright [[Copyright]]
 * @author    Benedikt Grande <benedikt.grande@mayflower.de>
 * @author    Diana Hartmann <diana.hartmann@mayflower.de>
 */

var port = 3000,
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    storage = {
        'admin': null,
        'isOpen': true,
        'users': [],
        'desks': [],
        'allowedCardValues': [
            0, '1/2', 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'
        ]
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

// @todo socket handling will be exported into own module
// initialize connection for socketio
io.sockets.on('connection', function(socket) {
    var userId = socket.id;

    // @todo use userId to check if connecting user has already been connected

    // set first user as desk admin
    if (0 === storage.desks.length) {
        storage.admin = userId;
        storage.desks[0] = {};
        storage.desks[0].cards = [];
        if (!storage.desks[0].cards[userId]) {
            storage.desks[0].cards[userId] = {
            };
        }
    }

    // send initial userlist
    socket.on('username', function(data) {
        // @todo check username and change it if already in use
        if (!checkUsername(data)) {
            data = data + '2';
        }
        updateUsername(data, userId);
        socket.emit('users', {
            'userId': userId,
            'users': getUsers(userId)
        });
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
        
        if (!checkCardValue(data)) {
            socket.emit('sendCard', false);
            return;
        }
        
        if (!storage.desks[deskCount - 1].cards[userId]) {
            storage.desks[deskCount -1].cards[userId] = {                
            };
        }
        
        storage.desks[deskCount -1].cards[userId].value = data;
        storage.users[userId].cardValue = data;
        
        socket.broadcast.emit('sendCard', {
            'username': storage.users[userId].username,
            'cardValue': '...'
        });
        
        socket.emit('sendCard', data);

        if (checkIfAllCardsSet(deskCount)) {
            var cardValues = getCardValuesByUsername(storage.desks[deskCount - 1].cards);
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
        if (!checkUsername(data)) {
            socket.emit('users', {
                'error': 'username already in use!'
            });            
            return;
        } 
        
        updateUsername(data, userId);        
        socket.emit('users', {
            'userId': userId,
            'users': getUsers(userId)
        });
        socket.broadcast.emit('users', getUsers(userId));
    });

    socket.on('disconnect', function (data) {
        // remove specific user!
    });

    // disconnect and remove user
    // add table
    // start game
    // end game
    // manage users
    // allow visitor
    // edit/add title/name
});


// @todo these functions should be part of a (helper) module
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
        userList.users[i].admin = storage.users[x].admin;
        
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
            storage.users[id].admin = true;
        }
        storage.users[id].username = data;
    }
}

function checkCardValue(data) {
    for (var i = 0; i < storage.allowedCardValues.length; i++) {
        if (data == storage.allowedCardValues[i]) {
            return true;
        }
    }
    return false;
}

function getCardValuesByUsername(cards) {
    var cardList = {};
    
    for (x in cards) {
        name = storage.users[x].username;
        cardList[name] = cards[x];
    }
    
    return cardList;
}

function checkIfAllCardsSet(deskCount) {
    var cardCount = 0,
        userCount = 0,
        users = storage.users,
        cards = storage.desks[deskCount - 1].cards;
        
    userCount = countObject(users);
    cardCount = countObject(cards);
console.log('users: ' + userCount + ', cards: ' + cardCount);
    if (userCount === cardCount) {
        return true;
    }
    return false;
}

/**
 * helper function to count object lists
 *
 * @param object
 * @returns {number}
 */
function countObject(object) {
    var count = 0;
    for (x in object) {
        count++;
    }
    return count;
}

function checkUsername(data) {
    for (x in storage.users) {
        if (data == storage.users[x].username) {
            return false;
        }
    }
    return true;
}
