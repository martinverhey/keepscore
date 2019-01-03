import { Subscription } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core';
import { Loading, LoadingController, NavController, ModalController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { AddMatchPage } from '../../matches/add-match/add-match';
import { ProfilePage } from '../../profile/profile';
import { AddPlayerPage } from '../../player/add-player/add-player';

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
  private admin: string = "";

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

    this.apiService.getCompetition(this.apiService.competitionSelected).subscribe(competition => {
      if (competition.admin) {
        this.admin = competition.admin;
      }
    })
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

  pushAddPlayer() {
    this.navCtrl.push(AddPlayerPage, {playerList: this.players});
  }

  showModal(player) {
    let modal = this.modalCtrl.create(ProfilePage, {player: player, admin: this.admin});
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
