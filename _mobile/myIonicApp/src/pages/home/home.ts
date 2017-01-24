import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { DeviceMotion } from 'ionic-native';
import { AccelerationData } from 'ionic-native';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public acceleration: AccelerationData = {
    x:0,
    y:0,
    z:0,
    timestamp: null
  };
  subscription: any = null;
  public frequency: number = 1000;

  constructor(public navCtrl: NavController) {
  }
  clickedWatchStop(event) {
    event.preventDefault();
    this.subscription.unsubscribe();
  }
  clickedWatchStart(event) {
    event.preventDefault();
    this.subscription = DeviceMotion.watchAcceleration({frequency: this.frequency}).subscribe((acceleration: AccelerationData) => {
      this.acceleration = acceleration;
    });
  }

}
