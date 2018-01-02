import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { LoginPage } from '../login/login';

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

  constructor(private navCtrl: NavController, 
              private authService: AuthService) {}

  loginAnonymous() {
    this.authService.anonymousLogin(this.username);
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage);
  }
}
