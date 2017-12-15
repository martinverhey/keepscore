import { Subscription } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core';
import { Loading, LoadingController, NavController, ModalController } from 'ionic-angular';
import { DataService } from '../../../providers/data-service';
import { ApiService } from '../../../providers/api-service';
import { LoginPage } from '../../login/login';
import { AddMatchPage } from '../../matches/add-match/add-match';
import { LeaderboardInfoPage } from '../leaderboard-info/leaderboard-info';

@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html'
})
export class LeaderboardPage implements OnInit {
  private currentUserID;
  private userSub: Subscription;
  private user: any;
  private players: any[];
  private firstPlace = "#C98910";
  private secondPlace = "#A8A8A8";
  private thirdPlace = "#965A38";
  private otherPlaces = "rgba(0,0,0,.1)"
  private loader: Loading;
  private users: any;

  constructor(public navCtrl: NavController, 
              private apiService: ApiService, 
              private loadingCtrl: LoadingController, 
              private modalCtrl: ModalController
            ) {
    this.players = [];
  }
  
  ngOnInit() {
    this.loadPlayers();
    this.user = this.apiService.player;
  }
  
  loadPlayers() {
    this.presentLoading();
    this.userSub = this.apiService.getPlayersInCompetition(this.apiService.player.competition_selected).subscribe((players) => {
      players.sort(function (a,b) {
        return b.rank - a.rank
      })
      this.players = players;
      this.loader.dismiss();
    })
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  pushPage() {
    this.navCtrl.push(AddMatchPage);
  }

  pushModal() {
    let modal = this.modalCtrl.create(LeaderboardInfoPage);
    modal.present();
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Loading...",
      duration: 10000
    })

    this.loader.present();
  }
  
}
