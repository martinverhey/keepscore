export class Team {
  private id: number
  private score: number
  private players: any;

  constructor () {
    this.score = 0;
    this.players = [];
  }

  //Getters
  getScore() {
    return this.score;
  }

  getPlayers() {
    return this.players;
  }

  getID() {
    return this.id;
  }

  //Setters
  setScore(score:number){
    this.score = score
  }

  setID(id:number) {
    this.id = id;
  }

  setPlayers(id, username) {
    this.players.push({
      id: id,
      username: username
    })
  }

  clearPlayers() {
    this.players = [];
  }
}
