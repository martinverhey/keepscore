import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AddPlayerPage } from '../add-player/add-player';

@Component({
  selector: 'page-players',
  templateUrl: 'players.html'
})
export class PlayersPage {
  players: any[];

  constructor(
    public navCtrl: NavController, 
  ) {
    this.players = [];
  }

  pushPage() {
    this.navCtrl.push(AddPlayerPage);
  }

}
