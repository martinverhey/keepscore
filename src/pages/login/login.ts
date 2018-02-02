import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
// import { AuthProviders, AuthMethods, AngularFire } from 'angularfire2';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  signupData = {
    email: '',
    password: '',
    passwordRetyped: ''
  };
  private registered: boolean = false;
  private title: string = "Login";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController
  ) {}

  submit() {
    if (this.registered) {
      this.register();
    } else if (!this.registered) {
      this.login();
    }
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.signupData.email, this.signupData.password)
      .then((response) => {
        console.log('Login success');
        console.log(response);

        let currentuser = {
          email: response.auth.email,
          picture: response.auth.photoURL
        };
        console.log(currentuser);
    }).catch((error) => {
      this.presentToast(error.message);
    })
  }

  register() {
    console.log("Register");
    if (this.signupData.password !== this.signupData.passwordRetyped) {
      this.presentToast("Your password and re-entered password do not match.")
      console.log(this.signupData.password);
      console.log(this.signupData.passwordRetyped);
    } else {
      this.afAuth.auth.createUserWithEmailAndPassword(this.signupData.email, this.signupData.password)
      .then(auth => {
        // Could do something with the Auth-Response
        console.log(auth);
      })
      .catch(err => {
        // Handle error
        this.presentToast(err.message.toString());
      })
    }
  }

  switchToRegister() {
    this.registered = true;
    this.title = "Register";
  }

  switchToLogin() {
    this.registered = false;
    this.title = "Login";
  }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
}
