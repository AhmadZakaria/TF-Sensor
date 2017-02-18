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
        callbackEvent: BrickletTemperature.CALLBACK_TEMPERATURE,
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
        active: true
    },

    ambientLightSensorOptions: {
        type: "Ambient Sensor",
        //sensor constructor
        ctor: BrickletAmbientLightV2,
        //sensor measurement normalization factor
        normFact: 100.0,
        //sensor callback event type
        callbackEvent: BrickletAmbientLightV2.CALLBACK_ILLUMINANCE,
        //sensor callback period function type
        frequency: 500,
        // callback function name
        periodFunc: 'setIlluminanceCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getIlluminance',
        // sensor UID
        UID: 'yih'
    },

    humiditySensorOptions: {
        type: "Humidity Sensor",
        //sensor constructor
        ctor: BrickletHumidity,
        //sensor measurement normalization factor
        normFact: 10.0,
        //sensor callback event type
        callbackEvent: BrickletHumidity.CALLBACK_HUMIDITY,
        //sensor callback period function type
        frequency: 500,
        // callback function name
        periodFunc: 'setHumidityCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getHumidity',
        // sensor UID
        UID: 'xDM'
    },
    soundSensorOptions: {
        type: "Sound Intensity Sensor",
        //sensor constructor
        ctor: BrickletSoundIntensity,
        //sensor measurement normalization factor
        normFact: 1.0,
        //sensor callback event type
        callbackEvent: BrickletSoundIntensity.CALLBACK_INTENSITY,
        //sensor callback period function type
        frequency: 500,
        // callback function name
        periodFunc: 'setIntensityCallbackPeriod',
        // direct get measurement function name
        simpleFunc: 'getIntensity',
        // sensor UID
        UID: 'vqY'
    }

};
module.exports = TFSensorOptions;
