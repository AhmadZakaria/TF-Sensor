const assert = require('chai').assert;
const chai = require('chai');
const chaiHttp = require('chai-http');
const DummySensor = require('../../dummy-sensor/lib/DummySensor');
const Sensors = require("../lib/routes/sensors");
const http = require("http");
const httpError = require("http-errors");
const ResponseMock = require("./Mocks/ResponseMock")
const RequestMock = require("./Mocks/RequestMock")
const NextMock = require("./Mocks/NextMock")
const TFSensor = require('../../tf-sensor/lib/TFSensor');
const PhoneSensor = require('../../phone-sensor/lib/PhoneSensor');

const index = require("../index");
// let app = index.app;

const TFSensorOptions = require("./Mocks/TFSensorOptions")
process.env.NODE_ENV = 'test';
let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const cluster = require("cluster");
const path = require("path");

const config = require(path.join(__dirname, "../config", "start.json"));
const pkg = require(path.join(__dirname, "../package.json"));
let app;
process.title = pkg.name;
config.basedir = __dirname + "/../";
if (config.http.secure) {
    let https = require("https");
    https.globalAgent.maxSockets = 16384;
    https.globalAgent.options.agent = false;
}
else {
    let http = require("http");
    http.globalAgent.maxSockets = 16384;
    http.globalAgent.options.agent = false;
}

app = new (require("../lib/DefaultApp"))({ id: "worker1" }, pkg, config);
let server = app.start();



// let server = "http://0.0.0.0:8080";
var agent = chai.request.agent(server);
// console.log(app);
describe('Sensor Rest Service', function () {
    describe('Sensors', function () {
        it('should return instanceof Sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            // sensors.clearsensorOptions();
            // sensors.clearSensors();

            assert.equal(sensors instanceof Sensors, true);
        });

        it('GET 0 Sensors _ chai', (done) => {
            agent
                .get('/api/sensors')
                .end((err, res) => {
                    res.body.sensors.length.should.be.eq(4);
                    done();
                });
        });

        it('GET 0 Sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            var request = new RequestMock("GET");
            var response = new ResponseMock();


            sensors.sensors(request, response, () => { });

            response.formatData["application/json"]();

            assert.equal(response.responseData.data["sensors"].length, 0);
        });
        it('GET 1 sensor', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            var request = new RequestMock("POST");
            request.body = TFSensorOptions.temperatureSensorOptions;

            var response = new ResponseMock();

            sensors.sensors(request, response, () => { });

            response.formatData["application/json"]();

            assert.equal(response.responseData.data[0].id, request.body.UID);
            assert.equal(response.HTTPCODE, 201);
        });
        it('GET 2 sensors', function () {

            let sensors = new Sensors(DummySensor, DummySensor);

            var request = new RequestMock("POST");
            request.body = TFSensorOptions.ambientLightSensorOptions;

            var response = new ResponseMock();

            sensors.sensors(request, response, () => { });

            request = new RequestMock("GET");
            response = new ResponseMock();


            sensors.sensors(request, response, () => { });

            response.formatData["application/json"]();

            assert.equal(response.responseData.data["sensors"].length, 2);
            assert.equal(response.HTTPCODE, 200);
        });

        it('CREATE phone sensor', function (done) {
            agent
                .post('/api/sensors')
                .send(TFSensorOptions.phoneSensorOptions)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });

        it('GET phone sensor', function (done) {
            agent
                .get('/api/sensors')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    // console.log(res.body)
                    assert.lengthOf(res.body.sensors.filter(i => i.id == TFSensorOptions.phoneSensorOptions.UID), 1);
                    res.should.have.status(200);
                    res.body.sensors.filter(i => i.id == TFSensorOptions.phoneSensorOptions.UID).length.should.eq(1);
                    done();
                });
        });


        let phoneReadingPost = {
            "type": "Accelerometer",
            "frequency": "500",
            "UID": "androidXYZ",
            "target": "android",
            "active": "true",
            "lastReading": {
                "value": 60,
                "timestamp": "1487535337000"
            }
        };

        nowTime = Date.now();
        phoneReadingPost.lastReading.timestamp = nowTime;

        it('SEND readings from phone sensor', function (done) {
            agent
                .post('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorReadings/latest')
                // .set("content-type", "application/json")
                .send(phoneReadingPost)
                .end((err, res) => {
                    // if (err)
                    // console.log(res.body)
                    res.should.have.status(201);
                    done();
                });
        });

        it('GET last reading from phone sensor', function (done) {
            agent
                .get('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorReadings/latest')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('reading');
                    r = res.body;
                    // console.log(res.body)
                    r.reading.should.eq(phoneReadingPost.lastReading.value);
                    r.timestamp.should.eq(phoneReadingPost.lastReading.timestamp);
                    done();
                });
        });


        it('should return 404', function (done) {
            agent
                .get('/api/sensors/somerandomestringthatisreallynotarealsensorid')
                .set("accept", "application/json")
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should return 404', function (done) {
            agent
                .post('/api/sensors/' + "somerandomestringthatisreallynotarealsensorid" + 'androidXYZ/sensorReadings/latest')
                .send(phoneReadingPost)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });



        it('PUT (change) sensor active status', function () {
            let sensors = new Sensors(DummySensor, PhoneSensor);

            request = new RequestMock("PUT");
            request.params.sensor = phoneReadingPost.UID;
            request.body.active = false;
            response = new ResponseMock();
            sensors.sensorOptionsActive(request, response, () => { });
            response.formatData["application/json"]();
            assert.equal(response.HTTPCODE, 200);
            assert.equal(response.responseData.data.active, false);
        });

        it('GET sensor active status', function () {
            let sensors = new Sensors(DummySensor, PhoneSensor);

            request = new RequestMock("GET");
            request.params.sensor = phoneReadingPost.UID;
            response = new ResponseMock();
            sensors.sensorOptionsActive(request, response, () => { });
            response.formatData["application/json"]();
            assert.equal(response.HTTPCODE, 200);
            assert.equal(response.responseData.data.active, false);
        });

        it('2GET sensor active status', (done) => {
            agent
                .get('/api/sensors/' + phoneReadingPost.UID + '/sensorOptions/active')
                .end((err, res) => {
                    // console.log(res)
                    res.should.have.status(200);
                    res.body.should.have.property('active');
                    res.body.active.should.be.eql(false);
                    done();
                });
        });

        it('should disallowed delete method with sensor active status', (done) => {
            agent
                .delete('/api/sensors/androidXYZ/sensorOptions/active')
                .end((err, res) => {
                    // console.log(res)
                    res.should.have.status(405);
                    // res.body.should.be.a('array');
                    // res.body.length.should.be.eql(0);
                    done();
                });
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


    describe('Default Router', function () {

        it('should return dashboard', function (done) {
            agent
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('should return dashboard', function (done) {
            agent
                .get('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('should return license', function (done) {
            agent
                .get('/license.html')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        // it('should return system', function (done) {
        //     agent
        //         .get('/system.html')
        //         .end((err, res) => {
        //             res.should.have.status(200);
        //             done();
        //         });
        // });

        it('should return 404', function (done) {
            agent
                .get('/dashboard')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should return 405', function (done) {
            agent
                .del('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
        it('should return 405', function (done) {

            agent
                .head('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
        it('should return 405', function (done) {
            agent
                .options('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
        it('should return 405', function (done) {
            agent
                .put('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
        it('should return 405', function (done) {
            agent
                .trace('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
        it('should return 405', function (done) {
            agent
                .post('/dashboard.html')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
        it('should return error', function (done) {
            agent
                .get('/error.html')
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });
    });

});
