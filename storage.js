'use strict';

var helpers = require('./helpers');

module.exports = {
    'admin': null,
    'isOpen': true,
    'users': {},
    'tables': [],
    'allowedCardValues': [
        0, '1/2', 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'
    ],
    'helper': null,
    'tickets': [],
    /**
     * function to map list of userId identified uers to array
     *
     * @param userId string
     *
     * @returns {users: Array}
     */
    'getUsers': function (userId) {
        var userList = {
                'users': []
            },
            x,
            i = 0;

        for (x in this.users) {
            if (this.users.hasOwnProperty(x) && !helpers.isSet(userList.users[i])) {
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
        var cardList = {},
            x;

        for (x in cards) {
            if (this.users.hasOwnProperty(x)) {
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
     * @param tableCount int
     *
     * @returns bool
     */
    'checkIfAllCardsSet': function (tableCount) {
        var cardCount, userCount, users, cards;

        cardCount = userCount = 0;
        users = this.users;
        cards = this.tables[tableCount - 1].cards;

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
        var x;

        for (x in this.users) {
            if (!this.users.hasOwnProperty(x) || data == this.users[x].username) {
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
    },
    'isAdmin': function(id) {
        return id === this.getAdmin();
    },
    'addTicket': function(ticket) {
        this.tickets.push(ticket);
    },
    'getTickets': function() {
        return this.tickets;
    },
    'removeUser': function(id) {
        if (this.users.hasOwnProperty(id)) {
            delete this.users[id];
        }
    },
    'resetTable': function(index) {
        var x;

        if (0 < this.tables.length) {
            this.tables[index].cards = [];
        }

        this.isOpen = true;

        for (x in this.users) {
            if (this.users.hasOwnProperty(x) && helpers.isSet(this.users[x].cardValue)) {
                this.users[x].cardValue = null;
            }
        }
    },
    'getCurrentTableIndex': function() {
        return this.tables.length - 1;
    }
};