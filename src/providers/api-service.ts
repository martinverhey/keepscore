import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { IPlayer } from '../models/player.models';

@Injectable()
export class ApiService implements OnDestroy {
  player: IPlayer;
  private userSub: Subscription;

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
  
  getCompetitionsForUser(uid) {
    return this.afDB.list('/competition/', ref => ref.orderByChild('users/' + uid)
    .limitToLast(50))
    .snapshotChanges()
    .map(actions => {
      return actions.map(action => ({
        key: action.key, ...action.payload.val()
      }));
    });
  }
  
  getCompetitionsForCurrentUser() {
    return this.afDB.list('/competition/', ref => ref.orderByChild('users/' + this.player.uid)
    .limitToLast(50))
    .snapshotChanges()
    .map(actions => {
      return actions.map(action => ({
        key: action.key, ...action.payload.val()
      }));
    });
  }
  
  getMatches() {
    let selectedCompetition = this.player.competition_selected
    return this.afDB.list('/matches', ref => ref.orderByChild('competition')
    .equalTo(selectedCompetition)
    .limitToLast(50))
    .valueChanges();
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

  saveMatch(competition) {
    return this.afDB.list('/matches').push(competition);
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

  createCompetitionAndAddPlayer(key, username, competitionName) {
    firebase.database().ref('competition/' + key + '/users/' + this.player.uid).set(username);
    firebase.database().ref('users/' + this.player.uid + '/competition_selected').set(key);
    firebase.database().ref('users/' + this.player.uid + '/competitions/' + key).set(competitionName);
    firebase.database().ref('rank/' + key + '/' + this.player.uid + '/username').set(this.player.username);
  }

  switchCompetition(key) {
    firebase.database().ref('users/' + this.player.uid + '/competition_selected').set(key);
    this.player.competition_selected = key;
  }

  ngOnDestroy() {
    if(this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
