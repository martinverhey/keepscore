import { DataService } from '../providers/data-service';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ScorePage } from '../pages/score/score';
import { AddMatchPage } from '../pages/add-match/add-match';
import { RankingPage } from '../pages/ranking/ranking';
import { PlayersPage } from '../pages/players/players';
import { AddPlayerPage } from '../pages/add-player/add-player';
import { TabsPage } from '../pages/tabs/tabs';
import { ApiService } from '../providers/api-service';
import { PlayerService } from '../providers/player-service';
import { OrderByPipe } from '../providers/orderBy.pipe';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
 
// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyDAFwPnqLjlsQyBY7_O4T_cT46q3jndSfA",
  authDomain: "keepscore-c4562.firebaseapp.com",
  databaseURL: "https://keepscore-c4562.firebaseio.com",
  projectId: "keepscore-c4562",
  storageBucket: "keepscore-c4562.appspot.com",
  messagingSenderId: "306614329685"
};

@NgModule({
  declarations: [
    MyApp,
    ScorePage,
    AddMatchPage,
    RankingPage,
    PlayersPage,
    AddPlayerPage,
    TabsPage,
    OrderByPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ScorePage,
    AddMatchPage,
    RankingPage,
    PlayersPage,
    AddPlayerPage,
    TabsPage
  ],
  providers: [ApiService, PlayerService, OrderByPipe, DataService, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
