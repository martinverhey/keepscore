import { DataService } from '../../providers/data-service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';

/*
  Generated class for the AddPlayer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-player',
  templateUrl: 'add-player.html'
})
export class AddPlayerPage {
  user: string;
  userData: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private apiService: ApiService, private toastCtrl: ToastController, private dataService: DataService) {}

  // Return to previous page
  popPage() {
    this.navCtrl.pop();
    console.log("Pop back to Participants");
  }

  savePlayer() {
    console.log(this.user);
    console.log(this.user.length);
    if (this.user.length <= 10) {
      this.dataService.users.push({
        "username": this.user,
      // TODO: Let server set the rank.
        "rank": 1000
      })
      this.presentToast('User was added successfully');
      this.popPage();
    } else if (this.user.length > 10) {
      console.log("Playername too long");
      this.presentToast('Only 10 characters allowed');
    }
  }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }


}
