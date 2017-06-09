import { DataService } from '../../providers/data-service';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { ApiService } from '../../providers/api-service';
import { AddMatchPage } from '../add-match/add-match';

@Component({
  selector: 'page-score',
  templateUrl: 'score.html'
})
export class ScorePage implements OnInit {
  matches: any;
  firstDate: string;

  constructor (public navCtrl: NavController, private apiService: ApiService, private dataService: DataService) {
   }

  ngOnInit() {
    this.dataService.matches.subscribe((matches) => {
      this.matches = matches;
      console.log(this.matches);
      this.matches.forEach(match => {
        if (match.points.team1 > 0) {
          match.points.team1Positive = match.points.team1;
        } else if (match.points.team1 < 0) {
          match.points.team1Positive = match.points.team1.toString().substring(1);
        }
        if (match.points.team2 > 0) {
          match.points.team2Positive = match.points.team2;
        } else if (match.points.team2 < 0) {
          match.points.team2Positive = match.points.team2.toString().substring(1);
        }

      });
    });
  }

  pushPage() {
    this.navCtrl.push(AddMatchPage);
    console.log("Push 'Add Match' in front");
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
}
