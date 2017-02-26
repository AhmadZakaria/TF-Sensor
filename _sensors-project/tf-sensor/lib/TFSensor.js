'use strict';

const Sensor = require('../../generic-sensor-api').Sensor;
const TFSensorReading = require('./TFSensorReading');
const Tinkerforge = require('tinkerforge');

const HOST = '0.0.0.0';
const PORT = 4223;

module.exports = class TFSensor extends Sensor {

    constructor(sensorOptions) {
        super(sensorOptions);
        this._intervalHandle = null;
        this.ipcon = new Tinkerforge.IPConnection(); // Create IP connection
        this.lastReading = { timestamp: null, value: null };
        this.lastReadingTime = null;
        this.lastBroadcastTime = null;
        this._target = this.sensorOptions.target;
        this._type = this.sensorOptions.type;
        this._unit = this.sensorOptions.unit;
        this._id = this.sensorOptions.UID;
        this.sen = new Tinkerforge[sensorOptions.ctor](this.sensorOptions.UID, this.ipcon); // Create device object
        this.sen.on(Tinkerforge[sensorOptions.ctor][sensorOptions.callbackEvent],
            // Callback function for illuminance callback (parameter has unit Lux/100)
            (measurement) => {
                this.lastReading = measurement / this.sensorOptions.normFact
                // console.log(this._type+': ' + this.lastReading + ' Lux');
            }
        );

    }

    handleStarted() {
        this.ipcon.connect(HOST, PORT,
            function (error) {
                console.log('Error: ' + error);
            }
        ); // Connect to brickd
        // Don't use device before ipcon is connected

        this.ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
            (connectReason) => {
                // set callback for periodic measurement
                let periodFunc = this.sensorOptions.periodFunc
                this.sen[periodFunc](this.sensorOptions.frequency);

                // get first reading
                this.sen[this.sensorOptions.simpleFunc](
                    (measurement) => {
                        //    console.log('Illuminance: ' + measurement/100.0 + ' Lux');
                        this.lastReading = measurement / this.sensorOptions.normFact
                        let nowTime = Date.now();
                        this.lastReadingTime = nowTime;
                    }, () => { }
                );
                return new Promise((resolve, reject) => {
                    this._intervalHandle = setInterval(
                        () => {
                            if (this.lastBroadcastTime != this.lastReadingTime) { // new un-broadcasted reading
                                let tfSensorReading = new TFSensorReading(
                                    this.lastReadingTime,
                                    this.lastReading
                                )

                                this.onchange({
                                    reading: tfSensorReading
                                });
                                this.lastBroadcastTime = this.lastReadingTime; // mark reading as broadcasted
                            }
                        },
                        this.sensorOptions.frequency
                    );
                    resolve();
                });

            }
        );



    }

    handleStopped() {
        return new Promise((resolve, reject) => {
            clearInterval(this._intervalHandle);
            this.ipcon.disconnect();
            resolve();
        });
    }
}
