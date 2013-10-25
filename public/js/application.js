$(function () {
    'use strict';

    var $username = $('#username'),
        host = window.location.hostname,
        socket = io.connect(host),
        usernameSet = $username.val();

    socket.on('connect', function() {
        var userObject = User.getUserObject(usernameSet, User.getUsername());
        socket.emit('username', userObject);
    });

    User.setInitialUsername(User.getUsername());

    socket.on('users', function(data) {
        if (!helper.isSet(data.error)) {
            User.setUserData(data);
            Desk.setTicket(data.ticket);
        } else {
            // @todo make error handling right
            alert('it did not work: ' + data.error);
        }
    });

    socket.on('sendCard', function(data) {
        Desk.manageCards(data);
    });

    socket.on('closeDesk', function(data) {
        Desk.closeDesk(data);
    });

    socket.on('updatedTicket', function(data) {
        Desk.setTicket(data);
    });

    $('.change-name').on('click', function () {
        var newName = $('#username').val();
        socket.emit('changeUsername', newName);
        // set new username
        helper.setCookie('username', newName);
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
        var openToken = Math.random();

        socket.emit('isOpen', openToken);
        socket.on('isOpenSuccess', function(data) {
            if (openToken === data) {
                socket.emit('setCard', $(this).text());
            }
        });
    });

    $('.admin-reset').on('click', function() {
        socket.emit('resetTable', helper.getCookie('userId'));
        socket.on('resetTableSuccess', Desk.resetDesk);
    });
});