'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// Calculate score
exports.calculatePoints = functions.database.ref('/matches/{matchid}').onWrite(event => {

  // When the data is deleted.
  if (!event.data.exists()) {
    const snapshot = event.data;
    const match = event.data.previous.val();
    const match_id = snapshot._path.replace('/matches/','');
    const teams = match.teams;
    const points = match.points;
    const competition_id = match.competition;

    console.log("Match " + match_id + " got deleted.")
    console.log(match);

    onDelete(match_id, teams, points, competition_id);

    return;
  }
  // Catch additional tries to trigger the write event.
  if (event.data.previous.exists()) {
    console.log("Calculation already done. Not starting again.")
    return;
  }

  const snapshot = event.data;
  console.log(snapshot);
  const match = event.data.val();
  console.log(match);
  const match_id = snapshot._path.replace('/matches/','');
  const created_at = match.created_at;
  const competition_id = match.competition;
  const scoreTeam1 = Number(match.scores.team1);
  const scoreTeam2 = Number(match.scores.team2);  
  const teams = match.teams;
  const constant = 60;
  const scoreDifference = Math.abs(scoreTeam1 - scoreTeam2);
  const pointsToWin = constant + scoreDifference;

  var teamRankings = [];

  console.log(match);

  getTeamRanks();

  function getTeamRanks() {
    var totalTeams = 0;    
    var averageTeamPoints = [];
    
    Object.keys(teams).forEach(function(team) {
      var totalTeamPoints = 0;
      var totalTeamPlayers = 0;
      var teamRanking = [];

      Object.keys(teams[team]).forEach(function(player) {
        return admin.database().ref('/rank/' + competition_id + '/' + teams[team][player].id).once('value').then(function(snapshot) {                
          let rank = Number(snapshot.val().rank);
          let username = teams[team][player].username;
          let id = teams[team][player].id;

          teamRanking.push(rank);        
          totalTeamPoints += rank;
          totalTeamPlayers++;
          console.log(match_id + " " + username + " " + rank + " (" + totalTeamPlayers + "/" + Object.keys(teams[team]).length + ")");
          
          if (totalTeamPlayers == Object.keys(teams[team]).length) {
            totalTeams++;
            console.log(match_id + " " + team + " average " + totalTeamPoints / Object.keys(teams[team]).length);
            teamRankings.push(teamRanking);
            averageTeamPoints.push(totalTeamPoints / Object.keys(teams[team]).length);
          }

          if (totalTeams == Object.keys(teams).length) {
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
    console.log(match_id + " Point pool " + pointsToWin + " (" + constant + " + score difference " + scoreDifference + ")");

    setMultiplicationValues(strengthDifference, winExpectation, averageTeamPoints);
  }

  function setMultiplicationValues(strengthDifference, winExpectation, averageTeamPoints) {
    var multiplication = [];
    
    // Team 1 is stronger
    if (averageTeamPoints[0] > averageTeamPoints[1])
    {
      multiplication.push(1 - winExpectation);
      multiplication.push(winExpectation);
      console.log(match_id + " Team 1 is " + strengthDifference + " points stronger. Win chance of ~" + Math.round(winExpectation * 100) + "%");
    }
    // Both teams have the same strength.
    else if (averageTeamPoints[0] == averageTeamPoints[1]) 
    {
      multiplication.push(winExpectation);
      multiplication.push(winExpectation);
      console.log(match_id + " Teams are equally strong with " + strengthDifference + " points difference. Win chance is " + winExpectation * 100 + "%");
    }
    // Team 2 is stronger
    else if (averageTeamPoints[0] < averageTeamPoints[1])
    {
      multiplication.push(winExpectation);
      multiplication.push(1 - winExpectation);
      console.log(match_id + " Team 2 is " + strengthDifference + " points stronger. Win chance of ~" + Math.round(winExpectation * 100) + "%");
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
      console.log(match_id + " Multiplication Team 1: " + multiplication[0] + " Team 2: " + multiplication[1])
      console.log(match_id + " " + pointsToWin + " * " + multiplication[0] + " = " + pointsChanged[0]);
      console.log(match_id + " Team 1 won " + pointsChanged[0] + " Team 2 lost " + pointsChanged[1]);
      saveTeamPoints(pointsChanged);
    }
    // Draw
    else if (scoreTeam1 == scoreTeam2) {
      pointsChanged.push(0);
      pointsChanged.push(0);
      console.log(match_id + " Draw. No points won/lost.");
      saveTeamPoints(pointsChanged);
    } 
    // Team 2 won
    else if (scoreTeam1 < scoreTeam2) {
      let pointsTeam2 = Math.round(pointsToWin * multiplication[1]);
      pointsChanged[1] = pointsTeam2;
      pointsChanged[0] = -pointsTeam2;
      console.log(match_id + " Team 1 multiplication: " + multiplication[0] + " Team 2 multiplication: " + multiplication[1])
      console.log(match_id + " " + pointsToWin + " * " + multiplication[1] + " = " + pointsChanged[1]);
      console.log(match_id + " Team 2 won " + pointsChanged[1] + " Team 1 lost " + pointsChanged[0]);
      saveTeamPoints(pointsChanged);
    }
  }

  function saveTeamPoints(pointsChanged) {
    admin.database().ref('/matches/' + match_id + '/points').set({
      "team1": pointsChanged[0],
      "team2": pointsChanged[1]
    })
    updatePlayerRanking(pointsChanged);
  }

  function updatePlayerRanking(pointsChanged) {
    Object.keys(teams).forEach(function(team, key) {
      Object.keys(teams[team]).forEach(function(player, key2) {
        let id = teams[team][player].id;
        let username = teams[team][player].username;
        let newRank = teamRankings[key][key2] + pointsChanged[key];
        console.log(match_id + " " + id + " " + username + " " + teamRankings[key][key2] + " (" + pointsChanged[key] + ") = " + newRank);
        admin.database().ref('/ranking/' + id + '/' + match_id).set({
          "timestamp": created_at,
          "competition": competition_id,
          "change": pointsChanged[key],
          "previous": teamRankings[key][key2],
          "new": newRank,
          "username": username
        })
        admin.database().ref('/users/' + id + '/matches/' + match_id).set(true)
        admin.database().ref('/rank/' + competition_id + '/' + id + '/rank').transaction(function(currentRank) {
          let updatedRank = currentRank + pointsChanged[key];
          return updatedRank;
        });
      })
    })
  }

  function onDelete(match_id, teams, points, competition_id) {
    Object.keys(teams).forEach(function(team, key) {
      Object.keys(teams[team]).forEach(function(player, key2) {
        let id = teams[team][player].id;
        let username = teams[team][player].username;
        
        return admin.database().ref('/users/' + id).once('value').then(function(snapshot) {
          admin.database().ref('/ranking/' + id + '/' + match_id).remove()
          admin.database().ref('/users/' + id + '/matches/' + match_id).remove()
          admin.database().ref('/rank/' + competition_id + '/' + id + '/rank').transaction(function(currentRank) {
            let oldRank = currentRank - Number(points[team]);
            return oldRank;
          }, function(error, committed, snapshot) {
            console.log(match_id + " " + id + " " + username + " (" + points[team] + " refunded) = ", snapshot.val());
          });
        })

      })
    })

  }

  return;

});

exports.setDefaultRank = functions.database.ref('/rank/{competitionid}/{userid}').onWrite(event => {
  const snapshot = event.data;
  const user = event.data.val();
  console.log(user);
  const path = snapshot._path.replace('/rank/','');
  console.log(path);

  // When the data is deleted.
  if (!event.data.exists()) {
    console.log(path + "/" + username + " got deleted.")
    return;
  }

  // Catch additional tries to trigger the write event.
  if (event.data.previous.exists()) {
    console.log("Default rank already set. Not setting again.")
    return;
  }

  admin.database().ref('/rank/' + path + '/rank').transaction(function(currentRank) {
    currentRank = 1000;
    return currentRank;
  }, function(error, committed, snapshot) {
    console.log("Default rank is set. Rank is now ", snapshot.val());
  });

  return;

});


// TODO: Fix this. Now it triggers everytime a user is updated, which is every match. It shouldn't trigger so often.
// exports.addUser = functions.database.ref('/users/{userid}').onWrite(event => {
//   const snapshot = event.data;
//   const user = event.data.val();
//   const user_id = snapshot._path.replace('/users/','');

//   // When the data is deleted.
//   if (!event.data.exists()) {
//     console.log("Player " + user_id + " got deleted.")
//     return;
//   }

//   // Catch additional tries to trigger the write event.
//   if (event.data.previous.exists()) {
//     console.log("Calculation already done. Not starting again.")
//     return;
//   }

//   admin.database().ref('/users/' + user_id + '/rank').set(1000);

//   return;

// });