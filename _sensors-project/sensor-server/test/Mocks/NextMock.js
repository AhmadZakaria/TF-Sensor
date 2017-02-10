"use strict";
 let _httpError;

module.exports = class NextMock {
    constructor() {

    }

    next(httpError) {
        _httpError = httpError;
    }
    
    get()
    {
        return _httpError;
    }
} 