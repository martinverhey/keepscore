import { ApiService } from '../../../providers/api-service';
import { Component } from '@angular/core';
import { App, NavController, NavParams, Loading, LoadingController } from 'ionic-angular';
import { AddCompetitionPage } from '../add-competition/add-competition';
import { SearchCompetitionPage } from '../search-competition/search-competition';
import { TabsPage } from '../../tabs/tabs';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';

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
  private userSub: Subscription;
  private uid: string;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private app: App,
    private afDB: AngularFireDatabase
  ) { 
  }
  
  ngOnInit() {
    this.presentLoading();
    this.uid = this.apiService.player.uid;
    this.userSub = this.apiService.getUser(this.uid).subscribe((user) => {
      this.apiService.player.username = user.username;
      console.log(this.apiService.player);
      this.competitionSub = this.apiService.getCompetitionsForUser(this.uid).subscribe(competitions => {
        console.log(competitions);
        competitions.forEach(competition => {
          competition.usersLength = Object.keys(competition.users).length;
        });
        this.competitions = competitions;
      })
      this.loader.dismiss();
    }
  )
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.competitionSub) {
      this.competitionSub.unsubscribe();
    }
  }

  pushAddPage() {
    this.navCtrl.push(AddCompetitionPage);
  }

  pushSearchPage() {
    this.navCtrl.push(SearchCompetitionPage);
  }

  closePage(key) {
    this.apiService.switchCompetition(key);
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
