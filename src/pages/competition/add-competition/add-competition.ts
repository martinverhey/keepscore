import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { TabsPage } from '../../tabs/tabs';

/*
  Generated class for the AddPlayer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-competition',
  templateUrl: 'add-competition.html'
})
export class AddCompetitionPage {
  public name: string;
  private uid: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private apiService: ApiService, 
    private toastCtrl: ToastController,
    private app: App
  ) {}

  ngOnInit() {
    this.uid = this.apiService.player.uid;
  }

  // Return to previous page
  popPage() {
    this.navCtrl.pop();
    console.log("Pop back to Competitions");
  }

  save() {
    if (this.name.length <= 20) {
      this.apiService.saveCompetition(this.name, this.uid).then((item) => {
        console.log(item)
        this.apiService.addPlayerToCompetition(item.key, this.name);
      });
      this.presentToast('Competition was added successfully');
      setTimeout(() => {
        const root = this.app.getRootNav();
        root.setRoot(TabsPage);
      }, 100);
    } else if (this.name.length > 20) {
      console.log("Competition name too long");
      this.presentToast('Only 20 characters allowed');
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
