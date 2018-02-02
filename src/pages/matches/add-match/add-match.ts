import { Component, Input, OnInit } from "@angular/core";
import { NavController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/take';
import * as Firebase from 'firebase';

import { PlayerListPage } from '../../player/player-list/player-list';
import { ApiService } from '../../../providers/api-service';
import { Match } from './match.component';
import { Team } from './team.component';

@Component({
  selector: 'page-add-match',
  templateUrl: 'add-match.html',
})

export class AddMatchPage implements OnInit {
  @Input() player1: string = "";
  @Input() player2: string = "";
  @Input() player3: string = "";
  @Input() player4: string = "";

  matches: any[];
  players: any;
  team1: Team;
  team2: Team;
  score1: number;
  score2: number;
  playerCount: number;
  sendPlayerCount: number;
  match: Match;
  rankPrevious: number;
  rankDifference: number;
  rankExpectation: number;
  rankChange: number;
  rankNew: number;
  userSub: Subscription;

  constructor ( 
    public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    public modalCtrl: ModalController,
    private apiService: ApiService, 
    private toastCtrl: ToastController
  ) {
    this.team1 = new Team();
    this.team2 = new Team();
    this.match = new Match();
   }

  ngOnInit() {
    this.getUsers();
  }

  // Return to previous page
  popPage() {
    this.navCtrl.pop();
  }

  // Save the 'add match' form input and send post requests to the Rest API server
  saveForm() {
    this.team1.setScore(this.score1);
    this.team2.setScore(this.score2);
    this.team1.clearPlayers();
    this.team2.clearPlayers();
    let formMistake = false;
    let playerSelectedMultipleTimes = false;
    let duplicatePlayer = false;
    this.playerCount = 0;

    // At least 1 player in each team && A player cannot be in both teams && Score has to be a positive number
    if (this.player1 == this.player3 || this.player2 == this.player4) {
      duplicatePlayer = true;
    }
    
    for (let player of this.players) {
      if (player.checkedTeam1 && !player.checkedTeam2) {
        this.team1.setPlayers(player.key, player.username);
        this.playerCount++;
      }
      else if (player.checkedTeam2 && !player.checkedTeam1) {
        this.team2.setPlayers(player.key, player.username);
        this.playerCount++;
      }
      else if (player.checkedTeam1 && player.checkedTeam2) {
        playerSelectedMultipleTimes = true;
      }
      else if (!player.checkedTeam1 && !player.checkedTeam2) {
        // Not selected
      }
      else {
        console.log("Something went wrong.");
        console.dir(this.players);
      };
    }

    // If there are problems with the form, show the error's
    if (playerSelectedMultipleTimes) {
      formMistake = true;
      this.presentToast('A player can\'t be in both teams at ones.');
    } else if (this.team1.getPlayers().length < 1 || this.team2.getPlayers().length < 1) {
      formMistake = true;
      console.log(this.team1);
      console.log(this.team2);
      this.presentToast('Select at least one competitor on each side.');
    } else if (this.score1 < 0 || this.score2 < 0) {
      formMistake = true;
      this.presentToast('Score has to be a positive number');
    } else if (isNaN(this.score1) || isNaN(this.score2)) {
      formMistake = true;
      this.presentToast('Score has to be a number');
    } else if (this.score1 % 1 != 0 || this.score2 % 1 != 0) {
      formMistake = true;
      this.presentToast('Score should not have any decimals');
    } else if (this.team1.getPlayers().length > 2 || this.team2.getPlayers().length > 2) {
      formMistake = true;
      this.presentToast('There should not be more than 2 players in one team.');
    } else if (duplicatePlayer) {
      formMistake = true;
      this.presentToast('A player should only be in a team once.');
    }

    // Send the form data
    if (!formMistake) {
        this.team1.setScore(this.score1);
        this.team2.setScore(this.score2);
        this.match.getTeams().push(this.team1);
        this.match.getTeams().push(this.team2);
        this.saveMatch(this.match);
    }
  }

  getUsers() {
      this.userSub = this.apiService.getPlayersInCompetition(this.apiService.player.competition_selected).take(1).subscribe(players => {
      for (let player of players) {
        player.checkedTeam1 = false;
        player.checkedTeam2 = false;
      }
      this.players = players;
    })
  }

  // Send the match data to the server
  saveMatch(match) {
    match.created_at = Firebase.database.ServerValue.TIMESTAMP;
    match.userid = this.apiService.player.uid;
    match.username = this.apiService.player.username;
    match = {
      created_at: match.created_at,
      owner: {
        username: match.username,
        id: match.userid,
      },
      teams: {
        team1: this.team1.getPlayers(),
        team2: this.team2.getPlayers(),
      },
      scores: {
        team1: this.score1,
        team2: this.score2
      },
      points: {
        team1: "",
        team2: ""
      }
    }
    console.log(match);
    this.apiService.saveMatch(match);
    this.presentToast('Match was added successfully');
    this.popPage();
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

  selectPlayerModal(player) {
    let modal;
    if (player == "player1") {
      this.checkPlayer(this.player1, 1, false);
      modal = this.modalCtrl.create(PlayerListPage, {players: this.players, selectedPlayer: this.player1})
      modal.onDidDismiss(data => {
        if (data != null) {
          this.player1 = data.selectedPlayer;
          this.checkPlayer(this.player1, 1, true);
        }
      })
    } else if (player == "player3") {
      this.checkPlayer(this.player3, 1, false);
      modal = this.modalCtrl.create(PlayerListPage, {players: this.players, selectedPlayer: this.player3})
      modal.onDidDismiss(data => {
        if (data != null) {
          this.player3 = data.selectedPlayer;
          this.checkPlayer(this.player3, 1, true);
        }
      })
    } else if (player == "player2") {
      this.checkPlayer(this.player2, 2, false);
      modal = this.modalCtrl.create(PlayerListPage, {players: this.players, selectedPlayer: this.player2})
      modal.onDidDismiss(data => {
        if (data != null) {
          this.player2 = data.selectedPlayer;
          this.checkPlayer(this.player2, 2, true);
        }
      })
    } else if (player == "player4") {
      this.checkPlayer(this.player4, 2, false);
      modal = this.modalCtrl.create(PlayerListPage, {players: this.players, selectedPlayer: this.player4})
      modal.onDidDismiss(data => {
        if (data != null) {
          this.player4 = data.selectedPlayer;
          this.checkPlayer(this.player4, 2, true);
        }
      })
    }
    modal.present();
  }

  checkPlayer(selectedPlayer, team, check) {
    for (let player of this.players) {
      if (player.username == selectedPlayer) {
        if (team == 1) {
          if (check == true) {
            player.checkedTeam1 = true;
          } else if (check == false) {
            player.checkedTeam1 = false;
          }
        } else if (team == 2) {
          if (check == true) {
            player.checkedTeam2 = true;
          } else if (check == false) {
            player.checkedTeam2 = false;
          }
        }
      }
    }    
  }

  virtualTrack (index, match) {
  return match.id;
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
