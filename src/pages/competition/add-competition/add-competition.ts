import { Component } from '@angular/core';
import { App, NavController, NavParams, ModalController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { TabsPage } from '../../tabs/tabs';
import { UsernamePage } from '../../username/username';
import { MyApp } from '../../../app/app.component';
import { ICompetition } from '../../../models/competition.models';

/*
  Generated class for the AddPlayer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-competition',
  templateUrl: 'add-competition.html'
})
export class AddCompetitionPage {
  public name: string;
  private uid: string;
  private competition: ICompetition;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private apiService: ApiService, 
    private toastCtrl: ToastController,
    private app: App,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.uid = this.apiService.player.uid;
  }

  // Return to previous page
  popPage() {
    this.navCtrl.pop();
  }

  save() {
    if (this.name.length <= 20) {
      this.apiService.saveCompetition(this.name, this.uid).then((item) => {
        this.competition = {
          name: this.name,
          key: item.key,
          users: []
        }
        let modal;
        modal = this.modalCtrl.create(UsernamePage, {competition: this.competition})
        modal.onDidDismiss(data => {
          if (data) {
            this.apiService.addPlayerToCompetition(item.key, this.name).then(() => {
              this.presentToast('Successfully created: ' + this.name);
              setTimeout(() => {
                const root = this.app.getRootNav();
                root.setRoot(MyApp);
              }, 100);
            });
          }
        })
        modal.present();
      });
    } else if (this.name.length > 20) {
      this.presentToast('Only 20 characters allowed');
    }
  }

  joinCompetition(competitionID) {
    if (competitionID.length == 20) {
      this.apiService.getCompetition(competitionID).take(1).subscribe(competition => {
        if (competition) {
          if (!competition.users[this.apiService.player.uid]) {
            let modal;
            modal = this.modalCtrl.create(UsernamePage, {competition: competition})
            modal.onDidDismiss(data => {
              if (data) {
                this.apiService.addPlayerToCompetition(competitionID, competition.name).then(() => {
                  this.presentToast('Successfully joined: ' + competition.name);
                  setTimeout(() => {
                    const root = this.app.getRootNav();
                    root.setRoot(MyApp);
                  }, 100);
                });
              }
            })
            modal.present();
          }
          else {
            this.presentToast('You are already in this competition.');
          }
        } else {
          this.presentToast('Competition does not exist.');
        }
      })
    } else {
      this.presentToast('Competition does not exist.');
    }
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
