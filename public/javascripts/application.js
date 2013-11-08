$(function () {
    'use strict';

    var $username = $('#username'),
        host = window.location.hostname,
        socket = io.connect(host);

    // set and send initial username
    User.setInitialUsername($username.val());

    socket.on('connect', function () {
        socket.emit('username', User.getUserObject());
    });

    socket.on('users', function (data) {
        if (!helper.isSet(data.error)) {
            User.setUserData(data);
            Desk.setTicket(data.ticket);
        } else {
            // @todo make error handling right
            window.alert('it did not work: ' + data.error);
        }
    });

    socket.on('sendCard', Desk.manageCards);

    socket.on('closeDesk', Desk.closeDesk);

    socket.on('updatedTicket', Desk.setTicket);


    $('.change-name').on('click', function () {
        var newName = $('#username').val();

        // set new username
        User.setUsername(newName);
        socket.emit('changeUsername', newName);
    });

    $username.on('keyup', function (e) {
        if (e.keyCode === 13) {
            $('.change-name').trigger('click');
        }
    });

    $('.update-ticket').on('click', function () {
        socket.emit('updateTicket', $('.ticket-name').val());
    });

    $('.ticket-name').on('keyup', function (e) {
        if (e.keyCode === 13) {
            $('.update-ticket').trigger('click');
        }
    });

    $('.card').on('click', function () {
        var openToken = Math.random(),
            cardValue = $(this).text();

        socket.emit('isOpen', openToken);
        socket.on('isOpenSuccess', function (data) {
            if (openToken === data) {
                socket.emit('setCard', cardValue);
            }
        });
    });

    $('.admin-reset').on('click', function () {
        socket.emit('resetTable', helper.getCookie('userId'));
        socket.on('resetTableSuccess', Desk.resetDesk);
    });
});