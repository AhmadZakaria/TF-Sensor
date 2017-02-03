"use strict";

const uuid = require("uuid");
const httpError = require("http-errors");
const http = require("http");
const DummySensor = require("dummy-sensor").DummySensor;
const TFSensor = require('../../../tf-sensor/lib/TFSensor');
const TFSensorOptions = require('../../../tf-sensor/lib/TFSensorOptions');
const WebSocket = require('ws');
var fs = require('fs');

const wss = new WebSocket.Server({
    port: 8888
});


wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            console.log(data);

            client.send(JSON.stringify(data));
        }
    })
};

let sensorOptions = [];
let sensors = new Map();

//Load TFSensorOptions out of file
fs.readFile('TFSensorOptions.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
        console.log(err);
    } else {
        sensorOptions = JSON.parse(data);
    }
});




for (var opts in sensorOptions) {
    let sensor = new TFSensor(sensorOptions[opts]);

    sensor.onactivate = event => console.log('activated');
    sensor.onchange = event => {
        console.log(
            `${new Date(event.reading.timestamp).toLocaleTimeString()} ${event.reading.tfValue}`);
        let sensorResponse = {
            id: sensor.id,
            type: sensor.Type,
            reading: event.reading.tfValue,
            timestamp: event.reading.timestamp
        };

        wss.broadcast(sensorResponse);


        sensor.reading = event.reading
    }
    sensor.start();
    // setTimeout(
    //     () => {
    //         sensor.stop();
    //     },
    //     5000
    // );
    // sensor.onchange = event => sensor.reading = event.reading;
    sensors.set(sensor.id, sensor);
}

Array
    .from(sensors.entries())
    .forEach(entry => entry[1].start());

let sensorsResponse = Array
    .from(sensors.keys())
    .map(id => ({
        id: id
    }));

module.exports = class Sensors {
    static sensors(request, response, next) {
        switch (request.method) {
            case "GET":
                sensorsResponse = Array
                    .from(sensors.keys())
                    .map(id => ({
                        id: id
                    }));
                console.log("GET");
                response.format({
                    "application/json": () => {
                        response.status(200).json({
                            "sensors": sensorsResponse
                        });
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "POST":
                console.log("POST: " + JSON.stringify(request.body));

                let sensor;

                if (request.body.target === 'Tinkerforge') {
                    sensor = new TFSensor(request.body);
                    sensorOptions.push(request.body);
                    var json = JSON.stringify(sensorOptions);
                    // fs.writeFile('TFSensorOptions.json', json, 'utf8', ()=>console.log("Writing successful!"));


                } else {
                    sensor = new PhoneSensor(request.body);
                }

                sensor.start();
                sensors.set(sensor.id, sensor);
                sensorsResponse = Array
                    .from(sensors.keys())
                    .map(id => ({
                        id: id
                    }));

                response.format({
                    "application/json": () => {
                        response.status(201).send(sensorsResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "CONNECT":
            case "DELETE":
            case "HEAD":
            case "OPTIONS":
            case "PUT":
            case "TRACE":
            default:
                response.set("allow", "GET");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    static sensor(request, response, next) {
        let sensor = sensors.get(request.params.sensor);

        let sensorResponse = {
            id: sensor.id,
            type: sensor.Type,
            frequency: sensor.sensorOptions.frequency
        }

        if (sensor == undefined) {
            response.format({
                "default": () => {
                    next(new httpError.NotAcceptable());
                }
            });
            return;
        }

        switch (request.method) {
            case "GET":

                response.format({
                    "application/json": () => {
                        response.status(200).type("application/json").send(sensorResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "DELETE":
            case "PUT":
                sensor.stop();
                sensor.sensorOptions.frequency = parseInt(request.body.frequency);
                sensor.start();
                sensorResponse.frequency = sensor.sensorOptions.frequency
                response.format({
                    "application/json": () => {
                        response.status(201).send(sensorResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "CONNECT":
            case "HEAD":
            case "OPTIONS":
            case "POST":
            case "TRACE":
            default:
                response.set("allow", "GET, POST");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    static lastSensorReading(request, response, next) {
        let sensor = sensors.get(request.params.sensor);
        let sensorResponse = {
            reading: sensor.reading.value,
            timestamp: sensor.reading.timestamp
        }
        switch (request.method) {
            case "GET":
                response.format({
                    "application/json": () => {
                        response.status(200).type("application/json").send(sensorResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "DELETE":
            case "PUT":
            case "CONNECT":
            case "HEAD":
            case "OPTIONS":
            case "POST":
            case "TRACE":
            default:
                response.set("allow", "GET, POST");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    static _404(request, response) {
        response.status(404).json({
            "error": http.STATUS_CODES[404]
        })
    }
};
