import { Component } from '@angular/core';
import { Loading, LoadingController, NavController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { AddMatchPage } from '../add-match/add-match';
import { IPlayer } from '../../../models/player.models';

@Component({
  selector: 'page-results',
  templateUrl: 'results.html'
})
export class ResultsPage {
  private matches: any;
  private firstDate: string;
  private loader: Loading;
  private matchSub: any;

  constructor (
    public navCtrl: NavController, 
    private apiService: ApiService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.presentLoading();
    this.getMatches();
  }
 
  getMatches() {
    this.matchSub = this.apiService.getMatches().subscribe((matches) => {
      this.matches = matches;
      this.matches.map(match => {
        match.points.team1Positive = Math.abs(match.points.team1);
        if(match.points.team1 == "") {
          match.points.team1Positive = 0;
        }
        match.points.team2Positive = Math.abs(match.points.team2);
        if(match.points.team2 == "") {
          match.points.team2Positive = 0;
        }
      })
      console.log(this.matches);
      this.loader.dismiss();
    });
  }
  
  ngOnDestroy() {
    if (this.matchSub) {
      this.matchSub.unsubscribe();
    }
  }
  pushPage() {
    this.navCtrl.push(AddMatchPage);
  }

  myHeaderFn(record, recordIndex, records) {
    let date = new Date(record.created_at);
    let options = { day: 'numeric', month: 'long' };
    let formatDate = date.toLocaleDateString("nl-NL", options);
    if (formatDate == this.firstDate) {
      return null;
    } else {
      this.firstDate = formatDate;
      return formatDate;
    }
  }

  virtualTrack (index, match) {
  return match.id;
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Loading...",
      duration: 10000
    })

    this.loader.present();
  }

}
