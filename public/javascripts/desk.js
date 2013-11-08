var Desk = (function (helper, $) {
    'use strict';

    var _setCardValue = function (data, username) {
            var $card = $('#' + username),
                $cardValue = $card.find('.cardValue');

            if ($cardValue.text()) {
                $cardValue.html('<span>' + data + '</span>');
            } else {
                $card.find('.card-background').remove();
                $card.find('.thumbnail').append(
                    '<h1 class="cardValue caption" style="margin: auto"><span>' + data + '</span></h1>'
                );
            }
        },

        manageCards = function (data) {
            var username = helper.getCookie('username'),
                cardValue = data;

            if ('object' === typeof data) {
                username = data.username;
                cardValue = data.cardValue;
            }

            if (false === cardValue) {
                cardValue = 'nice try!';
            }

            _setCardValue(cardValue, username);
        },

        closeDesk = function (data) {
            var x, user;

            if (data.table) {
                $('.vote-buttons').find('.card').prop('disabled', true);
            }

            if (helper.isSet(data.cards)) {
                for (x in data.cards) {
                    user = '#' + x;
                    if (data.cards.hasOwnProperty(x) && helper.isSet(data.cards[x])) {
                        $(user).find('.cardValue').children('span').text(data.cards[x].value);
                    }
                }
            }
        },

        setTicket = function (name) {
            $('.ticket-text').text(name);
            $('.ticket-name').val(name);
        },

        resetDesk = function (data) {
            if (true === data.success) {
                $('.vote-buttons').find('.card').prop('disabled', false);
            } else {
                window.alert('it did not work: ' + data.error);
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
})(helper, jQuery);