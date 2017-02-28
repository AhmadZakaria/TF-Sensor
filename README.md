# Sensors Project
This project provides a web interface/dashboard for a variety of Tinkerforge sensors, as well as other mobile devices. The project was developed as a part of "Development of modern web-based distributed application" lab at the Bonn-Aachen International Center for Information Technology (b-it).

[![Build Status](https://travis-ci.org/AhmadZakaria/TF-Sensor.svg?branch=master)](https://travis-ci.org/AhmadZakaria/TF-Sensor) [![Coverage Status](https://coveralls.io/repos/github/AhmadZakaria/TF-Sensor/badge.svg?branch=master)](https://coveralls.io/github/AhmadZakaria/TF-Sensor?branch=master)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

```sh
git clone git@github.com:AhmadZakaria/TF-Sensor.git
cd TF-Sensor
npm install
```
Note: if the last command fails for lack of permissions, try again with ```sudo```.

## Running the tests
```sh
# to run mocha tests:
npm test
# to run istanbuljs/nyc code coverage and generate report (also runs mocha tests)
npm run test-coverage
# to report test coverage to coveralls
npm run report-coverage
```
## Authors

* **Thomas Gilles**
* **Valentina Osipova**
* **Ahmad Zakaria**

## License

This project is licensed under the WebCC Public License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
Special thanks to:
* **Dr. Carlos A. Velasco** - [WebCC](https://www.fit.fraunhofer.de/en/fb/ucc/webcc.html)
* **Philip Ackermann** - [philipackermann.de](http://philipackermann.de/)
* **Dr. Yehya Mohamad** - [WebCC](https://www.fit.fraunhofer.de/en/fb/ucc/webcc.html)
* **Evangelos Vlachogiannis** - [WebCC](https://www.fit.fraunhofer.de/en/fb/ucc/webcc.html)
