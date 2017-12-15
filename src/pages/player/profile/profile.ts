import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SelectCompetitionPage } from '../../competition/select-competition/select-competition';
import { ApiService } from '../../../providers/api-service';
import { Subscription } from 'rxjs/Subscription';


/*
  Generated class for the Profile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  public amountOfCompetitions: number;
  private userSubscription: Subscription;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.userSubscription = this.apiService.getUser(this.apiService.uid).subscribe(user => {
      this.amountOfCompetitions = Object.keys(user.competitions).length;
    })
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
