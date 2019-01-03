import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { ApiService } from '../../../providers/api-service';
import { ICompetition } from '../../../models/competition.models';

/*
  Generated class for the AddPlayer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-player',
  templateUrl: 'add-player.html'
})
export class AddPlayerPage {
  public username: string = "";
  public mistakeMade = false;
  public playerList: any[] = [];
  private players: any[] = [];
  private competition: ICompetition;
  private competitionID: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private toastCtrl: ToastController,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.competitionID = this.apiService.player.competition_selected;
    this.apiService.getCompetition(this.competitionID).take(1).subscribe(competition => {
      if (competition) {
        this.competition = competition;
        this.players = this.competition.users;
        Object.keys(this.competition.users).forEach(user => {
          this.playerList.push(this.competition.users[user]);
        })
        this.playerList.sort();
      }
    });
  }

  popPage() {
    this.navCtrl.pop();
  }

  savePlayer() {
    this.mistakeMade = false;
    Object.keys(this.players).forEach(player => {
      let value = this.players[player];
      if (value.trim().toLowerCase() === this.username.trim().toLowerCase()) {
        this.presentToast(value + ' already exists. Choose a different name.');
        this.mistakeMade = true;
      }
    })
    if (!this.mistakeMade) {
      let date = new Date();
      let uid = this.apiService.uid;
      let currentPlayerUsername = this.apiService.username;
      let dummyUID = this.apiService.uid + date.getTime();

      this.apiService.createDummy(dummyUID).then(() => {
        this.apiService.saveDummy(dummyUID, uid, currentPlayerUsername).then(() => {
          this.apiService.getUser(dummyUID).take(1).subscribe(dummy => {
            this.apiService.addDummyToCompetition(this.username, dummyUID, this.competitionID, this.competition.name).then(() => {
               this.presentToast(this.username + " added to competition");
            });
          })
        })
      })
      this.popPage();
    }

    // if (this.username.length <= 10) {
    //   this.presentToast('Player was added successfully');
    //   this.popPage();
    // } else if (this.username.length > 10) {
    //   this.presentToast('Only 10 characters allowed');
    // }

    // this.apiService.addPlayerToCompetition(item.key, this.name).then(() => {
    //   this.presentToast('Successfully created: ' + this.name);
    // });
      // setTimeout(() => {
      //   const root = this.app.getRootNav();
      //   root.setRoot(MyApp);
      // }, 500);


    // ngOnInit() {
    //   this.players = this.competition.users;
    //   Object.keys(this.players).forEach(player => {
    //     this.playerList.push(this.players[player]);
    //   })
    //   this.playerList.sort()
    // }
  
    // saveUsername() {
    //   this.mistakeMade = false;
    //   Object.keys(this.players).forEach(player => {
    //     let value = this.players[player];
    //     if (value.trim().toLowerCase() === this.username.trim().toLowerCase()) {
    //       this.presentToast(value + ' already exists. Choose a different name.');
    //       this.mistakeMade = true;
    //     }
    //   })
    //   if (!this.mistakeMade) {
    //     this.apiService.player[this.competition.key] = this.username;
    //     this.apiService.player.username = this.username;
    //     this.viewCtrl.dismiss(this.username);
    //   }
    // }
  

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
