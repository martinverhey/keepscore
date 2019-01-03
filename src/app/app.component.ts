import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { SelectCompetitionPage } from "../pages/competition/select-competition/select-competition";
import { ApiService } from '../providers/api-service';
import { TabsPage } from '../pages/tabs/tabs';
import { AuthService } from '../providers/auth-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(
              private platform: Platform, 
              private afAuth: AngularFireAuth, 
              private authService: AuthService,
              private apiService: ApiService,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar
            ) {
    this.afAuth.authState
      .do(auth => {
        if (!auth) {
          this.authService.anonymousLogin();
        }
      })
      .filter(auth => auth ? true : false)
      .switchMap(auth => this.apiService.getCurrentPlayer(auth.uid))
      .subscribe(currentPlayer => {
        console.log(currentPlayer);

        if (!this.rootPage) {
          if (currentPlayer.competition_selected) {
            this.rootPage = TabsPage;
          } else {
            this.rootPage = SelectCompetitionPage;
          }
        }
      })
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      if (this.platform.is('android')) {
        this.statusBar.styleLightContent();
      }
      splashScreen.hide();

      // window.fabric.Crashlytics.addLog("about to send a crash for testing!");
      // window.fabric.Crashlytics.sendCrash();
      
    });
  }
}
