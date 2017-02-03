import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {

  }
  clickedAlert(event) {
    event.preventDefault();
    let alert = this.alertCtrl.create({
      title: 'Simple Alert',
      subTitle: 'Hi! This is a simple alert box!',
      buttons: ['OK']
    });
    alert.present();
  }
}
