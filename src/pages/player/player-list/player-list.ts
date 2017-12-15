import { Component, OnInit } from '@angular/core';
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
export class PlayerListPage implements OnInit {
  players: any;
  selectedPlayer: string = "";

  constructor(
    public navCtrl: NavController, 
    public viewCtrl: ViewController, 
    public navParams: NavParams
  ) {
    this.players = this.navParams.get('players');
    this.selectedPlayer = this.navParams.get('selectedPlayer');
  }

  ngOnInit() {
  }

  dismissModal() {
    this.viewCtrl.dismiss(this);
  }

}
