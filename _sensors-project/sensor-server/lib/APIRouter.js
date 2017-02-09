"use strict";

const parser = require("body-parser");
const Sensors = require("./routes/sensors");
const DefaultRouter = require("./DefaultRouter");
const TFSensor = require('../../tf-sensor/lib/TFSensor');
const PhoneSensor = require('../../phone-sensor/lib/PhoneSensor');

module.exports = class APIRouter extends require("express").Router {
    constructor(opts) {
        super(opts || APIRouter.defaultOptions());

        this._sensors = new Sensors(TFSensor,PhoneSensor);

        this.all("/sensors/:sensor/sensorReadings/latest", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), _sensors.lastSensorReading);
        this.all("/sensors/:sensor", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), _sensors.sensor);
        this.all("/sensors", DefaultRouter.xPoweredBy,
            parser.json({
                "inflate": true,
                "strict": true
            }), _sensors.sensors);

        /* ===== 404 Error handling ===== */
        this.use(_sensors._404);
    }

    static defaultOptions() {
        return {
            "caseSensitive": true,
            "strict": true
        };
    }
};
