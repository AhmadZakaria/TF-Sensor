'use strict';
const TFSensor = require('./lib/TFSensor');
const Tinkerforge = require('tinkerforge');
const TFSensorOptions = require('./lib/TFSensorOptions');


for (var opts in TFSensorOptions) {
    let sensor = new TFSensor(TFSensorOptions[opts]);

    sensor.onactivate = event => console.log('activated');
    sensor.onchange = event => console.log(
        `${new Date(event.reading.timestamp).toLocaleTimeString()} ${event.reading.tfValue}`
    );
    sensor.start();
    setTimeout(
        () => {
            sensor.stop();
        },
        5000
    );
}
