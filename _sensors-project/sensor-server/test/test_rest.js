var assert = require('assert');
const DummySensor = require('../../dummy-sensor/lib/DummySensor');
const Sensors = require("../lib/routes/sensors");
const http = require("http");
const ResponseMock = require("./Mocks/ResponseMock")
const RequestMock = require("./Mocks/RequestMock")
const TFSensorOptions = require("./Mocks/TFSensorOptions")

describe('Sensor Rest Service', function () {
    describe('Sensors', function () {
        it('should return instanceof Sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            assert.equal(sensors instanceof Sensors, true);
        });
        it('GET 0 Sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            var request = new RequestMock("GET");
            var response = new ResponseMock();


            sensors.sensors(request, response);

            response.formatData["application/json"]();

            assert.equal(response.responseData.data["sensors"].length, 0);
        });
        it('GET 1 sensor', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            var request = new RequestMock("POST");
            request.body = TFSensorOptions.temperatureSensorOptions;

            var response = new ResponseMock();

            sensors.sensors(request, response);

            response.formatData["application/json"]();

            assert.equal(response.responseData.data[0].id, request.body.UID);
            assert.equal(response.HTTPCODE, 201);
        });
        it('GET 2 sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            var request = new RequestMock("POST");
            request.body = TFSensorOptions.ambientLightSensorOptions;

            var response = new ResponseMock();

            sensors.sensors(request, response);

            request = new RequestMock("GET");
            response = new ResponseMock();


            sensors.sensors(request, response);

            response.formatData["application/json"]();

            assert.equal(response.responseData.data["sensors"].length, 2);
            assert.equal(response.HTTPCODE, 200);
        });
    });
    describe('Sensor', function () {
        it('GET 1 sensor', function () {
            let sensors = new Sensors(DummySensor, DummySensor);

         
            //Getting Sensor Details
            request = new RequestMock("GET");
            request.params = {
                sensor: {
                    id: TFSensorOptions.temperatureSensorOptions.UID,
                    type: TFSensorOptions.temperatureSensorOptions.type,
                    frequency: TFSensorOptions.temperatureSensorOptions.frequency
                }
            }


            response = new ResponseMock();

            sensors.sensor(request, response);

            response.formatData["application/json"]();

            assert.equal(response.HTTPCODE, 200);

        });
    });
});