import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { ApiService } from './api-service';
import { Subscription } from 'rxjs/Subscription';
import { User } from 'firebase';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthService {

  public authState: User = null;
  public playerData: any;
  private authSub: Subscription;

  constructor(
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.authSub = this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  anonymousLogin() {
    return this.afAuth.auth.signInAnonymously().then((response) => {

      this.apiService.saveUser(response.uid).then((response) => {
      });
    })
      .catch(error => this.presentToast(error.message));
  }

  get authenticated(): boolean {
    return this.authState !== null;
  }

  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false;
  }

  presentToast(text: string) {
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