/**
 * Scrum poker app with nodejs
 *
 * @category  [[category]]
 * @copyright [[Copyright]]
 * @author    Benedikt Grande <benedikt.grande@mayflower.de>
 * @author    Diana Hartmann <diana.hartmann@mayflower.de>
 */

var port, app, server, io, storage, helpers;

port   = process.env.PORT || 3000;
app    = require('express')();
server = require('http').createServer(app);
io     = require('socket.io').listen(server);

/* @todo move objects into own module */
helpers = {
    /**
     * helper function to count object lists
     *
     * @param object object
     *
     * @returns int
     */
    'countObject': function(object) {
        var count = 0;
        for (x in object) {
            count++;
        }
        return count;
    },

    /**
     * @TODO move into helper used by server and frontend app parts
     *
     * @param variable
     *
     * @returns boolean
     */
    'isSet': function(variable) {
        return !(null === variable || undefined === variable || "" === variable);
    }
};

storage = {
    'admin': null,
    'isOpen': true,
    'users': {},
    'desks': [],
    'allowedCardValues': [
        0, '1/2', 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'
    ],
    'helper': null,
    /**
     * function to map list of userId identified uers to array
     *
     * @param userId string
     *
     * @returns array
     */
    'getUsers': function (userId) {
        var userList = {
                'users': []
            },
            i = 0;

        for (x in this.users) {
            if (!helpers.isSet(userList.users[i])) {
                userList.users[i] = {};
            }

            userList.users[i].username = this.users[x].username;
            userList.users[i].admin = this.users[x].admin;

            if (helpers.isSet(this.users[x].cardValue)) {
                userList.users[i].cardValue = '...';
            }

            if (userId === x || false === this.isOpen) {
                userList.users[i].cardValue = this.users[x].cardValue;
            }
            i++;
        }

        return userList;
    },
    /**
     * function to update the username
     *
     * @param data string
     * @param id string
     *
     * @returns void
     */
    'updateUsername': function (data, id) {
        if ('string' == typeof data) {
            if (!this.users[id]) {
                this.users[id] = {};
            }
            this.users[id].username = data;
        }
    },
    /**
     * function to map cardValues from userIds to usernames
     *
     * @param cards object
     *
     * @returns object
     */
    'getCardValuesByUsername': function (cards) {
        var cardList = {};
    
        for (x in cards) {
            if (this.users[x]) {
                var name = this.users[x].username;
                cardList[name] = cards[x];
            }
        }
    
        return cardList;
    },
    /**
     * helper function to check if card value is allowed
     *
     * @param data string
     *
     * @returns bool
     */
    'checkCardValue': function (data) {
        for (var i = 0; i < this.allowedCardValues.length; i++) {
            if (data == this.allowedCardValues[i]) {
                return true;
            }
        }
        return false;
    },
    /**
     * helper function to check if all cards are already set
     *
     * @param deskCount int
     *
     * @returns bool
     */
    'checkIfAllCardsSet': function (deskCount) {
        var cardCount, userCount, users, cards;
        
        cardCount = userCount = 0;
        users = this.users;
        cards = this.desks[deskCount - 1].cards;
        
        userCount = helpers.countObject(users);
        cardCount = helpers.countObject(cards);
        
        return userCount === cardCount;
    },
    /**
     * helper function to check if username is already set
     *
     * @param data string
     *
     * @returns bool
     */
    'checkUsername': function (data) {
        for (x in this.users) {
            if (data == this.users[x].username) {
                return false;
            }
        }
        return true;
    },
    'setAdmin': function(userId) {
        if (helpers.isSet(userId)) {
            this.admin = userId;
        }
    },
    'getAdmin': function() {
        return this.admin;  
    }    
};

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
    var userId = socket.id;
    
    // set first user as desk admin
    if (0 == storage.desks.length) {
        storage.admin = userId;
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
            
            if (storage.admin === oldUserId) {
                storage.admin = userId;
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
        
        socket.emit('users', {
            'userId': userId,
            'users': userList
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

    socket.on('disconnect', function (data) {
console.log('disconnect:', data);        
        // @todo remove specific user from storage!
    });

    // disconnect and remove user
    // add table
    // start game
    // end game
    // manage users
    // allow visitor
    // edit/add title/name
});

