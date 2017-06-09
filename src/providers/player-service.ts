import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the PeopleService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PlayerService {
  private BASE_URL = "http://localhost:3000/v1";
  // private observable;

  constructor(public http: Http) {
    console.log('PlayerService Provider activated');
  }

  // constructor(private http: Http) { }

  getPeople() {
    return this.http.get(this.BASE_URL+'/users')
      .map(response => response.json());
  }
}
