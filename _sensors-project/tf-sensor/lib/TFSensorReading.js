'use strict';
const SensorReading = require('generic-sensor-api').SensorReading;

module.exports = class TFSensorReading extends SensorReading {
  constructor(timestamp, value) {
    super(timestamp);
    this._tfValue = value;
  }

  get tfValue() {
    return this._tfValue;
  }
  set tfValue(value) {
    this._tfValue = value;
  }
}
