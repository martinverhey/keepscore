import { Team } from './team.component';

export class Match {
  private id: number
  private teams: Team[]

  constructor () {
    this.teams = [];
  }

  getTeams() {
    return this.teams;
  }

  getID() {
    return this.id;
  }

  setID(id:number) {
    this.id = id;
  }
}
