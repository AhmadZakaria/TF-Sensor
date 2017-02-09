"use strict";

const uuid = require("uuid");
const httpError = require("http-errors");
const http = require("http");
// const TFSensor = require('../../../tf-sensor/lib/TFSensor');
// const PhoneSensor = require('../../../phone-sensor/lib/PhoneSensor');
const WebSocket = require('ws');
const fs = require('fs');

//const TFSensorOptions = require('../../../tf-sensor/lib/TFSensorOptions');


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



//Operations for all Sensors (GET LIST, POST NEW SENSOR)
module.exports = class Sensors {

    constructor(TypeHardwareSensor, TypePhoneSensor) {
        this._typeHardwareSensor = TypeHardwareSensor;
        this._typePhoneSensor = TypePhoneSensor;

        this._sensorOptions = [];
        this._sensors = new Map();

        //Load TFSensorOptions out of file
        fs.readFile('TFSensorOptions.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                this._sensorOptions = JSON.parse(data);
            }
        });

        for (var opts in this._sensorOptions) {
            let sensor = new _typeHardwareSensor(this._sensorOptions[opts]);

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
            this._sensors.set(sensor.id, sensor);
        }

        // Array
        //     .from(this._sensors.entries())
        //     .forEach(entry => entry[1].start());

        // let sensorsResponse = Array
        //     .from(this._sensors.keys())
        //     .map(id => ({
        //         id: id
        //     }));


    }


    sensors(request, response, next) {
        let sensorsResponse;

        switch (request.method) {
            case "GET":
                sensorsResponse = Array
                    .from(this._sensors.keys())
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

                let sensor;

                if (request.body.target === 'Tinkerforge') {
                    sensor = new _typeHardwareSensor(request.body);
                    this._sensorOptions.push(request.body);
                    var json = JSON.stringify(this._sensorOptions);
                    fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful!"));


                } else {
                    sensor = new _typePhoneSensor(request.body);
                }

                if (request.body.active == true) {
                    sensor.start();
                }

                this._sensors.set(sensor.id, sensor);
                sensorsResponse = Array
                    .from(this._sensors.keys())
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

    //Single Sensor need ID (GET[ID;TYPE;FREQUENCY], PUT[UPDATE SENSOR])
    sensor(request, response, next) {
        let sensor = this._sensors.get(request.params.sensor);
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
                if (sensor.target === 'Tinkerforge') {
                    this._sensorOptions = this._sensorOptions.filter(i => i.UID != sensor.id)
                    var json = JSON.stringify(this._sensorOptions);
                    fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful!"));
                }

                this._sensors.delete(sensor.id);

            case "PUT":
                sensor.stop();

                if (request.body.target != sensor.target) {
                    //Not allowed
                    break;
                }

                this._sensors.delete(sensor.id);

                if (request.body.target === 'Tinkerforge') {

                    this._sensorOptions = this._sensorOptions.filter(i => i.UID != sensor.id)
                    sensor = new _typeHardwareSensor(request.body);
                    this._sensorOptions.push(request.body);
                    var json = JSON.stringify(this._sensorOptions);
                    fs.writeFile('TFSensorOptions.json', json, 'utf8', () => console.log("Writing successful!"));


                } else {
                    sensor = new _typePhoneSensor(request.body);
                }

                if (request.body.active == true) {
                    sensor.start();
                }

                this._sensors.set(sensor.id, sensor);
                sensorsResponse = Array
                    .from(this._sensors.keys())
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
                response.set("allow", "GET, PUT");
                next(new httpError.MethodNotAllowed());
                break;
        }
    }

    lastSensorReading(request, response, next) {
        let sensor = this._sensors.get(request.params.sensor);
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

    _404(request, response) {
        response.status(404).json({
            "error": http.STATUS_CODES[404]
        })
    }
};
