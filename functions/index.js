'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// Calculate score
exports.calculatePoints = functions.database.ref('/matches/{competitionid}/{matchid}').onCreate((snap, context) => {
  const competitionid = context.params.competitionid;
  const matchid = context.params.matchid;

  const snapshot = snap;
  const match = snap.val();
  console.log(match);
  const match_path = competitionid + '/' + matchid;
  const created_at = match.created_at;
  const scoreTeam1 = Number(match.scores.team1);
  const scoreTeam2 = Number(match.scores.team2);  
  const teams = match.teams;
  const constant = 60;
  const scoreDifference = Math.abs(scoreTeam1 - scoreTeam2);
  const scoreDifferenceCapped = Math.min(Math.max(scoreDifference, 0), 10);
  const pointsToWin = constant + scoreDifferenceCapped;

  var teamRankings = [];
  var teamOnevsTwo = 0;

  getTeamRanks();

  function getTeamRanks() {
    var totalTeams = 0;    
    var averageTeamPoints = [];
    var amountOfPlayers = [];
    
    Object.keys(teams).forEach(function(team) {
      var totalTeamPoints = 0;
      var totalTeamPlayers = 0;
      var teamRanking = [];

      Object.keys(teams[team]).forEach(function(player) {
        return admin.database().ref('/rank/' + competitionid + '/' + teams[team][player].id).once('value').then(function(snapshot) {                
          let rank = Number(snapshot.val().rank);
          let username = teams[team][player].username;
          let id = teams[team][player].id;

          teamRanking.push(rank);        
          totalTeamPoints += rank;
          totalTeamPlayers++;
          console.log(match_path + " " + username + " " + rank + " (" + totalTeamPlayers + "/" + Object.keys(teams[team]).length + ")");
          
          if (totalTeamPlayers == Object.keys(teams[team]).length) {
            amountOfPlayers.push(totalTeamPlayers);
            totalTeams++;
            console.log(match_path + " " + team + " average " + totalTeamPoints / Object.keys(teams[team]).length);
            teamRankings.push(teamRanking);
            averageTeamPoints.push(totalTeamPoints / Object.keys(teams[team]).length);
          }

          if (totalTeams == Object.keys(teams).length) {
            if (amountOfPlayers[0] > amountOfPlayers[1]) {
              teamOnevsTwo = 1;
              let previousPoints = averageTeamPoints[0];
              averageTeamPoints[0] = averageTeamPoints[0] * 1.25;
              console.log(match_path + " team1 2v1 strength adjustment " + previousPoints + " * 1.25 = " + averageTeamPoints[0]);
            } else if (amountOfPlayers[1] > amountOfPlayers[0]) {
              teamOnevsTwo = 2;
              let previousPoints = averageTeamPoints[1];
              averageTeamPoints[1] = averageTeamPoints[1] * 1.25;
              console.log(match_path + " team2 2v1 strength adjustment " + previousPoints + " * 1.25 = " + averageTeamPoints[1]);
            }
            winExpectation(averageTeamPoints);
          }
        })        
      })
    })
  }

  function winExpectation(averageTeamPoints) {
    var strengthDifference = 0;
    var winExpectation = 0;

    // Calculate the strength difference (in points) between both teams. Limit to 400 (above that the formula doesn't work).
    strengthDifference = Math.abs(Number(averageTeamPoints[0]) - Number(averageTeamPoints[1]));
    strengthDifference = Math.min(Math.max(strengthDifference, 0), 400);
    winExpectation = -0.000003 * (strengthDifference * strengthDifference) + 0.0023 * strengthDifference + 0.5;
    if (scoreDifference > 10) {
      console.log(match_path + " Point pool " + pointsToWin + " (" + constant + " + score difference maxed at " + scoreDifferenceCapped + "(was " + scoreDifference + "))");
    } else {
      console.log(match_path + " Point pool " + pointsToWin + " (" + constant + " + score difference " + scoreDifferenceCapped + ")");
    }
    setMultiplicationValues(strengthDifference, winExpectation, averageTeamPoints);
  }

  function setMultiplicationValues(strengthDifference, winExpectation, averageTeamPoints) {
    var multiplication = [];
    
    // Team 1 is stronger
    if (averageTeamPoints[0] > averageTeamPoints[1])
    {
      multiplication.push(1 - winExpectation);
      multiplication.push(winExpectation);
      console.log(match_path + " Team 1 is " + strengthDifference + " points stronger. Win chance of ~" + Math.round(winExpectation * 100) + "%");
    }
    // Both teams have the same strength.
    else if (averageTeamPoints[0] == averageTeamPoints[1]) 
    {
      multiplication.push(winExpectation);
      multiplication.push(winExpectation);
      console.log(match_path + " Teams are equally strong with " + strengthDifference + " points difference. Win chance is " + winExpectation * 100 + "%");
    }
    // Team 2 is stronger
    else if (averageTeamPoints[0] < averageTeamPoints[1])
    {
      multiplication.push(winExpectation);
      multiplication.push(1 - winExpectation);
      console.log(match_path + " Team 2 is " + strengthDifference + " points stronger. Win chance of ~" + Math.round(winExpectation * 100) + "%");
    }
    setPoints(multiplication);    
  }

  function setPoints(multiplication) {
    var pointsChanged = [];

    // Team 1 won
    if (scoreTeam1 > scoreTeam2) {
      let pointsTeam1 = Math.round(pointsToWin * multiplication[0]);
      pointsChanged.push(pointsTeam1);
      pointsChanged.push(-pointsTeam1);
      console.log(match_path + " Multiplication Team 1: " + multiplication[0] + " Team 2: " + multiplication[1])
      console.log(match_path + " " + pointsToWin + " * " + multiplication[0] + " = " + pointsChanged[0]);
      console.log(match_path + " Team 1 won " + pointsChanged[0] + " Team 2 lost " + pointsChanged[1]);
      saveTeamPoints(pointsChanged);
    }
    // Draw
    else if (scoreTeam1 == scoreTeam2) {
      pointsChanged.push(0);
      pointsChanged.push(0);
      console.log(match_path + " Draw. No points won/lost.");
      saveTeamPoints(pointsChanged);
    } 
    // Team 2 won
    else if (scoreTeam1 < scoreTeam2) {
      let pointsTeam2 = Math.round(pointsToWin * multiplication[1]);
      pointsChanged[1] = pointsTeam2;
      pointsChanged[0] = -pointsTeam2;
      console.log(match_path + " Team 1 multiplication: " + multiplication[0] + " Team 2 multiplication: " + multiplication[1])
      console.log(match_path + " " + pointsToWin + " * " + multiplication[1] + " = " + pointsChanged[1]);
      console.log(match_path + " Team 2 won " + pointsChanged[1] + " Team 1 lost " + pointsChanged[0]);
      saveTeamPoints(pointsChanged);
    }
  }

  function saveTeamPoints(pointsChanged) {
    admin.database().ref('/matches/' + match_path + '/points').set({
      "team1": pointsChanged[0],
      "team2": pointsChanged[1]
    })
    updatePlayerRanking(pointsChanged);
  }

  function updatePlayerRanking(pointsChanged) {
    if (teamOnevsTwo == 1) {
      pointsChanged[0] = pointsChanged[0] / 2;
    } else if (teamOnevsTwo == 2) {
      pointsChanged[1] = pointsChanged[1] / 2;
    }
    Object.keys(teams).forEach(function(team, key) {
      Object.keys(teams[team]).forEach(function(player, key2) {
        let id = teams[team][player].id;
        let username = teams[team][player].username;
        let newRank = teamRankings[key][key2] + pointsChanged[key];
        console.log(match_path + " " + id + " " + username + " " + teamRankings[key][key2] + " (" + pointsChanged[key] + ") = " + newRank);
        admin.database().ref('/ranking/' + id + '/' + match_path).set({
          "timestamp": created_at,
          "change": pointsChanged[key],
          "previous": teamRankings[key][key2],
          "new": newRank,
          "username": username
        })
        let status = pointsChanged[key] > 0 ? 'won' : pointsChanged[key] == 0 ? 'draw' : 'lost';
        admin.database().ref('/users/' + id + '/matches/' + match_path).set(status);
        admin.database().ref('/rank/' + competitionid + '/' + id + '/rank').transaction(function(currentRank) {
          let updatedRank = currentRank + pointsChanged[key];
          return updatedRank;
        });
      })
    })
  }

  return 0;

});

exports.removePoints = functions.database.ref('/matches/{competitionid}/{matchid}').onDelete((snap, context) => {
  // When the data is deleted.
  const competitionid = context.params.competitionid;
  const matchid = context.params.matchid;
  const snapshot = snap;
  const match = snap.val();
  const match_path = competitionid + '/' + matchid;
  const teams = match.teams;
  const points = match.points;

  console.log("Match " + match_path + " got deleted.")
  console.log(match);

  onDelete(match_path, teams, points, competitionid);

  return 0;

  function onDelete(match_path, teams, points, competitionid) {
    if (teams.team1 < teams.team2) {
      console.log(match_path + " 1v2");
      points.team2 = points.team2 / 2;
    } else if (teams.team2 < teams.team1) {
      console.log(match_path + " 2v1");
      points.team1 = points.team1 / 2;
    }

    Object.keys(teams).forEach(function(team, key) {
      Object.keys(teams[team]).forEach(function(player, key2) {
        let id = teams[team][player].id;
        let username = teams[team][player].username;
        let oldRank = 0;
        let change = Number(points[team]);
        
        return admin.database().ref('/users/' + id).once('value').then(function(snapshot) {
          admin.database().ref('/users/' + id + '/matches/' + match_path).remove()
          admin.database().ref('/ranking/' + id + '/' + match_path).remove()
          admin.database().ref('/rank/' + competitionid + '/' + id + '/rank').transaction(function(currentRank) {
            oldRank = currentRank;
            let newRank = currentRank - change;
            return newRank;
          }, function(error, committed, snapshot) {
            console.log(match_path + " " + id + " " + username + " " + oldRank + " (refund " + change * -1 + ") = ", snapshot.val());
          });
        })

      })
    })

  }
  
  return 0;
});

exports.setDefaultRank = functions.database.ref('/rank/{competitionid}/{userid}').onCreate((snap, context) => {
  const competitionid = context.params.competitionid;
  const userid = context.params.userid;
  
  const snapshot = snap;
  const user = snap.val();
  const path = snapshot._path.replace('/rank/','');

  admin.database().ref('/rank/' + path + '/rank').transaction(function(currentRank) {
    currentRank = 1000;
    return currentRank;
  }, function(error, committed, snapshot) {
    console.log(path + " created")
    console.log(user.username + " default rank is set at ", snapshot.val());
  });

  admin.database().ref('/ranking/' + userid + '/' + competitionid + '/' + 'Default').set({
    "timestamp": admin.database.ServerValue.TIMESTAMP,
    "change": 1000,
    "previous": 1000,
    "new": 1000,
    "username": user.username
  })

  return 0;

});

exports.removeDefaultRank = functions.database.ref('/rank/{competitionid}/{userid}').onDelete((snap, context) => {
  const snapshot = snap;
  const user = snap.val();
  const path = snapshot._path.replace('/rank/','');
  console.log(path);
  console.log(path + "/" + snapshot._data + " got deleted.")
  
  return 0;
});