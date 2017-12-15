import {Injectable} from '@angular/core';
// Import the AF2 Module
import {AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class DataService {
    public db: FirebaseListObservable<any>;
    public users: FirebaseListObservable<any>;
    public matches: FirebaseListObservable<any>;

    constructor(private angularFire:AngularFire) {
        this.db = angularFire.database.list('/');
        this.users = angularFire.database.list('/users');
        this.matches = angularFire.database.list('/matches');
    }
}