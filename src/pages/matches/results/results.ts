import { Component } from '@angular/core';
import { Loading, LoadingController, NavController, ModalController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { AddMatchPage } from '../add-match/add-match';
import { MatchInfoPage } from '../match-info/match-info';

@Component({
  selector: 'page-results',
  templateUrl: 'results.html'
})
export class ResultsPage {
  private matches: any;
  private firstDate: string;
  private loader: Loading;
  private matchSub: any;
  private admin: string = "";

  constructor (
    public navCtrl: NavController, 
    public modalCtrl: ModalController,
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
    this.presentLoading();
    this.getMatches();
  }

  getMatches() {
    this.matchSub = this.apiService.getMatches().subscribe((matches) => {
      this.matches = matches;
      this.matches.sort(function (a,b) {
        return b.created_at - a.created_at;
      })
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
      this.loader.dismiss();
    });
    this.apiService.getCompetition(this.apiService.competitionSelected).subscribe(competition => {
      if (competition.admin) {
        this.admin = competition.admin;
      }
    })
  }
  
  ngOnDestroy() {
    if (this.matchSub) {
      this.matchSub.unsubscribe();
    }
  }
  pushPage() {
    this.navCtrl.push(AddMatchPage);
  }

  showModal(match) {
    this.presentModal(match);
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
    return index + "" + match.created_at;
  }

  presentModal(match) {
    const modal = this.modalCtrl.create(MatchInfoPage, {match: match, admin: this.admin});
    modal.onDidDismiss(data => {
      if (data != null) {
        
      }
    })
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
