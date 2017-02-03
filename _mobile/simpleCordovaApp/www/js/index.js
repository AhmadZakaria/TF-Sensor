/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        document.querySelector("#showlocation").addEventListener('click', this.addLocation, false);
        document.querySelector("#capture").addEventListener('click', this.capturePicture, false);

        var xhr = new XMLHttpRequest();
        var that = this;
        xhr.onprogress = function () {
            var guidelinesDiv = document.querySelector("#guidelinesList");
            guidelinesDiv.textContent = "Loading...";
            console.log('LOADING', xhr.status);
        };
        xhr.onload = function () {
            console.log('DONE', xhr.status);
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.status === OK) {
                var guidelines = JSON.parse(xhr.responseText).list;
                console.log(guidelines); // 'This is the returned text.'
                that.makeGuidelinesList(guidelines);
            }
            else {
                console.log('Error: ' + xhr.status); // An error occurred during the request.
            }
        };
        xhr.open('GET', 'https://www.w3.org/WAI/accessibility-support/api/wcag2/guidelines');
        xhr.send(null);
    },
    makeGuidelinesList: function (guidelines) {
        var guidelinesDiv = document.querySelector("#guidelinesList");
        guidelinesDiv.textContent = "";
        var guidelinesUL = document.createElement("ul");
        for (var i = 0; i < guidelines.length; i++) {
            console.log(guidelines[i].title);
            var guidelinesLI = document.createElement("li");
            guidelinesLI.textContent = guidelines[i].title;
            guidelinesUL.appendChild(guidelinesLI);
        }
        guidelinesDiv.appendChild(guidelinesUL);
    },
    addLocation: function (event)
    {
        event.preventDefault();
        navigator.geolocation.getCurrentPosition(function (position)
        {
            alert(
                'Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + position.timestamp + '\n');
        }, function ()
        {
            alert('Error getting location');
        });
        return false;
    },
    capturePicture: function (event)
    {
        event.preventDefault();
        if (!navigator.camera)
        {
            alert("Camera API not supported", "Error");
            return;
        }
        var options = {
            quality: 50,
            targetWidth: 100,
            targetHeight: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
            encodingType: 0     // 0=JPG 1=PNG
        };
        navigator.camera.getPicture(function (imgData)
        {
            document.querySelector("#myimg").setAttribute('src', "data:image/jpeg;base64," + imgData);
        }, function ()
        {
            alert('Error taking picture', 'Error');
        }, options);
        return false;
    }
};

app.initialize();