'use strict';

const Sensor = require('generic-sensor-api').Sensor;
const TFSensorReading = require('./TFSensorReading');
const Tinkerforge = require('tinkerforge');

const HOST = 'localhost';
const PORT = 4223;
const UID = 'yih';

module.exports = class TFSensor extends Sensor {

  constructor(sensorOptions) {
    super(sensorOptions);
    this._intervalHandle = null;
    this.ipcon = new Tinkerforge.IPConnection(); // Create IP connection
    this.lastReading = null;

    this.al = new Tinkerforge.BrickletAmbientLightV2(UID, this.ipcon); // Create device object
    this.al.on(Tinkerforge.BrickletAmbientLightV2.CALLBACK_ILLUMINANCE,
        // Callback function for illuminance callback (parameter has unit Lux/100)
         (illuminance)=> {
            // console.log('Illuminance: ' + illuminance/100.0 + ' Lux');
            this.lastReading = illuminance/100.0;
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
         (connectReason)=> {
          this.al.setIlluminanceCallbackPeriod(this.sensorOptions.frequency);
        }
    );


    return new Promise((resolve, reject) => {
      this._intervalHandle = setInterval(
          () => {
              let tfSensorReading = new TFSensorReading(
                  Date.now(),
                  this.lastReading
              )
              this.onchange({
                  reading: tfSensorReading
              });
          },
          this.sensorOptions.frequency
      );
      resolve();
    });
  }

  handleStopped() {
      return new Promise((resolve, reject) => {
        clearInterval(this._intervalHandle);
        this.ipcon.disconnect();
        resolve();
      });
  }
}
