'use strict';
const SensorReading = require('../../generic-sensor-api').SensorReading;

module.exports = class TFSensorReading extends SensorReading {
  constructor(timestamp, value) {
    super(timestamp);
    this._value = value;
  }

  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }
}
