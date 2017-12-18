'use strict';

//Key = A user's socket.id
//Value = A user's nickname
var userNames = {};


var activeUsers = [];


exports.addUsername = function(socketID, nickname){

    userNames[socketID] = nickname;

    activeUsers.push(nickname);

    return activeUsers;
}

exports.removeUsername = function(socketID){

    activeUsers.splice(activeUsers.indexOf(userNames[socketID]), 1);

    delete userNames[socketID];

    return activeUsers;
}

exports.getUsername = function(socketID){
    return userNames[socketID];
}
