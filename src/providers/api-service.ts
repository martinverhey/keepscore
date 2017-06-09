import { Injectable }     from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class ApiService {
  http: any;
  baseUrl: string;
  matches: any;

  constructor() {
  }

  saveMatch(scoreTeam1, scoreTeam2, usersTeam1, usersTeam2) {
    firebase.database().ref('matches/').set({
      scoreTeam1: scoreTeam1,
      usersTeam1: usersTeam1,
      scoreTeam2: scoreTeam2,
      usersTeam2: usersTeam2
    });
  }

}
