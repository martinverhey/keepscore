import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
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
  public yourself: IPlayer;
  public selectedPlayer: any;
  public playerName: string = '';
  public competition: ICompetition;
  public isAnonymous: boolean = false;
  public winRate: number = 0;
  public wins: number = 0;
  public losses: number = 0;
  public draws: number = 0;
  public history: number[];
  public currentPoints: number = 1000;
  public admin: string = "";
  private currentCompetition: string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    private afAuth: AngularFireAuth,
    private apiService: ApiService
  ) {
    this.selectedPlayer = this.navParams.get('player');
    this.admin = this.navParams.get('admin');
   }

  ngOnInit() {
    if (!this.selectedPlayer.key) {
      this.selectedPlayer.key = this.selectedPlayer.uid;
    }
    this.currentCompetition = this.apiService.competitionSelected;
    this.apiService.getRankHistory(this.selectedPlayer.key)
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

    this.yourself = this.apiService.player;

    this.apiService.getUser(this.selectedPlayer.key).subscribe((player) => {
      this.player = player;
      this.playerName = this.selectedPlayer.username;
      if (this.player.matches && this.player.matches[this.currentCompetition]) {
        this.winRate = this.calculateWinRate(this.player, this.currentCompetition);
      }
    })

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
                  lineTension: 0,
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

  calculateWinRate(player, currentCompetition): number {
    let matches = player.matches;
    let history = matches[currentCompetition];
    
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

  dismissModal() {
    this.viewCtrl.dismiss(this);
  }

  showConfirm(event, player) {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'This player will be completely removed from this competition. He will lose his ranking. This action cannot be undone.',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.apiService.removePlayerFromCompetition(this.currentCompetition, player.uid)
            this.viewCtrl.dismiss(this);
          }
        }
      ]
    });
    confirm.present();
  }
}
