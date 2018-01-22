import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { SelectCompetitionPage } from '../../competition/select-competition/select-competition';
import { ApiService } from '../../../providers/api-service';
import { Subscription } from 'rxjs/Subscription';
import { Clipboard } from '@ionic-native/clipboard';


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
    private clipboard: Clipboard
  ) {}

  ngOnInit() {
    this.currentCompetitionID = this.apiService.player.competition_selected;
    this.apiService.getCompetitions().take(1).subscribe(competitions => {
      let competition = competitions.filter(element => element.key == this.currentCompetitionID)[0];
      competition.usersLength = Object.keys(competition.users).length;
      this.competition = competition;
    })
    this.userSubscription = this.apiService.getUser(this.apiService.player.uid).subscribe(user => {
      this.amountOfCompetitions = Object.keys(user.competitions).length;
    })
  }

  copyToClipboard() {
    this.clipboard.copy(this.currentCompetitionID);
    
    this.clipboard.paste().then(
      (resolve: string) => {
        this.presentToast(resolve);
      },
      (reject: string) => {
        this.presentToast('Error: ' + reject);
      }
    );
  }

  // Return to previous page
  dismissModal() {
    this.viewCtrl.dismiss(this);
  }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  pushPage() {
    this.navCtrl.push(SelectCompetitionPage);
  }

}
