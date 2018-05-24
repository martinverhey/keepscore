import { ApiService } from '../../../providers/api-service';
import { Component } from '@angular/core';
import { App, NavController, NavParams, Loading, LoadingController, ToastController, ModalController } from 'ionic-angular';
import { AddCompetitionPage } from '../add-competition/add-competition';
import { JoinCompetitionPage } from '../join-competition/join-competition';
import { Subscription } from 'rxjs/Subscription';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Platform } from 'ionic-angular';
import { MyApp } from '../../../app/app.component';
import { UsernamePage } from '../../username/username';
import { LoginPage } from '../../login/login';

/*
  Generated class for the Competition page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-select-competition',
  templateUrl: 'select-competition.html'
})
export class SelectCompetitionPage {
  private competitions: any[] = [];
  private competitionSub: Subscription;
  private loader: Loading;
  public uid: string;
  public competitionID: string;
  public usernames: any;
  private showLogin: boolean = false;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private app: App,
    private toastCtrl: ToastController,
    private qrScanner: QRScanner,
    private platform: Platform,
    private modalCtrl: ModalController
  ) { 
  }
  
  ngOnInit() {
    this.presentLoading();
    this.uid = this.apiService.uid;
    this.competitionID = this.apiService.competitionSelected;
    this.competitionSub = this.apiService.getCompetitionsForCurrentUser().subscribe(competitions => {
      this.competitions = competitions;

      this.apiService.getUsernamesForCurrentUser().take(1).subscribe(usernames => {
        this.usernames = usernames;
        this.competitions.map(competitions => {
          this.usernames.forEach(username => {
            if (username.key == competitions.key) {
              competitions.username = username.username;
            }
          });
        });
      })

      if (this.competitions.length < 1) {
        this.showLogin = true;
      }
    })
    this.loader.dismiss();
  }

  ngOnDestroy() {
    if (this.competitionSub) {
      this.competitionSub.unsubscribe();
    }
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

  qrScan() {
    const context = this;
    if(this.platform.is('cordova')) {
    // Optionally request the permission early
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      if (status.authorized) {
        // camera permission was granted
        console.log('Scanning...');
        const ionApp = <HTMLElement>document.getElementsByTagName("ion-app")[0];

        // start scanning
        let scanSub = this.qrScanner.scan().subscribe((competitionID: string) => {
          console.log('Scanned QR: ', competitionID);

          this.qrScanner.destroy(); // hide camera preview
          scanSub.unsubscribe(); // stop scanning
          ionApp.style.display = 'block';
          
          this.joinCompetition(competitionID);
        });

        // show camera preview
        ionApp.style.display = 'none';
        this.qrScanner.show();
        context.qrScanner.show();
        setTimeout(() => {
          if(ionApp.style.display == 'none') {
            ionApp.style.display = 'block';
            scanSub.unsubscribe(); // stop scanning
            context.qrScanner.destroy();
            this.presentToast('Scanning time-out.');
          }
        }, 8000);

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

  pushAddPage() {
    this.navCtrl.push(AddCompetitionPage);
  }

  pushJoinPage() {
    this.navCtrl.push(JoinCompetitionPage);
  }

  closePage(key) {
    this.apiService.switchCompetition(key);
    const root = this.app.getRootNav();
    root.setRoot(MyApp);
  }

  pushLogin() {
    this.navCtrl.push(LoginPage, {isLogin: true});
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Loading...",
      duration: 10000
    })

    this.loader.present();
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
