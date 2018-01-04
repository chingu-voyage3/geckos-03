'use strict';

//Key: socketID
//Value: nickaname
var userNames = {};

var activeUsers = [];

exports.setUsername = (socketID, nickname, userList) => {

    if(userNames[socketID]) {

        let idx = activeUsers.indexOf(socketID);
        
        userNames[socketID] = nickname;
        userList[idx] = nickname;
    }

    else{

        userNames[socketID] = nickname;
        activeUsers.push(socketID);
        userList.push(nickname);
    }
    return userList;
}

exports.removeUsername = (socketID, userList) => {

    let idx = activeUsers.indexOf(socketID);
    
    activeUsers.splice(idx, 1);
    userList.splice(idx, 1);

    return userList;
}

exports.getUsername = (socketID) => {
    return userNames[socketID];
}