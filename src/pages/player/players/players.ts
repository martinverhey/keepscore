import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { OnInit } from '@angular/core';
// import { ApiService } from '../../../providers/api-service';
import { AddPlayerPage } from '../add-player/add-player';

@Component({
  selector: 'page-players',
  templateUrl: 'players.html'
})
export class PlayersPage {
  players: any[];
  // users: any;

  constructor(
    public navCtrl: NavController, 
    // private apiService: ApiService
  ) {
    this.players = [];
  }

  // ngOnInit() {
    // this.users = this.apiService.users.subscribe((players) => {
    //   this.players = players;
    // })
  // }

  // ngOnDestroy() {
  //   this.users.unsubscribe();
  // }

  pushPage() {
    this.navCtrl.push(AddPlayerPage);
  }

}
