import {
  Component
} from '@angular/core';

import {
  NavController
} from 'ionic-angular';
import {
  AlertController
} from 'ionic-angular';

import {
  DeviceMotion
} from 'ionic-native';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  acc = undefined;
  img_pony = "https://www.transparenttextures.com/patterns/asfalt-light.png";
  handle = undefined;
  started = false;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    // // Watch device acceleration
    // var subscription = DeviceMotion.watchAcceleration().subscribe((acceleration) => {
    //   console.log("acc" + acceleration.x);
    //
    // });
    //
    // // Stop watch
    // subscription.unsubscribe();
  }

  registerPonySensor(event) {
    
  }

  clickedAlert(event) {
    event.preventDefault();

    if (this.started) {
      this.img_pony="http://mylittlepony.hasbro.com/images/spring2016/ponies/char_rarity.png";
      this.started = false;
      clearInterval(this.handle);
      console.log("Stopping!");
    } else {
      this.img_pony="http://mylittlepony.hasbro.com/images/spring2016/ponies/char_fluttershy.png";

      this.started = true;
      this.handle = setInterval(() => {
        // Get the device current acceleration
        DeviceMotion.getCurrentAcceleration().then(
          (acceleration) => {
            console.log("acc" + acceleration.x);
            this.acc = acceleration.x;
          },
          (error: any) => {
            console.log(error)
          }
        );
      }, 1000);
      console.log("Starting!");
    }

  }






}
