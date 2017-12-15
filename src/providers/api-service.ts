import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class ApiService {
  public player: {
    'uid': string,
    'username': string,
    'competition_selected': string
  } = {
      uid: "",
      username: "",
      competition_selected: ""
    };

  constructor(
    private afDB: AngularFireDatabase
  ) { }

  getUsers() {
    return this.afDB.list('/users', ref => ref.limitToLast(50)).valueChanges();
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

  getMatches(competition) {
    return this.afDB.list('/matches', ref => ref.orderByChild('competition')
      .equalTo(competition)
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

  getUser(uid) {
    return this.afDB.object('/users/' + uid).valueChanges();
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
    // if(this.userSub) {
    //   this.userSub.unsubscribe();
    // }
  }
}
