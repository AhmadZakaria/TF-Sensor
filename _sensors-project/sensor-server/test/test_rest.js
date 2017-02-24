var assert = require('chai').assert;
const DummySensor = require('../../dummy-sensor/lib/DummySensor');
const Sensors = require("../lib/routes/sensors");
const http = require("http");
const httpError = require("http-errors");
const ResponseMock = require("./Mocks/ResponseMock")
const RequestMock = require("./Mocks/RequestMock")
const NextMock = require("./Mocks/NextMock")
const PhoneSensor = require('../../phone-sensor/lib/PhoneSensor');

const TFSensorOptions = require("./Mocks/TFSensorOptions")

describe('Sensor Rest Service', function () {
    describe('Sensors', function () {
        it('should return instanceof Sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            sensors.clearsensorOptions();
            sensors.clearSensors();

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

        it('CREATE phone sensor', function () {

            let sensors = new Sensors(DummySensor, PhoneSensor);

            var request = new RequestMock("POST");
            request.body = TFSensorOptions.phoneSensorOptions;

            var response = new ResponseMock();
            sensors.sensors(request, response);

            response.formatData["application/json"]();
            assert.equal(response.HTTPCODE, 201);

            request = new RequestMock("GET");
            response = new ResponseMock();

            sensors.sensors(request, response);
            response.formatData["application/json"]();

            assert.equal(response.responseData.data["sensors"].filter(i => i.id == TFSensorOptions.phoneSensorOptions.UID).length, 1);
            assert.equal(response.HTTPCODE, 200);
        });

        let phoneReadingPost = {
            "type": "Accelerometer",
            "frequency": "500",
            "UID": "androidXYZ",
            "target": "android",
            "active": "true",
            "lastReading": {
                "value": "60",
                "timestamp": "1487535337000"
            }
        };

        nowTime = Date.now();
        phoneReadingPost.lastReading.timestamp = nowTime;


        it('SEND readings from phone sensor', function () {

            let sensors = new Sensors(DummySensor, PhoneSensor);

            var request = new RequestMock("POST");
            request.body = TFSensorOptions.phoneSensorOptions;

            var response = new ResponseMock();

            sensors.sensors(request, response);


            request.body = phoneReadingPost;
            request.params.sensor = phoneReadingPost.UID;
            sensors.lastSensorReading(request, response);
            response.formatData["application/json"]();

            assert.equal(response.HTTPCODE, 201);
        });

        it('GET last reading from phone sensor', function () {
            let sensors = new Sensors(DummySensor, PhoneSensor);

            request = new RequestMock("GET");
            request.params.sensor = phoneReadingPost.UID;
            response = new ResponseMock();

            sensors.lastSensorReading(request, response);

            response.formatData["application/json"]();
            responseSensor = response.responseData.data;

            assert.isDefined(responseSensor, "has response");
            assert.equal(responseSensor.reading, phoneReadingPost.lastReading.value, "reading matches last reading sent");
            assert.equal(responseSensor.timestamp, phoneReadingPost.lastReading.timestamp, "timestamp matches last timestamp sent");
            assert.equal(response.HTTPCODE, 200);
        });

        it('should return 404', function () {
            let sensors = new Sensors(DummySensor, PhoneSensor);

            request = new RequestMock("GET");
            request.params.sensor = 'somerandomestringthatisreallynotarealsensorid';
            response = new ResponseMock();
            sensors.lastSensorReading(request, response);
            response.formatData["application/json"]();
            assert.equal(response.HTTPCODE, 404);

            response = new ResponseMock();
            sensors._404(request, response);
            assert.equal(response.HTTPCODE, 404);
        });

        it('PUT (change) sensor active status', function () {
            let sensors = new Sensors(DummySensor, PhoneSensor);

            request = new RequestMock("PUT");
            request.params.sensor = phoneReadingPost.UID;
            request.body.active = false;
            response = new ResponseMock();
            sensors.sensorOptionsActive(request, response);
            response.formatData["application/json"]();
            assert.equal(response.HTTPCODE, 200);
            assert.equal(response.responseData.data.active, false);

        });

        it('GET sensor active status', function () {
            let sensors = new Sensors(DummySensor, PhoneSensor);

            request = new RequestMock("GET");
            request.params.sensor = phoneReadingPost.UID;
            response = new ResponseMock();
            sensors.sensorOptionsActive(request, response);
            response.formatData["application/json"]();
            assert.equal(response.HTTPCODE, 200);
            assert.equal(response.responseData.data.active, false);

        });


    });

    describe('Sensor', function () {
        it('GET 1 sensor', function () {
            let sensors = new Sensors(DummySensor, DummySensor);


            //Getting Sensor Details
            request = new RequestMock("GET");
            request.params = {
                sensor: TFSensorOptions.temperatureSensorOptions.UID
            }


            response = new ResponseMock();
            next = new NextMock();



            sensors.sensor(request, response, next.next);


            response.formatData["application/json"]();

            assert.equal(response.responseData.data.id, TFSensorOptions.temperatureSensorOptions.UID);

        });
    });
});
