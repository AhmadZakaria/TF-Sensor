"use strict";

const uuid = require("uuid");
const httpError = require("http-errors");
const http = require("http");
const DummySensor = require("dummy-sensor").DummySensor;
const TFSensor = require('../../../tf-sensor/lib/TFSensor');
const TFSensorOptions = require('../../../tf-sensor/lib/TFSensorOptions');


let sensors = new Map();
for (var opts in TFSensorOptions) {
    let sensor = new TFSensor(TFSensorOptions[opts]);

    sensor.onactivate = event => console.log('activated');
    sensor.onchange = event => {
        console.log(
            `${new Date(event.reading.timestamp).toLocaleTimeString()} ${event.reading.tfValue}`
        );
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
          type: sensor.Type
            // reading: sensor.reading.tfValue,
            // timestamp: sensor.reading.timestamp
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

    static lastSensorReading(request, response, next) {
        let sensor = sensors.get(request.params.sensor);
        let sensorResponse = {
            reading: sensor.reading.tfValue,
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
