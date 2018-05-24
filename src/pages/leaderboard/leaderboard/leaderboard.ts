import { Subscription } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core';
import { Loading, LoadingController, NavController, ModalController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { AddMatchPage } from '../../matches/add-match/add-match';
import { LeaderboardInfoPage } from '../leaderboard-info/leaderboard-info';
import { ProfilePage } from '../../profile/profile';

@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html'
})
export class LeaderboardPage implements OnInit {
  public currentCompetitionID: string;
  private userSub: Subscription;
  private user: any;
  private players: any[];
  public firstPlace = "#C98910";
  public secondPlace = "#A8A8A8";
  public thirdPlace = "#965A38";
  public otherPlaces = "rgba(0,0,0,.1)";
  private loader: Loading;

  constructor(public navCtrl: NavController, 
              private apiService: ApiService, 
              private loadingCtrl: LoadingController, 
              private modalCtrl: ModalController
            ) {
    this.players = [];
  }
  
  ngOnInit() {
    this.loadPlayers();
    this.currentCompetitionID = this.apiService.player.competition_selected;
    this.user = this.apiService.player;
  }
  
  loadPlayers() {
    this.presentLoading();
    this.userSub = this.apiService.getPlayersInCompetition()
    .subscribe((players) => {
      players.forEach((player) => {
        if (Number(player.rank)) {
          player.rank = Math.floor(player.rank);
        } else {
          player.rank = 0;
        }
      })
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

  pushProfile() {
    this.navCtrl.push(ProfilePage);
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
