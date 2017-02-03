'use strict';
const SensorReading = require('generic-sensor-api').SensorReading;

module.exports = class PhoneSensorReading extends SensorReading {
  constructor(timestamp, value) {
    super(timestamp);
    this._value = value;
  }

  get _value() {
    return this._value;
  }
  set _value(value) {
    this._value = value;
  }
}
