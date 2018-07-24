import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { IMatchInfo } from '../../../models/match-info.models';

/**
 * Generated class for the MatchInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-match-info',
  templateUrl: 'match-info.html',
})
export class MatchInfoPage {
  public match: IMatchInfo;
  public matchDateAndTime: string = "";
  public teamsAverage = [];
  public teamsAverageAdjusted = [];
  public winExpectancy = [];
  public admin: string = "";
  public twovsone: number = 0;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    private apiService: ApiService,
    public navParams: NavParams
  ) {
    this.match = this.navParams.get('match');
    this.admin = this.navParams.get('admin');
    let date = new Date(this.match.created_at);
    let options = { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' };
    this.matchDateAndTime = date.toLocaleString("nl-NL", options);
  }

  ionViewDidLoad() {
    let teamNumber: number = 0;
    let amountOfPlayers = [];
    this.twovsone = 0;
    if (this.match.teams) {
      Object.keys(this.match.teams).forEach(team => {
        amountOfPlayers.push(this.match.teams[team].length);
        let teamTotal: number = 0;
        let playerNumber: number = 0;
        Object.keys(this.match.teams[team]).forEach(player => {
          this.apiService.getMatchHistory(this.match.key, this.match.teams[team][player].id).take(1).subscribe(playerHistory => {
            playerNumber++;
            this.match.teams[team][player].rank = playerHistory.previous;
            teamTotal += playerHistory.previous;
            if (playerNumber > Object.keys(this.match.teams[team]).length - 1) {
              playerNumber = 0;
              teamNumber++;
              amountOfPlayers[0] > amountOfPlayers[1] ? this.twovsone = 1 : amountOfPlayers[0] < amountOfPlayers[1] ? this.twovsone = 2 : this.twovsone = 0;
              if (team == "team1" && this.twovsone == 1 || team == "team2" && this.twovsone == 2) {
                console.log("2v1 is true, Team " + this.twovsone + " has the advantage");
                this.teamsAverage.push(teamTotal / Object.keys(this.match.teams[team]).length);
                this.teamsAverageAdjusted.push((teamTotal / Object.keys(this.match.teams[team]).length) * 1.25);
              } else {
                this.teamsAverage.push(teamTotal / Object.keys(this.match.teams[team]).length);
                this.teamsAverageAdjusted.push(teamTotal / Object.keys(this.match.teams[team]).length);
              }
              if (teamNumber > Object.keys(this.match.teams).length - 1) {
                this.winExpectation(this.teamsAverageAdjusted);
              }
            }
          })
        });
      });
    }
  }

  winExpectation(averageTeamPointsAdjusted) {
    let strengthDifference = 0;
    let winExpectation = 0;

    strengthDifference = Math.abs(Number(averageTeamPointsAdjusted[0]) - Number(averageTeamPointsAdjusted[1]));
    strengthDifference = Math.min(Math.max(strengthDifference, 0), 400);
    winExpectation = -0.000003 * (strengthDifference * strengthDifference) + 0.0023 * strengthDifference + 0.5;
    winExpectation = Math.round(winExpectation * 100);

    averageTeamPointsAdjusted[0] > averageTeamPointsAdjusted[1] ? this.winExpectancy.push(winExpectation, 100-winExpectation) : this.winExpectancy.push(100-winExpectation, winExpectation);
    this.floorNumbers();
  }

  floorNumbers() {
    this.teamsAverageAdjusted[0] = Math.floor(this.teamsAverageAdjusted[0]);
    this.teamsAverageAdjusted[1] = Math.floor(this.teamsAverageAdjusted[1]);
  }

  dismissModal() {
      this.viewCtrl.dismiss(this);
  }

  showConfirm(event, match) {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'All of this match data will be removed and given points will be reversed.',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.apiService.removeMatch(match.key);
            this.viewCtrl.dismiss(this);
          }
        }
      ]
    });
    confirm.present();
  }


}
