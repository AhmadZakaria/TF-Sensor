var assert = require('assert');
const DummySensor = require('../../dummy-sensor/lib/DummySensor');
const Sensors = require("../lib/routes/sensors");
const http = require("http");
const ResponseMock = require("./Mocks/ResponseMock")
const RequestMock = require("./Mocks/RequestMock")

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
});