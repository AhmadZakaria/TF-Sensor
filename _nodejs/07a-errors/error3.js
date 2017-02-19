"use strict";
const net = require("net");
const connection = net.connect("0.0.0.0");

connection.on("error", (err) =>
{
    console.error(err.message);
});