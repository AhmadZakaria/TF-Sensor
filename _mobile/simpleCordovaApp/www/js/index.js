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
    }
};

app.initialize();