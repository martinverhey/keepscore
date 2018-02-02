import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { SelectCompetitionPage } from '../../competition/select-competition/select-competition';
import { ApiService } from '../../../providers/api-service';
import { Subscription } from 'rxjs/Subscription';
import { Clipboard } from '@ionic-native/clipboard';
// import { Printer, PrintOptions } from '@ionic-native/printer';


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
  public amountOfCompetitions: number;
  private userSubscription: Subscription;
  private competition: any;
  private currentCompetitionID: string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private apiService: ApiService,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    private clipboard: Clipboard,
  ) {}

  ngOnInit() {
    this.competition = this.apiService.currentCompetition;
    this.currentCompetitionID = this.apiService.player.competition_selected;
    this.apiService.getCompetitions()
      .map(competitions => competitions.find(competition => competition.key == this.currentCompetitionID))
      .take(1)
      .subscribe(competition => this.competition = competition);
  }

  copyToClipboard() {
    this.clipboard.copy(this.currentCompetitionID);
    this.presentToast("Copied!");
  }

  // Return to previous page
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
      console.log('Dismissed toast');
    });

    toast.present();
  }

  pushPage() {
    this.navCtrl.push(SelectCompetitionPage);
  }

}
