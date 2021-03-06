"use strict";

const uuid = require("uuid");
const httpError = require("http-errors");
const http = require("http");
const TFSensor = require('tf-sensor/lib/TFSensor');
const TFSensorReading = require('tf-sensor/lib/TFSensorReading');
const PhoneSensor = require('phone-sensor/lib/PhoneSensor');
const PhoneSensorReading = require('phone-sensor/lib/PhoneSensorReading');
const WebSocket = require('ws');
const fs = require('fs');
const SensorState = require('generic-sensor-api/api/SensorState');
const request = require("request");

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
        for (var opts of sensorOptions) {
            let sensor = new typeHardwareSensor(opts);

            // sensor.onactivate = event => console.log('activated');
            sensor.onchange = event => {
                // console.log(
                // `${new Date(event.timestamp).toLocaleTimeString()} ${event.value}`);
                let sensorResponse = {
                    id: sensor.id,
                    type: sensor.Type,
                    reading: event.value,
                    timestamp: event.timestamp,
                    unit: sensor.unit
                };

                wss.broadcast(sensorResponse);
                sensor.lastReading = event;
            }
            sensor.start();
            sensors.set(sensor.id, sensor);
        }


        // for testing purposes

        // setInterval(() => {
        //     sensorOptions.forEach(sen => {
        //         request.post(
        //             'http://localhost:8080/api/sensors/' + sen.UID + "/sensorReadings/latest",
        //             {
        //                 json: {
        //                     "lastReading": {
        //                         "value": 50 * Math.random(),
        //                         "timestamp": Date.now() + 1
        //                     }
        //                 }
        //             },
        //             function (error, response, body) {
        //                 if (!error && response.statusCode == 200) {
        //                     console.log(body)
        //                 }
        //             }
        //         );
        //     })
        // }, 1000);

        // Array
        //     .from(sensors.entries())
        //     .forEach(entry => entry[1].start());

        // let sensorsResponse = Array
        //     .from(sensors.keys())
        //     .map(id => ({
        //         id: id
        //     }));


    }

    // clearsensorOptions() {
    //     sensorOptions = [];
    //     var json = JSON.stringify(sensorOptions);
    //     fs.writeFile('TFSensorOptions.json', json, 'utf8', () => {
    //         //console.log("Writing successful (sensors POST" + sensor.id + " )!");
    //     });
    // }

    // clearSensors() {
    //     sensors = new Map();
    // }


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
                if (!request.body.hasOwnProperty("UID")) {
                    response.format({
                        "application/json": () => {
                            response.status(406).json({
                                "error": "Sensor must have a UID"
                            });
                        },
                        "default": () => {
                            next(new httpError.NotAcceptable());
                        }
                    });
                    break;
                }

                if (sensors.has(request.body.UID)) {
                    response.format({
                        "application/json": () => {
                            response.status(409).json(
                                {
                                    "error": "UID already exists"
                                });
                        },
                        "default": () => {
                            next(new httpError.Conflict());
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
                        // fs.writeFile('TFSensorOptions.json', json, 'utf8', () => {
                        //console.log("Writing successful (sensors POST" + sensor.id + " )!");
                        // });

                        sensor.onchange = event => {
                            // console.log(
                            // `${new Date(event.reading.timestamp).toLocaleTimeString()} ${event.reading.tfValue}`);
                            let sensorResponse = {
                                id: sensor.id,
                                type: sensor.Type,
                                reading: event.value,
                                timestamp: event.timestamp,
                                unit: sensor.unit
                            };

                            wss.broadcast(sensorResponse);
                            sensor.lastReading = event;
                        }

                    } else {
                        sensor = new typePhoneSensor(request.body);
                        sensor.onchange = event => {

                            let sensorResponse = {
                                id: sensor.id,
                                type: sensor.Type,
                                reading: event.value,
                                timestamp: event.timestamp,
                                unit: sensor.unit
                            };

                            wss.broadcast(sensorResponse);
                            sensor.lastReading = event;
                        };
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
                    next(new httpError.NotFound());
                }
            });
            return;
        }

        // let sensorResponse = {
        //     id: sensor.id,
        //     type: sensor.Type,
        //     frequency: sensor.sensorOptions.frequency
        // }
        let sensorResponse = sensor.sensorOptions;

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
                    // fs.writeFile('TFSensorOptions.json', json, 'utf8', () => {
                    //console.log("Writing successful (sensors POST" + sensor.id + " )!");
                    // });
                }

                sensors.delete(sensor.id);
                response.format({
                    "application/json": () => {
                        response.status(200).send({ "message": "Sensor deleted" });
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "PUT":
                sensor.stop();

                // sensor target is not subject to change.
                if (request.body.hasOwnProperty('target') && request.body.target != sensor.target) {
                    response.format({
                        "application/json": () => {
                            response.status(406).send({ "error": "Target cannot be changed" });
                        },
                        "default": () => {
                            next(new httpError.NotAcceptable());
                        }
                    });

                    break;
                }

                // sensor UID is also not subject to change.
                if (request.body.hasOwnProperty('UID') && request.body.UID != sensor.id) {
                    response.format({
                        "application/json": () => {
                            response.status(406).send({ "error": "UID cannot be changed" });
                        },
                        "default": () => {
                            next(new httpError.NotAcceptable());
                        }
                    });

                    break;
                }

                // get old options
                let newOptions = sensor.sensorOptions;
                // modify requested options, and keep the rest
                for (let newopt in request.body) {
                    if (request.body.hasOwnProperty(newopt)) {
                        newOptions[newopt] = request.body[newopt];
                    }
                }

                sensors.delete(sensor.id); //Delete because of reintiasation of the Tinkerforge

                if (newOptions.target === 'Tinkerforge') {

                    sensorOptions = sensorOptions.filter(i => i.UID != sensor.id)
                    sensor = new typeHardwareSensor(newOptions);
                    sensorOptions.push(newOptions);
                    // var json = JSON.stringify(sensorOptions);
                    // fs.writeFile('TFSensorOptions.json', json, 'utf8', () => {
                    //console.log("Writing successful (sensors POST" + sensor.id + " )!");
                    // });
                    sensor.onchange = event => {

                        let sensorResponse = {
                            id: sensor.id,
                            type: sensor.Type,
                            reading: event.value,
                            timestamp: event.timestamp,
                            unit: sensor.unit
                        };

                        wss.broadcast(sensorResponse);
                        sensor.lastReading = event;
                    };

                } else {
                    sensor = new typePhoneSensor(newOptions);
                    sensor.onchange = event => {

                        let sensorResponse = {
                            id: sensor.id,
                            type: sensor.Type,
                            reading: event.value,
                            timestamp: event.timestamp,
                            unit: sensor.unit
                        };

                        wss.broadcast(sensorResponse);
                        sensor.lastReading = event;
                    };
                }

                if (newOptions.active == true) {
                    sensor.start();
                }

                sensors.set(sensor.id, sensor);
                let sensorsResponse = Array
                    .from(sensors.keys())
                    .map(id => ({
                        id: id
                    }));

                response.format({
                    "application/json": () => {
                        response.status(200).send(sensorsResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
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
        if (sensor == undefined) {
            response.format({
                "application/json": () => {
                    response.status(404).type("application/json").send({ "error": "Sensor doesn't exist!" });
                },
                "default": () => {
                    next(new httpError.NotFound());
                }
            });
            return;
        }

        let sensorResponse = {
            value: sensor.lastReading.value,
            timestamp: sensor.lastReading.timestamp
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
            case "POST":
                sensor.lastReading = new PhoneSensorReading(
                    parseInt(request.body.lastReading.timestamp),
                    parseFloat(request.body.lastReading.value));
                sensorResponse = {
                    value: sensor.lastReading.value,
                    timestamp: sensor.lastReading.timestamp
                };
                sensor.onchange(sensor.lastReading);
                response.format({
                    "application/json": () => {
                        response.status(201).send(sensorResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;
            case "DELETE":
            case "PUT":
            case "HEAD":
            case "OPTIONS":
            case "TRACE":
            default:
                response.set("allow", "GET, POST");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    sensorOptionsActive(request, response, next) {
        let sensor = sensors.get(request.params.sensor);
        if (sensor == undefined) {
            response.format({
                "application/json": () => {
                    response.status(404).type("application/json").send({ "error": "Sensor doesn't exist!" });
                },
                "default": () => {
                    next(new httpError.NotFound());
                }
            });
            return;
        }
        switch (request.method) {

            case "PUT":
                let active = (true == request.body.active);

                if (active) {
                    sensor.start();
                } else {
                    sensor.stop();
                }
            // no break on purpose. PUT returns new response
            case "GET":
                let sensorResponse = {
                    id: sensor.id,
                    active: (sensor.state == SensorState.ACTIVATED)
                };
                response.format({
                    "application/json": () => {
                        response.status(200).send(sensorResponse);
                    },
                    "default": () => {
                        next(new httpError.NotAcceptable());
                    }
                });
                break;

            case "DELETE":
            case "HEAD":
            case "OPTIONS":
            case "POST":
            case "TRACE":
            default:
                response.set("allow", "PUT, GET");
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
