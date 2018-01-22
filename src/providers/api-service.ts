import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { IPlayer } from '../models/player.models';
import { ICompetition } from '../models/competition.models';

@Injectable()
export class ApiService {
  player: IPlayer;

  constructor(
    private afDB: AngularFireDatabase
  ) {
    this.player = {
      uid: '',
      username: '',
      competition_selected: '',
    }
   }

   getCurrentPlayer(authID): Observable<IPlayer> {
    return this.afDB.object('/users/' + authID)
      .snapshotChanges()
      .map(player => {
        return {
          uid: player.key, ...player.payload.val()
        };
      })
      .map(res => res as IPlayer);
  }

  set currentPlayer(player) {
    this.player = player;
  }

  get uid(): string {
    return this.player.uid;
  }

  get username(): string {
    return this.player.username;
  }

  get competitionSelected(): string {
    return this.player.competition_selected;
  }
   
  getCompetitions() {
    return this.afDB.list('/competition', ref => ref.limitToLast(50))
    .snapshotChanges()
    .map(actions => {
      return actions.map(action => ({
        key: action.key, ...action.payload.val()
      }));
    });
  }
  
  getCompetitionsForCurrentUser() {
    return this.afDB.list('/users/' + this.player.uid + '/competitions/', ref => ref.limitToLast(10))
    .snapshotChanges()
    .map(competitions => {
      return competitions.map(competition => ({
        name: competition.payload.val(),
        key: competition.key,
      }));
    });
    // .map(competitions => {
    //   return competitions.map(competition => ({
    //     name: competition.payload.val(),
    //     key: competition.key, ...competition.payload.val()
    //   }))
    // });
    // .map(actions => {
    //   return actions.map(action => ({
    //     key: action.key, ...action.payload.val()
    //   }));
    // });
  }
  
  getMatches() {
    return this.afDB.list('/matches/' + this.player.competition_selected, ref => ref.limitToLast(50)).valueChanges();
  }
  
  getPlayersInCompetition(competitionid) {
    return this.afDB.list('/rank/' + competitionid)
    .snapshotChanges()
    .map(actions => {
      return actions.map(action => ({
        key: action.key, ...action.payload.val()
      }));
    });
  }

  getUsers() {
    return this.afDB.list('/users', ref => ref.limitToLast(50)).valueChanges();
  }
    
  getUser(uid): Observable<IPlayer> {
    return this.afDB.object('/users/' + uid).valueChanges().map(res => res as IPlayer);
  }

  getCompetition(key) {
    return this.afDB.object('/competition/' + key).valueChanges().map(res => res as ICompetition);
  }

  saveMatch(competition) {
    return this.afDB.list('/matches/' + this.player.competition_selected).push(competition);
  }

  saveUser(uid, username) {
    return this.afDB.list('/users').update(uid, {
      "username": username
    })
  }

  saveCompetition(name, uid) {
    return this.afDB.list('/competition').push({
      "name": name,
      "admin": uid,
      "users": {
        [uid]: true
      }
    })
  }

  addPlayerToCompetition(key, competitionName) {
    let updateData = {};
    updateData['competition/' + key + '/users/' + this.player.uid] = this.player.username;
    updateData['users/' + this.player.uid + '/competition_selected'] = key;
    updateData['users/' + this.player.uid + '/competitions/' + key] = competitionName;
    updateData['rank/' + key + '/' + this.player.uid + '/username'] = this.player.username;
    return firebase.database().ref().root.update(updateData, function(error) {
      if (error) {
        console.log("Error updating data:", error);
      }
    });

    // firebase.database().ref('competition/' + key + '/users/' + this.player.uid).set(this.player.username);
    // firebase.database().ref('users/' + this.player.uid + '/competition_selected').set(key);
    // firebase.database().ref('users/' + this.player.uid + '/competitions/' + key).set(competitionName);
    // firebase.database().ref('rank/' + key + '/' + this.player.uid + '/username').set(this.player.username);
  }

  switchCompetition(key) {
    firebase.database().ref('users/' + this.player.uid + '/competition_selected').set(key);
    this.player.competition_selected = key;
  }

}
