import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { QRScanner } from '@ionic-native/qr-scanner';
import { Clipboard } from '@ionic-native/clipboard';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { QRCodeModule } from 'angular2-qrcode';

import { MyApp } from './app.component';
import { ResultsPage } from '../pages/matches/results/results';
import { AddMatchPage } from '../pages/matches/add-match/add-match';
import { LeaderboardPage } from '../pages/leaderboard/leaderboard/leaderboard';
import { LeaderboardInfoPage } from '../pages/leaderboard/leaderboard-info/leaderboard-info';
import { PlayersPage } from '../pages/player/players/players';
import { AddPlayerPage } from '../pages/player/add-player/add-player';
import { PlayerListPage } from '../pages/player/player-list/player-list';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { UsernamePage } from '../pages/username/username';
import { SelectCompetitionPage } from '../pages/competition/select-competition/select-competition';
import { AddCompetitionPage } from '../pages/competition/add-competition/add-competition';
import { JoinCompetitionPage } from '../pages/competition/join-competition/join-competition';
import { CompetitionPage } from '../pages/player/competition/competition';
import { TabsPage } from '../pages/tabs/tabs';
import { ApiService } from '../providers/api-service';
import { OrderByPipe } from '../providers/orderBy.pipe';
import { ArrayFilterPipe } from '../providers/array-filter.pipe';
import { SearchPipe } from '../providers/search.pipe';
import { AuthService } from '../providers/auth-service';
import { ProfilePage } from '../pages/profile/profile';
 
// AF2 Settings
export const firebaseConfig = {
  // PRODUCTION
  // apiKey: "AIzaSyDAFwPnqLjlsQyBY7_O4T_cT46q3jndSfA",
  // authDomain: "keepscore-c4562.firebaseapp.com",
  // databaseURL: "https://keepscore-c4562.firebaseio.com",
  // projectId: "keepscore-c4562",
  // storageBucket: "keepscore-c4562.appspot.com",
  // messagingSenderId: "306614329685"

  // DEVELOPMENT
  apiKey: "AIzaSyB8noOfNh0bHh7EBwWIHW7h1HCH9BhDKH8",
  authDomain: "keepscoredev.firebaseapp.com",
  databaseURL: "https://keepscoredev.firebaseio.com",
  projectId: "keepscoredev",
  storageBucket: "keepscoredev.appspot.com",
  messagingSenderId: "673709134237"
};

@NgModule({
  declarations: [
    MyApp,
    ResultsPage,
    AddMatchPage,
    LeaderboardPage,
    LeaderboardInfoPage,
    PlayersPage,
    AddPlayerPage,
    PlayerListPage,
    LoginPage,
    RegisterPage,
    UsernamePage,
    SelectCompetitionPage,
    AddCompetitionPage,
    JoinCompetitionPage,
    CompetitionPage,
    ProfilePage,
    TabsPage,
    OrderByPipe,
    SearchPipe,
    ArrayFilterPipe
  ],
  imports: [
  	BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    QRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ResultsPage,
    AddMatchPage,
    LeaderboardPage,
    LeaderboardInfoPage,
    PlayersPage,
    AddPlayerPage,
    PlayerListPage,
    LoginPage,
    RegisterPage,
    UsernamePage,
    SelectCompetitionPage,
    AddCompetitionPage,
    JoinCompetitionPage,
    CompetitionPage,
    ProfilePage,
    TabsPage
  ],
  providers: [
    ApiService,
    OrderByPipe, 
    ArrayFilterPipe, 
    SearchPipe, 
    AuthService,
    QRScanner,
    StatusBar,
    SplashScreen,
    AngularFireDatabase,
    Clipboard,
    {
      provide: ErrorHandler, useClass: IonicErrorHandler
    }]
})
export class AppModule {}
