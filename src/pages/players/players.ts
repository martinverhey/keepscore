import { DataService } from '../../providers/data-service';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { ApiService } from '../../providers/api-service';
import { AddPlayerPage } from '../add-player/add-player';
import { AngularFire } from 'angularfire2'

@Component({
  selector: 'page-players',
  templateUrl: 'players.html'
})
export class PlayersPage implements OnInit {
  players: any[];
  users: any;

  constructor(public navCtrl: NavController, private apiService: ApiService, private dataService: DataService, private angularFire: AngularFire) {
    this.players = [];
  }

  ngOnInit() {
    this.dataService.users.subscribe((players) => {
      this.players = players;
    })
  }

  pushPage() {
    this.navCtrl.push(AddPlayerPage);
    console.log("Push 'Add Player' in front");
  }

}
