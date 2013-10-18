'use strict';

module.exports = {
    /**
     * helper function to count object lists
     *
     * @param object object
     *
     * @returns int
     */
    countObject: function(object) {
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
     * @TODO move into helper used by server and frontend app parts
     *
     * @param variable
     *
     * @returns boolean
     */
    isSet: function(variable) {
        return !(null === variable || undefined === variable || "" === variable);
    }
};