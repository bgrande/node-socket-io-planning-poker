module.exports = {
    /**
     * helper function to count object lists
     *
     * @param object object
     *
     * @returns int
     */
    countObject: function (object) {
        'use strict';

        var count = 0,
            x;

        for (x in object) {
            if (object.hasOwnProperty(x)) {
                count++;
            }
        }
        return count;
    },

    /**
     * isSet...
     *
     * @param variable
     *
     * @returns boolean
     */
    isSet: function (variable) {
        'use strict';

        return !(null === variable || undefined === variable || "" === variable);
    }
};