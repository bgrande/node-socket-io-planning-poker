$(function () {    
    var host = window.location.hostname;
    socket = io.connect(host), // connect to source hostname...
        cookieUsername = getCookie('username'),
        userId = getCookie('userId'),
        username = (undefined !== cookieUsername && null !== cookieUsername) ? cookieUsername : 'name' + Math.round(Math.random() * Math.random() * 100),
        usernameSet = $('#username').val();
    
    socket.on('connect', function() {
        var username = usernameSet !== '' ? usernameSet : username,
            userObject = {};
    
        userObject = {
            'userId': userId,
            'username': username
        };
    
    
        socket.emit('username', userObject);
    });
    
    setCookie('username', username);
    
    socket.on('users', function(data) {
        if (undefined !== data && null !== data && undefined === data.error) {
            if (undefined !== data.userId && undefined !== data.users) {
                setUserList(data.users);
                setCookie('userId', data.userId);
            } else {
                setUserList(data);
            }
        } else {
            // @todo make error handling right
            alert('it did not work: ' + data.error);
        }
    });
    
    socket.on('sendCard', function(data) {
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
    });
    
    socket.on('closeDesk', function(data) {
        if (data.desk) {
            $('.vote-buttons').find('.card').prop('disabled', true);
        }
    
        for (x in data.cards) {
            var user = '#' + x;
            $(user).find('.cardValue').children('span').text(data.cards[x].value);
        }
    });
    
    $('.change-name').on('click', function(e) {
        var newName = $('#username').val();
        socket.emit('changeUsername', newName);
        setCookie('username', newName);
    });
    
    $('.card').on('click', function(e) {
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
    
            if (undefined === cardValue || null === cardValue || '' == cardValue) {
                card = '<img class="card-background" src=\"img/back.png\" alt=\"Card Background\" />';
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
    
    var setCardValue = function(data, username) {
        var $card = $('#' + username),
            $cardValue = $card.find('.cardValue');
    
        if ($cardValue.text()) {
            $cardValue.html('<span>' + data + '</span>');
        } else {
            $card.find('.card-background').remove();
            $card.find('.thumbnail').append('<h1 class="cardValue caption" style="margin: auto"><span>' + data + '</span></h1>');
        }
    }
    
    function setCookie(name, value, expiration)
    {
        'use strict';
        var cookieValue = null,
            expire = new Date();
    
        if (undefined === expiration) {
            expiration = 1000 * 3600; // 1 hour in milliseconds
        }
    
        expire.setTime(expire.getTime() + expiration);
        var cookieValue = escape(value) + "; expires=" + expire.toUTCString();
        document.cookie = name + "=" + cookieValue;
    }
    
    function getCookie(name)
    {
        'use strict';
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
            value = unescape(cookie.substring(start, end));
        }
    
        return value;
    }
});