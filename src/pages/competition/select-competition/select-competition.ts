import { ApiService } from '../../../providers/api-service';
import { Component } from '@angular/core';
import { App, NavController, NavParams, Loading, LoadingController } from 'ionic-angular';
import { AddCompetitionPage } from '../add-competition/add-competition';
import { JoinCompetitionPage } from '../join-competition/join-competition';
import { TabsPage } from '../../tabs/tabs';
import { Subscription } from 'rxjs/Subscription';

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
  uid: string;
  competitionID: string;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private app: App
  ) { 
  }
  
  ngOnInit() {
    this.presentLoading();
    this.uid = this.apiService.uid;
    this.competitionID = this.apiService.competitionSelected;
    this.competitionSub = this.apiService.getCompetitionsForCurrentUser().subscribe(competitions => {
      console.log(competitions);
      this.competitions = competitions;
    })
    this.loader.dismiss();
  }

  ngOnDestroy() {
    if (this.competitionSub) {
      this.competitionSub.unsubscribe();
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
