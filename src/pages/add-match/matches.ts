export class Matches {
  id: number;
  team: [ {
    id: number;
    match_id: number;
    score: number;
    players: [ {
      id: number;
      team_id: number;
      user_id: number;
    } ]
  } ]
}
