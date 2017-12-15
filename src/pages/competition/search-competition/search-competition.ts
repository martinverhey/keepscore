import { Component } from '@angular/core';
import { App, NavController, NavParams, Loading, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { ApiService } from '../../../providers/api-service';
import { TabsPage } from '../../tabs/tabs';
// import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Platform } from 'ionic-angular';

/*
  Generated class for the Competition page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-search-competition',
  templateUrl: 'search-competition.html'
})
export class SearchCompetitionPage {
  private competitionSub: Subscription;
  private competitions: any[];
  private loader: Loading;
  private currentCompetitionID;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    private app: App,
    // private qrScanner: QRScanner,
    private platform: Platform
  ) {
  }

  ngOnInit() {
    this.presentLoading();
    this.currentCompetitionID = this.apiService.player.competition_selected;
    this.competitionSub = this.apiService.getCompetitions().subscribe((competition) => {
      this.competitions = competition;
      console.log(this.competitions);
      this.competitions.forEach((competition) => {
        competition.usersLength = Object.keys(competition.users).length;
      })
      this.loader.dismiss();
    });
  }

  ngOnDestroy() {
    if (this.competitionSub) {
      this.competitionSub.unsubscribe();
    }
  }

  popPage() {
    this.navCtrl.pop();
  }

  qrScan() {
  //   if(this.platform.is('cordova')) {
  //   // Optionally request the permission early
  //   this.qrScanner.prepare()
  //   .then((status: QRScannerStatus) => {
  //     if (status.authorized) {
  //       // camera permission was granted


  //       // start scanning
  //       let scanSub = this.qrScanner.scan().subscribe((text: string) => {
  //         console.log('Scanned something', text);

  //         this.qrScanner.hide(); // hide camera preview
  //         scanSub.unsubscribe(); // stop scanning
  //       });

  //       // show camera preview
  //       this.qrScanner.show();

  //       // wait for user to scan something, then the observable callback will be called

  //     } else if (status.denied) {
  //       // camera permission was permanently denied
  //       // you must use QRScanner.openSettings() method to guide the user to the settings page
  //       // then they can grant the permission from there
  //     } else {
  //       // permission was denied, but not permanently. You can ask for permission again at a later time.
  //     }
  //   })
  //   .catch((e: any) => console.log('Error is', e));
  // }
  }

  closePage(key) {
    console.log(key);
    this.apiService.createCompetitionAndAddPlayer(key.key, this.apiService.player.username, key.name);
    // this.apiService.getMatches(key);
    const root = this.app.getRootNav();
    root.setRoot(TabsPage);
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Loading...",
      duration: 10000
    })

    this.loader.present();
  }


}
