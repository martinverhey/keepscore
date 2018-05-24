import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { LoginPage } from '../login/login';
import { IPlayer } from '../../models/player.models';
import { ICompetition } from '../../models/competition.models';

/*
  Generated class for the Username page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-username',
  templateUrl: 'username.html'
})
export class UsernamePage {
  private username: string = "";
  private player: IPlayer = this.apiService.player;
  private players: {};
  private playerList: any[] = [];
  private competition: ICompetition;
  private mistakeMade = false;
  public usernameExists: boolean = false;

  constructor(private navCtrl: NavController, 
              private apiService: ApiService,
              private viewCtrl: ViewController,
              private navParams: NavParams,
              private toastCtrl: ToastController) {
                this.competition = this.navParams.get('competition');
              }

  ngOnInit() {
    this.players = this.competition.users;
    Object.keys(this.players).forEach(player => {
      this.playerList.push(this.players[player]);
    })
    this.playerList.sort()
  }

  saveUsername() {
    this.mistakeMade = false;
    Object.keys(this.players).forEach(player => {
      let value = this.players[player];
      if (value.trim().toLowerCase() === this.username.trim().toLowerCase()) {
        this.presentToast(value + ' already exists. Choose a different name.');
        this.mistakeMade = true;
      }
    })
    if (!this.mistakeMade) {
      this.apiService.player[this.competition.key] = this.username;
      this.apiService.player.username = this.username;
      this.viewCtrl.dismiss(this.username);
    }
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage);
  }

  cancelModal() {
    this.viewCtrl.dismiss();
  }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }
}