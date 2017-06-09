import { DataService } from '../../providers/data-service';
import { Component } from "@angular/core";
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { ApiService } from '../../providers/api-service';
import { Match } from './match.component';
import { Team } from './team.component';

import * as Firebase from 'firebase';

@Component({
  selector: 'page-add-match',
  templateUrl: 'add-match.html',
})

export class AddMatchPage implements OnInit {
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

  constructor (public navCtrl: NavController, private apiService: ApiService, private toastCtrl: ToastController, private dataService: DataService) {
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
    console.log("Pop back to Scores");
  }

  // Save the 'add match' form input and send post requests to the Rest API server
  saveForm() {
    this.team1.setScore(this.score1);
    this.team2.setScore(this.score2);
    this.team1.clearPlayers();
    this.team2.clearPlayers();
    let formMistake = false;
    let playerSelectedMultipleTimes = false;
    this.playerCount = 0;

    // At least 1 player in each team && A player cannot be in both teams && Score has to be a positive number
    console.log(this.players);
    for (let player of this.players) {
      if (player.checkedTeam1 && !player.checkedTeam2) {
        this.team1.setPlayers(player.$key, player.username);
        this.playerCount++;
      }
      else if (player.checkedTeam2 && !player.checkedTeam1) {
        this.team2.setPlayers(player.$key, player.username);
        this.playerCount++;
      }
      else if (player.checkedTeam1 && player.checkedTeam2) {
        playerSelectedMultipleTimes = true;
      }
      else if (!player.checkedTeam1 && !player.checkedTeam2) {
        // Not selected
      }
      else {
        console.log("SOMETHING WENT WRONG.");
        console.dir(this.players);
      };
    }

    // If there are problems with the form, show the error's
    if (playerSelectedMultipleTimes) {
      formMistake = true;
      this.presentToast('A player can\'t be in both teams at ones.');
    } else if (this.team1.getPlayers().length < 1 || this.team2.getPlayers().length < 1) {
      formMistake = true;
      this.presentToast('Select at least one competitor on each side.');
    } else if (this.score1 < 0 || this.score2 < 0 || isNaN(this.score1) || isNaN(this.score2)) {
      formMistake = true;
      this.presentToast('Score has to be a positive number.');
    } else if (this.team1.getPlayers().length > 2 || this.team2.getPlayers().length > 2) {
      formMistake = true;
      this.presentToast('There should not be more than 2 players in one team.');
    }

    // Send the form data
    if (!formMistake) {
        this.team1.setScore(this.score1);
        this.team2.setScore(this.score2);
        this.match.getTeams().push(this.team1);
        this.match.getTeams().push(this.team2);
        console.log("Form result: ")
        console.log(this.match);
        this.saveMatch(this.match);
    }
  }

  getUsers() {
    this.dataService.users.subscribe(players => {
      for (let player of players) {
        player.checkedTeam1 = false;
        player.checkedTeam2 = false;
      }
      this.players = players;
    })
  }

  // Send the match data to the server
  saveMatch(match) {
    match.created_at = Firebase.database.ServerValue.TIMESTAMP
    console.log(match);
    match = {
      created_at: match.created_at,
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
    this.dataService.matches.push(match);
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



  virtualTrack (index, match) {
  return match.id;
  }
}
