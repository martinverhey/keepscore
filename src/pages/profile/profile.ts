import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { AngularFireAuth } from 'angularfire2/auth';
import { ApiService } from '../../providers/api-service';
import { IPlayer } from '../../models/player.models';
import { Chart } from 'chart.js';
import { ICompetition } from '../../models/competition.models';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  @ViewChild('lineCanvas') lineCanvas;
  lineChart: any;

  public player: IPlayer;
  public playerName: string = '';
  public competition: ICompetition;
  public isAnonymous: boolean = false;
  public winRate: number = 0;
  public wins: number = 0;
  public losses: number = 0;
  public draws: number = 0;
  public history: number[];
  public currentPoints: number = 1000;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.apiService.getRankHistory()
      .do(items => {
        items.sort(function (a,b) {
          return a.timestamp - b.timestamp;
        })
      })
      .map(items => items.map(item => item.new))
      .subscribe((history) => {
        Object.keys(history).forEach(rank => {
          history[rank] = Math.floor(history[rank]);
        })
        this.history = history;
        if (this.history.length > 0) {
          this.currentPoints = Math.floor(this.history[this.history.length - 1]);
        }
        this.renderLine();
      })

    this.player = this.apiService.player;
    this.playerName = this.player.username;
    if (this.player.matches && this.player.matches[this.player.competition_selected]) {
      this.winRate = this.calculateWinRate(this.player);
    }

    this.afAuth.authState.subscribe((authState) => {
      this.isAnonymous = authState.isAnonymous;
    })
  }

  renderLine() {
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
          labels: this.history,
          datasets: [
              {
                  label: "Points",
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: "#ff7800",
                  borderColor: "#ff7800",
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderColor: "#ff7800",
                  pointBackgroundColor: "#fff",
                  pointBorderWidth: 5,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: "#ff7800",
                  pointHoverBorderColor: "rgba(220,220,220,1)",
                  pointHoverBorderWidth: 0,
                  pointRadius: 1,
                  pointHitRadius: 10,
                  data: this.history,
                  spanGaps: false,
              }
          ]
      }
    });
  }

  calculateWinRate(player): number {
    let selectedCompetition = this.player.competition_selected;
    let matches = this.player.matches;
    let history = matches[selectedCompetition];
    
    if (history) {
      this.wins = 0;
      this.losses = 0;
      this.draws = 0;
      Object.keys(history).forEach(key => {
        if (history[key] == "won") {
          this.wins++;
        } else if (history[key] == "lost") {
          this.losses++;
        } else if (history[key] == "draw") {
          this.draws++;
        }
      });
      return this.getPercentage(this.wins, this.losses, this.draws);
    } else {
      return 0;
    }
  }

  getPercentage(wins, losses, draws): number {
    let total = wins + losses + draws;
    return Math.floor(100 / total * wins);
  }

  pushLogin() {
    this.navCtrl.push(LoginPage);
  }
}
