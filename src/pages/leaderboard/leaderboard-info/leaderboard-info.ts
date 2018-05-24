import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { Clipboard } from '@ionic-native/clipboard';

/*
  Generated class for the LeaderboardInfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-leaderboard-info',
  templateUrl: 'leaderboard-info.html'
})
export class LeaderboardInfoPage {
  private competition: any;
  private currentCompetitionID: string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public toastCtrl: ToastController, 
    private apiService: ApiService, 
    private clipboard: Clipboard) {}

  ngOnInit() {
    this.currentCompetitionID = this.apiService.player.competition_selected;
    this.apiService.getCompetitions().take(1).subscribe(competitions => {
      let competition = competitions.filter(element => element.key == this.currentCompetitionID)[0];
      competition.usersLength = Object.keys(competition.users).length;
      this.competition = competition;
    })
  }

  copyToClipboard() {
    this.clipboard.copy(this.currentCompetitionID).then(
      (resolve: string) => {
        this.presentToast(resolve);
      },
      (reject: string) => {
        this.presentToast('Error: ' + reject);
      }
    );
    
    this.clipboard.paste().then(
      (resolve: string) => {
        this.presentToast(resolve);
      },
      (reject: string) => {
        this.presentToast('Error: ' + reject);
      }
    );
  }

  // Return to previous page
  dismissModal() {
    this.viewCtrl.dismiss(this);
  }

presentToast(text:string) {
  let toast = this.toastCtrl.create({
    message: text,
    duration: 3000,
    position: 'top'
  });

  toast.onDidDismiss(() => {
  });

  toast.present();
}
  
}
