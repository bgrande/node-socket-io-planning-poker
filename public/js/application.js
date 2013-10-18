$(function () {
    'use strict';
    var $username, host, socket, cookieUsername, userId, username, usernameSet;

    host = window.location.hostname;
    socket = io.connect(host);
    $username = $('#username');
    cookieUsername = getCookie('username');
    userId = getCookie('userId');
    username = (isSet(cookieUsername)) ? cookieUsername : 'name' + Math.round(Math.random() * Math.random() * 100);
    usernameSet = $username.val();

    socket.on('connect', function() {
        var userObject = getUserObject(usernameSet, username);
        socket.emit('username', userObject);
    });

    setInitialUsername(username);

    socket.on('users', function(data) {
        if (!isSet(data.error)) {
            setUserData(data);
            setTicket(data.ticket);
        } else {
            // @todo make error handling right
            alert('it did not work: ' + data.error);
        }
    });

    socket.on('sendCard', function(data) {
        manageCards(data);
    });

    socket.on('closeDesk', function(data) {
        closeDesk(data);
    });

    socket.on('updatedTicket', function(data) {
        setTicket(data);
    });

    $('.change-name').on('click', function () {
        var newName = $('#username').val();
        socket.emit('changeUsername', newName);
        // set new username
        setCookie('username', newName);
    });

    $username.on('keyup', function(e) {
        if (e.keyCode == 13) {
            $('.change-name').trigger('click');
        }
    });

    $('.update-ticket').on('click', function () {
        var ticket = $('.ticket-name').val();
        socket.emit('updateTicket', ticket);
    });

    $('.ticket-name').on('keyup', function(e) {
        if (e.keyCode == 13) {
            $('.update-ticket').trigger('click');
        }
    });
    
    $('.card').on('click', function() {
        var openToken = Math.random(),
            that = this;
    
        socket.emit('isOpen', openToken);
        socket.on('isOpenSuccess', function(data) {
            if (openToken === data) {
                var cardValue = $(that).text();
                socket.emit('setCard', cardValue);
            }
        });
    });

    $('.admin-reset').on('click', function() {
        socket.emit('resetTable', getCookie('userId'));
        socket.on('resetTableSuccess', function(data) {
            if (undefined !== data.success && true === data.success) {
                $('.vote-buttons').find('.card').prop('disabled', false);
            } else {
                alert('it did not work: ' + data.error);
            }
        });
    });
    
    var setUserList = function(data) {
        var $userlist = $('#userlist'),
            $cardList = $('#cardlist');
    
        $userlist.empty();
        $cardList.empty();
    
        for (var i = 0; i < data.users.length; i++) {
            var name = data.users[i].username,
                cardValue = data.users[i].cardValue,
                card,
                style = '';

            /* @todo bad style -> separate html from js */
            if (undefined === cardValue || null === cardValue || '' == cardValue) {
                card = '<div class="card-background"></div>';
            } else {
                card = '<h1 class="cardValue caption" style="margin: auto"><span>' + cardValue + '</span></h1>';
            }
    
            // '<button type=\"button\" class=\"card btn btn-small\" style=\"float: right;\">X</button>'
            if (name === getCookie('username')) {
                style = "style=\"background-color: #82FA58;\"";
            }
    
            $userlist.append(
                "<li class=\"list-group-item\"" + style + ">" + name + " </li>"
            );
            $cardList.append(
                "<div class=\"col-lg-2 card\" id=\"" + name + "\" style=\"margin: auto\">" +
                    "    <div class=\"thumbnail\" " + style + ">" +
                    "      <div class=\"caption\"><h5>" + name + "</h5></div>" +
                    card +
                    "    </div>" +
                    "</div>"
            );
        }
    };
    
    var setCardValue = function (data, username) {
        var $card = $('#' + username),
            $cardValue = $card.find('.cardValue');

        if ($cardValue.text()) {
            $cardValue.html('<span>' + data + '</span>');
        } else {
            $card.find('.card-background').remove();
            $card.find('.thumbnail').append('<h1 class="cardValue caption" style="margin: auto"><span>' + data + '</span></h1>');
        }
    };

    function manageCards(data) {
        var username = getCookie('username'),
            cardValue = data;

        if ('object' == typeof data) {
            username = data.username;
            cardValue = data.cardValue;
        }

        if (false === cardValue) {
            cardValue = 'nice try!';
        }

        setCardValue(cardValue, username)
    }

    function getUserObject(usernameSet, username) {
        username = (isSet(usernameSet)) ? usernameSet : username;
        return {
            'userId': userId,
            'username': username
        };
    }

    function setInitialUsername(username) {
        // set initial username cookie
        setCookie('username', username);
        $username.val(username);
    }

    function toggleAdminMode(data) {
        // show admin toolbar
        if (true === data.admin) {
            $('.admin-toolbar').show();
            $('.ticket-text').hide();
            $('.update-ticket-group').show();
        } else {
            $('.admin-toolbar').hide();
            $('.ticket-text').show();
            $('.update-ticket-group').hide();
        }
    }

    function setUserData(data) {
        var userList = data;

        if (isSet(data.userId) && isSet(data.users)) {
            userList = data.users;

            // set initial userId cookie
            setCookie('userId', data.userId);

            toggleAdminMode(data);
        }

        setUserList(userList);
    }

    function closeDesk(data) {
        if (data.table) {
            $('.vote-buttons').find('.card').prop('disabled', true);
        }

        for (var x in data.cards) {
            var user = '#' + x;
            if (data.cards.hasOwnProperty(x) && !helpers.isSet(data.cards[x])) {
                $(user).find('.cardValue').children('span').text(data.cards[x].value);
            }
        }
    }

    function setTicket(name) {
        $('.ticket-text').text(name);
        $('.ticket-name').val(name);
    }
});


// @todo should be part of own helper file
/**
 * Set a cookie
 *
 * @param name
 * @param value
 * @param expiration
 */
function setCookie(name, value, expiration)
{
    var cookieValue, expire;
    cookieValue = null;
    expire = new Date();

    if (undefined === expiration) {
        expiration = 1000 * 1800; // 1/2 hour in milliseconds
    }

    expire.setTime(expire.getTime() + expiration);
    cookieValue = encodeURI(value) + "; expires=" + expire.toUTCString();
    document.cookie = name + "=" + cookieValue;
}

/**
 * read a cookie by name
 *
 * @param name
 * @returns {string}
 */
function getCookie(name)
{
    var cookie = document.cookie,
        value = null,
        start = cookie.indexOf(" " + name + "=");

    if (start == -1) {
        start = cookie.indexOf(name + "=");
    }

    if (start !== -1) {
        start = cookie.indexOf("=", start) + 1;
        var end = cookie.indexOf(";", start);
        if (end == -1) {
            end = cookie.length;
        }
        value = decodeURI(cookie.substring(start, end));
    }

    return value;
}

/**
 * checks if variable is set
 *
 * @param variable
 * @returns {boolean}
 */
function isSet(variable) {
    return !(null === variable || undefined === variable || "" === variable);
}
