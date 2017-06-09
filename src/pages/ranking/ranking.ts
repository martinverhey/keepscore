import { DataService } from '../../providers/data-service';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { ApiService } from '../../providers/api-service';
import { AddMatchPage } from '../add-match/add-match';

@Component({
  selector: 'page-ranking',
  templateUrl: 'ranking.html'
})
export class RankingPage implements OnInit {
  players: any[];
  first = "#C98910";
  second = "#A8A8A8";
  third = "#965A38";
  rest = "rgba(0,0,0,.1)"

  constructor(public navCtrl: NavController, private apiService: ApiService, private dataService: DataService) {
      this.players = [];
  }

  ngOnInit() {
    this.dataService.users.subscribe((players) => {
      this.players = players;
    })
  }

  pushPage() {
    this.navCtrl.push(AddMatchPage);
    console.log("Push 'Add Match' in front");
  }

}
