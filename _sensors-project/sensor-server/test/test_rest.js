"use strict";
const assert = require('chai').assert;
const chaiHttp = require('chai-http');
const Sensors = require("../lib/routes/sensors");
const http = require("http");
const httpError = require("http-errors");
const ResponseMock = require("./Mocks/ResponseMock")
const RequestMock = require("./Mocks/RequestMock")
const NextMock = require("./Mocks/NextMock")
const TFSensor = require('../../tf-sensor/lib/TFSensor');
const PhoneSensor = require('../../phone-sensor/lib/PhoneSensor');

const WebSocket = require('ws');

const chai = require('chai');
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

if (cluster.isMaster && !module.parent.parent)
    cluster.fork();
else {
    app = new (require("../lib/DefaultApp"))(cluster.Worker(), pkg, config);
}

let server = app.start();
var agent = chai.request.agent(server);

// let server = "http://0.0.0.0:8080";
// console.log(app);
describe('Sensor Rest Service', function () {
    describe('Sensors', function () {

        it('get sensors', (done) => {
            agent
                .get('/api/sensors')
                .end((err, res) => {
                    res.body.sensors.length.should.be.eq(4);
                    done();
                });
        });

        // it('GET 0 Sensors', function () {

        //     let sensors = new Sensors(DummySensor, DummySensor);

        //     var request = new RequestMock("GET");
        //     var response = new ResponseMock();


        //     sensors.sensors(request, response, () => { });

        //     response.formatData["application/json"]();

        //     assert.equal(response.responseData.data["sensors"].length, 0);
        // });
        // it('GET 1 sensor', function () {

        //     let sensors = new Sensors(DummySensor, DummySensor);

        //     var request = new RequestMock("POST");
        //     request.body = TFSensorOptions.temperatureSensorOptions;

        //     var response = new ResponseMock();

        //     sensors.sensors(request, response, () => { });

        //     response.formatData["application/json"]();

        //     assert.equal(response.responseData.data[0].id, request.body.UID);
        //     assert.equal(response.HTTPCODE, 201);
        // });
        // it('GET 2 sensors', function () {

        //     let sensors = new Sensors(DummySensor, DummySensor);

        //     var request = new RequestMock("POST");
        //     request.body = TFSensorOptions.ambientLightSensorOptions;

        //     var response = new ResponseMock();

        //     sensors.sensors(request, response, () => { });

        //     request = new RequestMock("GET");
        //     response = new ResponseMock();


        //     sensors.sensors(request, response, () => { });

        //     response.formatData["application/json"]();

        //     assert.equal(response.responseData.data["sensors"].length, 2);
        //     assert.equal(response.HTTPCODE, 200);
        // });

        it('CREATE deactivated TF sensor', function (done) {
            let senOpts = TFSensorOptions.soundSensorOptions;
            senOpts.UID = "asde";
            senOpts.active = false;
            agent
                .post('/api/sensors')
                .send(senOpts)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
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

        it('DELETE an existing sensor', function (done) {
            agent
                .del('/api/sensors/' + "asde")
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('DELETE a non-existing sensor', function (done) {
            agent
                .del('/api/sensors/' + "somerandomestringthatisreallynotarealsensorid")
                .end((err, res) => {
                    res.should.have.status(404);
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
                .send(TFSensorOptions.phoneSensorOptions)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });



        it('Deactivate existing sensor', function (done) {
            agent
                .put('/api/sensors/' + TFSensorOptions.humiditySensorOptions.UID + '/sensorOptions/active')
                .send({ active: false })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('active');
                    res.body.active.should.eq(false);

                    done();
                });
        });

        it('Activate existing sensor', function (done) {
            agent
                .put('/api/sensors/' + TFSensorOptions.humiditySensorOptions.UID + '/sensorOptions/active')
                .send({ active: true })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('active');
                    res.body.active.should.eq(true);

                    done();
                });
        });

        it('Activate non-existing sensor', function (done) {
            agent
                .put('/api/sensors/' + "somerandomUID" + '/sensorOptions/active')
                .send({ active: false })
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('Activate non-existing sensor', function (done) {
            agent
                .put('/api/sensors/' + "somerandomUID" + '/sensorOptions/active')
                .set("accept", "application/pdf")
                .send({ active: false })
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('GET sensor active status', function (done) {
            agent
                .get('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorOptions/active')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('active');
                    res.body.active.should.eq(true);

                    done();
                });
        });

        it('should disallowed delete method with sensor active status', (done) => {
            agent
                .del('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorOptions/active')
                .end((err, res) => {
                    // console.log(res)
                    res.should.have.status(405);
                    // res.body.should.be.a('array');
                    // res.body.length.should.be.eql(0);
                    done();
                });
        });



    });

    describe('lastSensorReading', function () {

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

        let nowTime = Date.now();
        phoneReadingPost.lastReading.value = 70;
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

        it('SEND readings from phone sensor, with wrong accept type', function (done) {
            agent
                .post('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorReadings/latest')
                .set("accept", "application/pdf")
                .send(phoneReadingPost)
                .end((err, res) => {
                    res.should.have.status(406);
                    done();
                });
        });

        it('GET last reading from phone sensor', function (done) {
            agent
                .get('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorReadings/latest')
                .set("accept", "application/json")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('value');
                    let r = res.body;
                    // console.log(res.body)
                    r.value.should.eq(phoneReadingPost.lastReading.value);
                    r.timestamp.should.eq(phoneReadingPost.lastReading.timestamp);
                    done();
                });
        });

        it('GET last reading from phone sensor, with wrong accept type', function (done) {
            agent
                .get('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorReadings/latest')
                .set("accept", "application/pdf")
                .end((err, res) => {
                    res.should.have.status(406);
                    done();
                });
        });
    });

    describe('Sensor', function () {

        it('GET 1 sensor', (done) => {
            agent
                .get('/api/sensors/' + TFSensorOptions.humiditySensorOptions.UID)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('id');
                    res.body.id.should.be.eql(TFSensorOptions.humiditySensorOptions.UID);
                    done();
                });
        });

        it('PUT change tf-sensor frequency', (done) => {
            let newOpts = TFSensorOptions.humiditySensorOptions;
            newOpts.frequency = '600';

            agent
                .put('/api/sensors/' + TFSensorOptions.humiditySensorOptions.UID)
                .set("content-type", "application/json")
                .send(newOpts)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    done();
                });
        });

        it('GET changed tf-sensor frequency', (done) => {
            agent
                .get('/api/sensors/' + TFSensorOptions.humiditySensorOptions.UID)
                .end((err1, res1) => {
                    res1.should.have.status(200);
                    res1.body.should.have.property('frequency');
                    assert.equal(res1.body.frequency, 600);
                    done();
                });
        });

        it('PUT change phone-sensor frequency', (done) => {
            let newOpts = TFSensorOptions.phoneSensorOptions;
            newOpts.frequency = '300';

            agent
                .put('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID)
                .set("content-type", "application/json")
                .send(newOpts)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    done();
                });
        });

        it('GET changed phone-sensor frequency', (done) => {
            agent
                .get('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID)
                .end((err1, res1) => {
                    res1.should.have.status(200);
                    res1.body.should.have.property('frequency');
                    assert.equal(res1.body.frequency, 300);
                    done();
                });
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

        it('should return 404', function (done) {
            agent
                .get('/dashboard')
                .end((err, res) => {
                    res.should.have.status(404);
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

        describe('Test unallowed verbs', function () {

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
        });
    });


    describe('Testing websockets', function () {

        var connected = false;
        var ws;
        beforeEach(function (done) {
            // chai.request.abort();
            // Setup
            ws = new WebSocket('ws://0.0.0.0:8888', {
                origin: 'http://0.0.0.0/'
            });

            ws.on('open', function open() {
                // console.log('connected');
                connected = true;
                done();
            });

            ws.on('close', function close() {
                // console.log('disconnected');
            });


        });

        afterEach(function (done) {
            // Cleanup
            if (connected) {
                // console.log('disconnecting...');
                ws.close();
                done();
            } else {
                // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
                // console.log('no connection to break...');
                done();
            }

        });


        let dataToSend = {
            "lastReading": {
                "value": 60,
                "timestamp": 1487538472000
            }
        };

        let nowTime = Date.now();
        dataToSend.lastReading.timestamp = nowTime;

        it('should receive data via websocket after posting from phone', function (done) {
            let dataToSend = {
                "lastReading": {
                    "value": 60,
                    "timestamp": 1487538472000
                }
            };

            nowTime = Date.now();
            dataToSend.lastReading.timestamp = nowTime;

            ws.on('message', function incoming(data, flags) {
                // console.log(data);
                data = JSON.parse(data)
                data.should.have.property("reading");
                data.should.have.property("timestamp");
                data.reading.should.eq(dataToSend.lastReading.value);
                data.timestamp.should.eq(dataToSend.lastReading.timestamp);
                done();
            });

            agent
                .post('/api/sensors/' + TFSensorOptions.phoneSensorOptions.UID + '/sensorReadings/latest')
                .send(dataToSend)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(201);
                });
        });

    });

});
