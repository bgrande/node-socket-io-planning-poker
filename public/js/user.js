var User = (function(helper) {
    'use strict';
    var _cookieUsername = helper.getCookie('username'),
        _userId = helper.getCookie('userId'),
        _username = (helper.isSet(_cookieUsername)) ? _cookieUsername : 'name' + Math.round(Math.random() * Math.random() * 100);

    var _getUsername = function() {
        return _username;
    };

    var getUserObject = function() {
        return {
            userId: _userId,
            username: _getUsername()
        };
    };

    var setInitialUsername = function(usernameSet) {
        setUsername((helper.isSet(usernameSet)) ? usernameSet : _getUsername());
    };

    var setUserData = function(data) {
        var userList = data;

        if (helper.isSet(data.userId) && helper.isSet(data.users)) {
            userList = data.users;

            // set initial userId cookie
            helper.setCookie('userId', data.userId);

            _toggleAdminMode(data);
        }

        _setUserList(userList);
    };

    var setUsername = function(name) {
        $('#username').val(name);
        _username = name;
        // set initial username cookie
        helper.setCookie('username', name);
    };

    var _toggleAdminMode = function(data) {
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
    };

    var _setUserList = function(data) {
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
            if (helper.isSet(cardValue)) {
                card = '<h1 class="cardValue"><span>' + cardValue + '</span></h1>';
            } else {
                card = '<div class="card-background" style="background-image: url(\'img/cardback.gif\'); border: 0; height: 9em;"></div>';
            }

            // '<button type=\"button\" class=\"card btn btn-small\" style=\"float: right;\">X</button>'
            if (name === helper.getCookie('username')) {
                style = "style=\"background-color: #82FA58;\"";
            }

            $userlist.append(
                "<li class=\"list-group-item\"" + style + ">" + name + " </li>"
            );
            $cardList.append(
                "<div class=\"col-lg-2 card\" id=\"" + name + "\" style=\"text-align: center\">" +
                    "    <div class=\"caption\"><h5>" + name + "</h5></div>" +
                    "    <div class=\"thumbnail\" " + style + ">" + card + "</div>" +
                    "</div>"
            );

            $cardList.find('.thumbnail').css('padding', 0);
            $cardList.find('.thumbnail').css('height', '9em');
            $cardList.find('.thumbnail').css('margin', 'auto');
        }
    };

    /**
     * expose api
     */
    return {
        setUsername: setUsername,
        getUserObject: getUserObject,
        setInitialUsername: setInitialUsername,
        setUserData: setUserData
    };
})(helper);