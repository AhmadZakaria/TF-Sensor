import {
  Component
} from '@angular/core';

import {
  NavController
} from 'ionic-angular';
import {
  AlertController,
  Platform
} from 'ionic-angular';

import {
  DeviceMotion
} from 'ionic-native';
import {
  Http,
  Headers
} from '@angular/http';
import 'rxjs/add/operator/map';
import { Device } from 'ionic-native';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  acc = undefined;
  img_pony = "https://www.transparenttextures.com/patterns/asfalt-light.png";
  handle = undefined;
  started = false;
  serverIP = undefined;
  connectionStatus = "Disconnected";
  statusColor = "light";
  sensorStatus = "radio-button-off";
  deviceID = undefined;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public http: Http, platform: Platform) {
    this.http.get('config.json').map(res => res.json()).subscribe(data => {
      this.serverIP = data.serverIP;
    });
    platform.ready().then(() => {
      this.deviceID = "AccX-" + Device.uuid;
    });
  }

  registerPonySensor(event) {
    // Build the post string from an object
    var post_data = {
      "type": "Accelerometer",
      "frequency": "500",
      "UID": this.deviceID,
      "target": "android",
      "active": "true",
      "unit": "m/s^2"
    };
    // this.http.get('https://www.reddit.com/r/gifs/new/.json?limit=10').map(res => res.json()).subscribe(data => {
    //   this.posts = data.data.children;
    // });
    var body = JSON.stringify(post_data);
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');



    this.http
      .post('http://' + this.serverIP + ':8080/api/sensors', body, {
        headers: headers
      })
      .map(response => response.json())
      .subscribe(
      response => {
        this.connectionStatus = "Connected";
        this.statusColor = "secondary";
      },
      (err) => {
        console.log('Errorr: ' + err);
        this.connectionStatus = "Error";
        this.statusColor = "danger";

      },
      () => console.log('Something Complete')
      );
  }

  clickedAlert(event) {
    event.preventDefault();

    if (this.started) {
      this.img_pony = "char_rarity.png";
      this.started = false;
      this.sensorStatus = "radio-button-off"

      clearInterval(this.handle);
      console.log("Stopping!");
    } else {
      this.img_pony = "char_fluttershy.png";

      this.started = true;
      this.sensorStatus = "radio-button-on"

      this.handle = setInterval(() => {
        // Get the device current acceleration
        DeviceMotion.getCurrentAcceleration().then(
          (acceleration) => {
            console.log("acc" + acceleration.x);
            this.acc = acceleration.x;

            this.sendAccToServer(acceleration.x);

          },
          (error: any) => {
            console.log(error)
          }
        );
      }, 1000);
      console.log("Starting!");
    }

  }

  sendAccToServer(acc: number) {
    var body = JSON.stringify({
      "lastReading": {
        "value": acc,
        "timestamp": Date.now()
      }
    });
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');


    this.http
      .post('http://' + this.serverIP + ':8080/api/sensors/' + this.deviceID + '/sensorReadings/latest', body, {
        headers: headers
      })
      .map(response => response.json())
      .subscribe(
      response => { },
      (err) => {
        console.log('Errorr: ' + err)
      },
      () => console.log('Something Complete')
      );

  }



}
