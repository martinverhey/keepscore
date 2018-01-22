import { Component } from '@angular/core';
import { App, NavController, NavParams, ToastController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { TabsPage } from '../../tabs/tabs';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Platform } from 'ionic-angular';

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
    private toastCtrl: ToastController,
    private apiService: ApiService,
    private app: App,
    private qrScanner: QRScanner,
    private platform: Platform
  ) {
  }

  ngOnInit() {
    this.currentCompetitionID = this.apiService.player.competition_selected;
    this.qrScan();
  }

  popPage() {
    this.navCtrl.pop();
  }

  joinCompetition(competitionID) {
    if (competitionID.length == 20) {
      this.apiService.getCompetition(competitionID).subscribe(competition => {
        if (competition) {
          console.log(competition);
          this.apiService.addPlayerToCompetition(competitionID, competition.name).then(() => {
            setTimeout(() => {
              const root = this.app.getRootNav();
              root.setRoot(TabsPage);              
            }, 1500);
          });
        } else {
          this.presentToast('Competition does not exist.');
        }
      })
    }
  }

  qrScan() {
    if(this.platform.is('cordova')) {
    // Optionally request the permission early
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      if (status.authorized) {
        // camera permission was granted


        // start scanning
        let scanSub = this.qrScanner.scan().subscribe((competitionID: string) => {
          console.log('Scanned something', competitionID);
          
          this.qrScanner.hide(); // hide camera preview
          scanSub.unsubscribe(); // stop scanning
          
          this.joinCompetition(competitionID);
        });

        // show camera preview
        this.qrScanner.show();

        // wait for user to scan something, then the observable callback will be called

      } else if (status.denied) {
        // camera permission was permanently denied
        // you must use QRScanner.openSettings() method to guide the user to the settings page
        // then they can grant the permission from there
      } else {
        // permission was denied, but not permanently. You can ask for permission again at a later time.
      }
    })
    .catch((e: any) => console.log('Error is', e));
  }
  }

  // closePage(key) {
  //   console.log(key);
  //   this.apiService.createCompetitionAndOrAddPlayer(key.key, key.name);
  //   const root = this.app.getRootNav();
  //   root.setRoot(TabsPage);
  // }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}
