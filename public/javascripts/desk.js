var Desk = (function(helper) {
    'use strict';

    var manageCards = function(data) {
        var username = helper.getCookie('username'),
            cardValue = data;

        if ('object' == typeof data) {
            username = data.username;
            cardValue = data.cardValue;
        }

        if (false === cardValue) {
            cardValue = 'nice try!';
        }

        _setCardValue(cardValue, username)
    };

    var closeDesk = function(data) {
        if (data.table) {
            $('.vote-buttons').find('.card').prop('disabled', true);
        }

        for (var x in data.cards) {
            var user = '#' + x;
            if (data.cards.hasOwnProperty(x) && helper.isSet(data.cards[x])) {
                $(user).find('.cardValue').children('span').text(data.cards[x].value);
            }
        }
    };

    var setTicket = function(name) {
        $('.ticket-text').text(name);
        $('.ticket-name').val(name);
    };

    var resetDesk = function(data) {
        if (undefined !== data.success && true === data.success) {
            $('.vote-buttons').find('.card').prop('disabled', false);
        } else {
            alert('it did not work: ' + data.error);
        }
    };

    var _setCardValue = function (data, username) {
        var $card = $('#' + username),
            $cardValue = $card.find('.cardValue');

        if ($cardValue.text()) {
            $cardValue.html('<span>' + data + '</span>');
        } else {
            $card.find('.card-background').remove();
            $card.find('.thumbnail').append('<h1 class="cardValue caption" style="margin: auto"><span>' + data + '</span></h1>');
        }
    };

    /**
     * expose api
     */
    return {
        manageCards: manageCards,
        closeDesk: closeDesk,
        setTicket: setTicket,
        resetDesk: resetDesk
    };
})(helper);