var helper = (function () {
    'use strict';

    /**
     * Set a cookie
     *
     * @param name
     * @param value
     * @param expiration
     */
    var setCookie = function (name, value, expiration) {
            var cookieValue,
                expire;

            cookieValue = null;
            expire = new Date();

            if (undefined === expiration) {
                expiration = 1000 * 1800; // 1/2 hour in milliseconds
            }

            expire.setTime(expire.getTime() + expiration);
            cookieValue = encodeURI(value) + "; expires=" + expire.toUTCString();
            document.cookie = name + "=" + cookieValue;
        },

        /**
         * read a cookie by name
         *
         * @param name
         * @returns {string}
         */
        getCookie = function (name) {
            var cookie = document.cookie,
                value = null,
                start = cookie.indexOf(" " + name + "="),
                end;

            if (start === -1) {
                start = cookie.indexOf(name + "=");
            }

            if (start !== -1) {
                start = cookie.indexOf("=", start) + 1;
                end = cookie.indexOf(";", start);

                if (end === -1) {
                    end = cookie.length;
                }
                value = decodeURI(cookie.substring(start, end));
            }

            return value;
        },

        /**
         * checks if variable is set
         *
         * @param variable
         * @returns {boolean}
         */
        isSet = function (variable) {
            return !(null === variable || undefined === variable || "" === variable);
        };

    /**
     * expose api
     */
    return {
        isSet: isSet,
        getCookie: getCookie,
        setCookie: setCookie
    };
})();