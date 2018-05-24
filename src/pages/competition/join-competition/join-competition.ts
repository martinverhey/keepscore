import { Component } from '@angular/core';
import { App, NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { MyApp } from '../../../app/app.component';
import { UsernamePage } from '../../username/username';

/*
  Generated class for the Competition page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-join-competition',
  templateUrl: 'join-competition.html'
})
export class JoinCompetitionPage {
  public competitionID: string;
  private currentCompetitionID;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private apiService: ApiService,
    private app: App,
    private qrScanner: QRScanner
  ) {
  }

  ngOnInit() {
    this.currentCompetitionID = this.apiService.player.competition_selected;
  }

  popPage() {
    this.navCtrl.pop();
  }

  joinCompetition(competitionID) {
    if (competitionID.length == 20) {
      this.apiService.getCompetition(competitionID).take(1).subscribe(competition => {
        if (competition) {
          if (!competition.users[this.apiService.player.uid]) {
            let modal;
            modal = this.modalCtrl.create(UsernamePage, {competition: competition})
            modal.onDidDismiss(data => {
              if (data) {
                this.apiService.addPlayerToCompetition(competitionID, competition.name).then(() => {
                  this.presentToast('Successfully joined: ' + competition.name);
                  setTimeout(() => {
                    const root = this.app.getRootNav();
                    root.setRoot(MyApp);
                  }, 100);
                });
              }
            })
            modal.present();
          }
          else {
            this.presentToast('You are already in this competition.');
          }
        } else {
          this.presentToast('Competition does not exist.');
        }
      })
    } else {
      this.presentToast('Competition does not exist.');
    }
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
