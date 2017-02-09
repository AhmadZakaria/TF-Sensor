"use strict";


module.exports = class RequestMock {

    constructor(method) {
        this.method = method;      
        this.body = {};
        this.params =  {};
    }
} 