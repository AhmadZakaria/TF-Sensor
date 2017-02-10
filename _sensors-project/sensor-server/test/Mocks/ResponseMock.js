"use strict";


module.exports = class ResponseMock {

    constructor() {
        this.formatData = {};
        this.responseData = {
            data: {},
            send: function (data) {
                this.data = data;
            },
            json: function (data) {
                this.data = data;
            },
            type: function (type) {
                return this;
            },
        };
    }

    status(HTTPCODE) {
        this.HTTPCODE = HTTPCODE;
        return this.responseData;
    }

    format(data) { this.formatData = data }


}