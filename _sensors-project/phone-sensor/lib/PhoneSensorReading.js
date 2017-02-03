'use strict';
const SensorReading = require('generic-sensor-api').SensorReading;

module.exports = class PhoneSensorReading extends SensorReading {
  constructor(timestamp, value) {
    super(timestamp);
    this._phoneValue = value;
  }

  get _phoneValue() {
    return this._dummyValue;
  }
  set _phoneValue(value) {
    this._dummyValue = value;
  }
}
