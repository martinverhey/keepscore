import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { SelectCompetitionPage } from '../../competition/select-competition/select-competition';
import { ApiService } from '../../../providers/api-service';
import { Clipboard } from '@ionic-native/clipboard';
import { IPlayer } from '../../../models/player.models';


/*
  Generated class for the Profile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-competition',
  templateUrl: 'competition.html'
})
export class CompetitionPage {
  public player: IPlayer;
  public competitionName: string;
  public currentCompetitionID: string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private apiService: ApiService,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    private clipboard: Clipboard,
  ) {}

  ngOnInit() {
    this.player = this.apiService.player;
    this.competitionName = this.player.competitions[this.player.competition_selected];
    this.currentCompetitionID = this.player.competition_selected;
  }

  copyToClipboard() {
    this.clipboard.copy(this.currentCompetitionID);
    this.presentToast("Copied!");
  }

  dismissModal() {
    this.viewCtrl.dismiss(this);
  }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 1000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }

  pushPage() {
    this.navCtrl.push(SelectCompetitionPage);
  }

}
