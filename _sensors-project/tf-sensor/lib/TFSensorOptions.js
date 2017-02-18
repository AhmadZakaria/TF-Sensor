'use strict';
const Tinkerforge = require('tinkerforge');

var TFSensorOptions = {

    temperatureSensorOptions: {
        type: "Temperature Sensor",
        //sensor constructor
        ctor: BrickletTemperature,
        //sensor measurement normalization factor
        normFact: 100.0,
        //sensor callback event type
        callbackEvent: CALLBACK_TEMPERATURE,
        //sensor callback period function type
        frequency: 500,
        // periodic callback function name
        periodFunc: 'setTemperatureCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getTemperature',
        // sensor UID
        UID: 'tkw',
        //
        target: 'Tinkerforge',
        //
        active: true,
        unit: "°C"
    },

    ambientLightSensorOptions: {
        type: "Ambient Sensor",
        //sensor constructor
        ctor: BrickletAmbientLightV2,
        //sensor measurement normalization factor
        normFact: 100.0,
        //sensor callback event type
        callbackEvent: CALLBACK_ILLUMINANCE,
        //sensor callback period function type
        frequency: 500,
        // callback function name
        periodFunc: 'setIlluminanceCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getIlluminance',
        // sensor UID
        UID: 'yih',
        unit: "lux"
    },

    humiditySensorOptions: {
        type: "Humidity Sensor",
        //sensor constructor
        ctor: BrickletHumidity,
        //sensor measurement normalization factor
        normFact: 10.0,
        //sensor callback event type
        callbackEvent: CALLBACK_HUMIDITY,
        //sensor callback period function type
        frequency: 500,
        // callback function name
        periodFunc: 'setHumidityCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getHumidity',
        // sensor UID
        UID: 'xDM',
        unit: "%"

    },
    soundSensorOptions: {
        type: "Sound Intensity Sensor",
        //sensor constructor
        ctor: BrickletSoundIntensity,
        //sensor measurement normalization factor
        normFact: 1.0,
        //sensor callback event type
        callbackEvent: CALLBACK_INTENSITY,
        //sensor callback period function type
        frequency: 500,
        // callback function name
        periodFunc: 'setIntensityCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getIntensity',
        // sensor UID
        UID: 'vqY',
        unit: "W/m^2"
    }

};
module.exports = TFSensorOptions;
