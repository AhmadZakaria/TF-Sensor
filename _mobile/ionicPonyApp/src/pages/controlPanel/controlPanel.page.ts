import { Injectable, Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import {
  Platform,
} from 'ionic-angular';
import { Device } from 'ionic-native'
import { DeviceMotion } from 'ionic-native';
import {
  Http,
  Headers,
} from '@angular/http';
import 'rxjs/add/operator/map';
import { InAppBrowser } from 'ionic-native';

@Component({
  selector: 'ib-page-control-panel',
  templateUrl: 'controlPanel.page.html',
})
@Injectable()
export class ControlPanel {
  acc: number = 0.0;
  imgPony: string = 'asfalt-light.png';
  handle: any = undefined;
  started: boolean = false;
  public serverIP: string = undefined;
  connectionStatus: string = 'Disconnected';
  statusColor: string = 'light';
  sensorStatus: string = 'radio-button-off';
  deviceID: any = undefined;

  constructor(public navCtrl: NavController, public http: Http) {
    this.http.get('config.json').map(res => res.json()).subscribe(data => {
      this.serverIP = data.serverIP;
    });
    this.deviceID = 'AccX-' + Device.uuid;
  }

  registerPonySensor(event: any) {
    event.preventDefault();

    // Build the post string from an object
    let postData = {
      'type': 'Accelerometer',
      'frequency': '500',
      'UID': this.deviceID,
      'target': 'android',
      'active': 'true',
      'unit': 'm/s^2',
    };

    let body = JSON.stringify(postData);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http
      .post('http://' + this.serverIP + ':8080/api/sensors', body, {
        headers: headers,
      })
      .map(response => response.json())
      .subscribe(
      () => {
        this.connectionStatus = 'Connected';
        this.statusColor = 'secondary';
      },
      (err) => {
        console.log('Errorr: ' + err);
        this.connectionStatus = 'Error';
        this.statusColor = 'danger';
      }
      );
  }

  clickedAlert(event: any) {
    event.preventDefault();

    if (this.started) {
      this.imgPony = 'char_rarity.png';
      this.started = false;
      this.sensorStatus = 'radio-button-off';

      clearInterval(this.handle);
      console.log('Stopping!');
    } else {
      this.imgPony = 'char_fluttershy.png';
      this.started = true;
      this.sensorStatus = 'radio-button-on';

      this.handle = setInterval(() => {
        // Get the device current acceleration
        DeviceMotion.getCurrentAcceleration().then(
          (acceleration) => {
            console.log('acc' + acceleration.x);
            this.acc = acceleration.x;
            this.sendAccToServer(acceleration.x);
          },
          (error: any) => {
            console.log(error);
          },
        );
      }, 1000);
      console.log('Starting!');
    }
  }

  opendash(event: any) {
    event.preventDefault();

    let dashURL = 'http://' + this.serverIP + ':8080/dashboard.html';
    let ref = new InAppBrowser(dashURL, '_self');
    ref.show();
  }

  sendAccToServer(acc: number) {
    let body = JSON.stringify({
      'lastReading': {
        'value': acc,
        'timestamp': Date.now(),
      },
    });
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http
      .post('http://' + this.serverIP + ':8080/api/sensors/' + this.deviceID + '/sensorReadings/latest', body, {
        headers: headers,
      })
      .map(response => response.json())
      .subscribe(
      () => { },
      (err) => { console.log('Errorr: ' + err); },
    );

  }

}
