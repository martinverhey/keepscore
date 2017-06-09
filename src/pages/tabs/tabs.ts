import { Component } from '@angular/core';

import { RankingPage } from '../ranking/ranking';
import { ScorePage } from '../score/score';
import { PlayersPage } from '../players/players';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = RankingPage;
  tab2Root: any = ScorePage;
  tab4Root: any = PlayersPage;

  constructor() {

  }
}
