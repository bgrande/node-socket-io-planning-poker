$(function () {
    var host, socket, cookieUsername, userId, username, usernameSet;
    
    host = window.location.hostname;
    socket = io.connect(host);
    cookieUsername = getCookie('username');
    userId = getCookie('userId');
    username = (isSet(cookieUsername)) ? cookieUsername : 'name' + Math.round(Math.random() * Math.random() * 100);
    usernameSet = $('#username').val();   
    
    socket.on('connect', function() {
        username = (isSet(usernameSet)) ? usernameSet : username;
        var userObject = {
                'userId': userId,
                'username': username
            };
        
        socket.emit('username', userObject);
    });
    
    setCookie('username', username);
    
    $('#username').val(username);
    
    socket.on('users', function(data) {
        if (!isSet(data.error)) {
            if (isSet(data.userId) && isSet(undefined !== data.users)) {
                setUserList(data.users);
                setCookie('userId', data.userId);
                if (true === data.admin) {
                    $('.admin-toolbar').show();
                } else {
                    $('.admin-toolbar').hide();
                }
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
    
        for (var x in data.cards) {
            var user = '#' + x;
            //noinspection JSUnfilteredForInLoop
            $(user).find('.cardValue').children('span').text(data.cards[x].value);
        }
    });

    socket.on('changedTickets', function(data) {
        for (var x in data) {
            $('#ticketList').children('span').text(x.name);
        }
    });

    $('.add-ticket').on('click', function () {
        var ticket = $('#ticket').val();
        socket.emit('addTicket', {'name': ticket})
    });
    
    $('.change-name').on('click', function () {
        var newName = $('#username').val();
        socket.emit('changeUsername', newName);
        setCookie('username', newName);
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
        
    function setCookie(name, value, expiration)
    {
        'use strict';
        var cookieValue, expire;
        cookieValue = null;
        expire = new Date();
    
        if (undefined === expiration) {
            expiration = 1000 * 3600; // 1 hour in milliseconds
        }
    
        expire.setTime(expire.getTime() + expiration);
        cookieValue = encodeURI(value) + "; expires=" + expire.toUTCString();
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
            value = decodeURI(cookie.substring(start, end));
        }
    
        return value;
    }
    
    function isSet(variable) {
        return !(null === variable || undefined === variable || "" === variable);        
    }
});
