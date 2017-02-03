'use strict';

const Sensor = require('generic-sensor-api').Sensor;
const TFSensorReading = require('./TFSensorReading');
const Tinkerforge = require('tinkerforge');

const HOST = 'localhost';
const PORT = 4223;

module.exports = class TFSensor extends Sensor {

  constructor(sensorOptions) {
    super(sensorOptions);
    this._intervalHandle = null;
    this.ipcon = new Tinkerforge.IPConnection(); // Create IP connection
    this.lastReading = null;
    this._target = this.sensorOptions.target;
    this._type = this.sensorOptions.type;
    this._id = this.sensorOptions.UID;
    this.sen = new Tinkerforge[sensorOptions.ctor](this.sensorOptions.UID, this.ipcon); // Create device object
    this.sen.on(Tinkerforge[sensorOptions.ctor][sensorOptions.callbackEvent],
        // Callback function for illuminance callback (parameter has unit Lux/100)
         (measurement)=> {
            this.lastReading = measurement/this.sensorOptions.normFact
            console.log(this._type+': ' + this.lastReading + ' Lux');
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
           // set callback for periodic measurement
          let periodFunc = this.sensorOptions.periodFunc
          this.sen[periodFunc](this.sensorOptions.frequency);

          // get first reading
          this.sen[this.sensorOptions.simpleFunc](
            (measurement)=> {
               // console.log('Illuminance: ' + illuminance/100.0 + ' Lux');
               this.lastReading = measurement/this.sensorOptions.normFact
           }, ()=>{}
          );
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
