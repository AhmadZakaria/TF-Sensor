'use strict';

const Sensor = require('../../generic-sensor-api').Sensor;
const PhoneSensorReading = require('./PhoneSensorReading');

module.exports = class PhoneSensor extends Sensor {

    constructor(sensorOptions) {
        super(sensorOptions);
        this.lastReading = { timestamp: null, value: null };
        this._target = this.sensorOptions.target;
        this._type = this.sensorOptions.type;
        this._id = this.sensorOptions.UID;
        this._unit = this.sensorOptions.unit;
        this._intervalHandle = null;
    }

    handleStarted() {
        return new Promise((resolve, reject) => {
            this._intervalHandle = setInterval(
                () => {
                    let phoneSensorReading = new PhoneSensorReading(
                        Date.now(),
                        this.lastReading
                    )
                    this.onchange({
                        reading: phoneSensorReading
                    });
                },
                this.sensorOptions.frequency
            );
            resolve();
        });
    };

    handleStopped() {
        return new Promise((resolve, reject) => {
            clearInterval(this._intervalHandle);
            resolve();
        });
    };

}
