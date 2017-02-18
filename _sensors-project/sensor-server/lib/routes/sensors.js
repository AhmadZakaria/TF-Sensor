"use strict";

const uuid = require("uuid");
const httpError = require("http-errors");
const http = require("http");
const TFSensor = require('../../../tf-sensor/lib/TFSensor');
const PhoneSensor = require('../../../phone-sensor/lib/PhoneSensor');
const WebSocket = require('ws');
const fs = require('fs');

//const TFSensorOptions = require('../../../tf-sensor/lib/TFSensorOptions');


const wss = new WebSocket.Server({
    port: 8888
});


wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            // console.log(data);
            client.send(JSON.stringify(data));
        }
    })
};

let typeHardwareSensor;
let typePhoneSensor;

let sensorOptions = [];
let sensors = new Map();


//Operations for all Sensors (GET LIST, POST NEW SENSOR)
module.exports = class Sensors {

    constructor(TypeHardwareSensor, TypePhoneSensor) {
        typeHardwareSensor = TypeHardwareSensor;
        typePhoneSensor = TypePhoneSensor;

        //Load TFSensorOptions out of file
        var content = fs.readFileSync('TFSensorOptions.json', 'utf8');

        if (content != "") {
            sensorOptions = JSON.parse(content);
        }

        //Initialise loaded sensors
        for (var opts in sensorOptions) {
            let sensor = new typeHardwareSensor(sensorOptions[opts]);

            // sensor.onactivate = event => console.log('activated');
            sensor.onchange = event => {
                // console.log(
                // `${new Date(event.reading.timestamp).toLocaleTimeString()} ${event.reading.tfValue}`);
                let sensorResponse = {
                    id: sensor.id,
                    type: sensor.Type,
                    reading: event.reading.value,
                    timestamp: event.reading.timestamp,
                    unit: event.unit
                };

                wss.broadcast(sensorResponse);

                sensor.reading = event.reading;
            }
            sensor.start();
            sensors.set(sensor.id, sensor);
        }

        // Array
        //     .from(sensors.entries())
        //     .forEach(entry => entry[1].start());

        // let sensorsResponse = Array
        //     .from(sensors.keys())
        //     .map(id => ({
        //         id: id
        //     }));


    }

    clearsensorOptions() {
        sensorOptions = [];
        var json = JSON.stringify(sensorOptions);
        fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful!"));
    }

    clearSensors() {
        sensors = new Map();
    }


    sensors(request, response, next) {
        let sensorsResponse;
        switch (request.method) {
            case "GET":
                sensorsResponse = Array
                    .from(sensors.keys())
                    .map(id => ({
                        id: id
                    }));
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
                if (sensors.has(request.body.UID)) {
                    response.format({
                        "application/json": () => {
                            response.status(409).json(
                                {
                                    "status": "UID already exists"
                                });
                        },
                        "default": () => {
                            next(new httpError.NotAcceptable());
                        }
                    });
                    break;
                }
                else {

                    let sensor;

                    if (request.body.target === 'Tinkerforge') {
                        sensor = new typeHardwareSensor(request.body);
                        sensorOptions.push(request.body);
                        var json = JSON.stringify(sensorOptions);
                        fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful (sensors POST" + sensor.id + " )!"));


                    } else {
                        sensor = new typePhoneSensor(request.body);
                    }

                    if (request.body.active == true) {
                        sensor.start();
                    }

                    sensors.set(sensor.id, sensor);
                    sensorsResponse = Array.from(sensors.keys())
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
                }
            case "CONNECT":
            case "DELETE":
            case "HEAD":
            case "OPTIONS":
            case "PUT":
            case "TRACE":
            default:
                response.set("allow", "GET,POST");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    //Single Sensor need ID (GET[ID;TYPE;FREQUENCY], PUT[UPDATE SENSOR])
    sensor(request, response, next) {
        let sensor = sensors.get(request.params.sensor);

        if (sensor == undefined) {
            response.format({
                "default": () => {
                    next(new httpError.NotAcceptable());
                }
            });
            return;
        }

        let sensorResponse = {
            id: sensor.id,
            type: sensor.Type,
            frequency: sensor.sensorOptions.frequency
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
                if (sensor.target === 'Tinkerforge') {
                    sensorOptions = sensorOptions.filter(i => i.UID != sensor.id)
                    var json = JSON.stringify(sensorOptions);
                    fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful!"));
                }

                sensors.delete(sensor.id);

            case "PUT":
                sensor.stop();

                if (request.body.target != sensor.target) {
                    //Not allowed DoTo Status Message
                    break;
                }

                sensors.delete(sensor.id); //Delete because of reintiasation of the Tinkerforge

                if (request.body.target === 'Tinkerforge') {

                    sensorOptions = sensorOptions.filter(i => i.UID != sensor.id)
                    sensor = new typeHardwareSensor(request.body);
                    sensorOptions.push(request.body);
                    var json = JSON.stringify(sensorOptions);
                    fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful!"));

                } else {
                    sensor = new typePhoneSensor(request.body);
                }

                if (request.body.active == true) {
                    sensor.start();
                }

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
            case "HEAD":
            case "OPTIONS":
            case "POST":
            case "TRACE":
            default:
                response.set("allow", "GET, PUT, DELETE");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    lastSensorReading(request, response, next) {
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
                sensor.lastReading = parseInt(request.body.lastReading);
                response.format({
                    "application/json": () => {
                        response.status(201).send(sensorResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "TRACE":
            default:
                response.set("allow", "GET, POST");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    sensorOptionsActive(request, response, next) {
        let sensor = sensors.get(request.params.sensor);
        switch (request.method) {
            case "GET":
            case "DELETE":
            case "PUT":
                let active = parse(request.body.active);
                if (typeof (active) === "boolean") { // good request
                    if (active == true) {
                        sensor.start();
                    }
                    else {
                        sensor.stop();
                    }
                    response.format({
                        "application/json": () => {
                            response.status(200);
                        },
                        "default": () => {
                            next(new httpError.NotAcceptable());
                        }
                    });
                } else {// bad request
                    next(new httpError.BadRequest());
                }


                break;
            case "CONNECT":
            case "HEAD":
            case "OPTIONS":
            case "POST":
            case "TRACE":
            default:
                response.set("allow", "PUT");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    _404(request, response) {
        response.status(404).json({
            "error": http.STATUS_CODES[404]
        })
    }
};
