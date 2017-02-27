"use strict";

const parser = require("body-parser");
const Sensors = require("./routes/sensors");
const DefaultRouter = require("./DefaultRouter");
const TFSensor = require('tf-sensor/lib/TFSensor');
const PhoneSensor = require('phone-sensor/lib/PhoneSensor');
const DummySensor = require('dummy-sensor/lib/DummySensor');


module.exports = class APIRouter extends require("express").Router {
    constructor(opts) {
        super(opts || APIRouter.defaultOptions());

        this._sensors = new Sensors(TFSensor,PhoneSensor); //Mocked to use DummySensor :-) for testing at home

        this.all("/sensors/:sensor/sensorReadings/latest", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), this._sensors.lastSensorReading);
        this.all("/sensors/:sensor/sensorOptions/active", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), this._sensors.sensorOptionsActive);
        this.all("/sensors/:sensor", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), this._sensors.sensor);
        this.all("/sensors", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), this._sensors.sensors);

        /* ===== 404 Error handling ===== */
        this.use(this._sensors._404);
    }

    static defaultOptions() {
        return {
            "caseSensitive": true,
            "strict": true
        };
    }
};
