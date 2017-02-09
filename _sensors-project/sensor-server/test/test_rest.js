var assert = require('assert');
const DummySensor = require('../../dummy-sensor/lib/DummySensor');
const Sensors = require("../lib/routes/sensors");
const http = require("http");
const ResponseMock = require("./Mocks/ResponseMock")
const RequestMock = require("./Mocks/RequestMock")
const TFSensorOptions = require("./Mocks/TFSensorOptions")

describe('Sensor Rest Service', function () {
    it('should return instanceof Sensors', function () {

        let sensors = new Sensors(DummySensor, DummySensor);

        assert.equal(sensors instanceof Sensors, true);
    });
    it('should return 0 Sensors', function () {

        let sensors = new Sensors(DummySensor, DummySensor);

        var request = new RequestMock("GET");
        var response = new ResponseMock();


        sensors.sensors(request, response);

        response.formatData["application/json"]();

        assert.equal(response.responseData.data["sensors"].length,0);
    });
    it('add one sensor', function () {

        let sensors = new Sensors(DummySensor, DummySensor);

        var request = new RequestMock("POST");
        request.body = TFSensorOptions.temperatureSensorOptions;

        var response = new ResponseMock();

        sensors.sensors(request, response);

        response.formatData["application/json"]();        

        assert.equal(response.responseData.data[0].id,request.body.UID);
        assert.equal(response.HTTPCODE,201);
    });
     it('get list with two sensor', function () {

        let sensors = new Sensors(DummySensor, DummySensor);

        var request = new RequestMock("POST");
        request.body = TFSensorOptions.temperatureSensorOptions;

        var response = new ResponseMock();

        sensors.sensors(request, response);

        request = new RequestMock("POST");
        request.body = TFSensorOptions.ambientLightSensorOptions;

        response = new ResponseMock();

        sensors.sensors(request, response);

        request = new RequestMock("GET");
        response = new ResponseMock();


        sensors.sensors(request, response);

        response.formatData["application/json"]();

        assert.equal(response.responseData.data["sensors"].length,2);
        assert.equal(response.HTTPCODE,200);
    });

});