"use strict";

module.exports = function (request, response)
{
    response.render("dashboard", {
        "menu_name": "dashboard",
        "header": "Sensors Dashboard"
    });
};
