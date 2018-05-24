import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/*
  Generated class for the PlayerList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-player-list',
  templateUrl: 'player-list.html'
})
export class PlayerListPage {
  players: any = [];
  selectedPlayer: any = [];

  constructor(
    public navCtrl: NavController, 
    public viewCtrl: ViewController, 
    public navParams: NavParams
  ) {
    this.players = this.navParams.get('players');
    this.players = this.players.sort(function (a,b) {
      return a.username.localeCompare(b.username);
    })
    this.selectedPlayer = this.navParams.get('selectedPlayer');
  }

  ngOnInit() {
  }

  cancelModal() {
    if (!this.selectedPlayer) {
      this.selectedPlayer = [];
    }
    this.viewCtrl.dismiss(this);
  }

  dismissModal() {
      let foundPlayer = this.players.find(player => player.key == this.selectedPlayer);
      this.selectedPlayer = foundPlayer;
      this.viewCtrl.dismiss(this);
  }
}
