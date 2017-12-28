'use strict'

var redis = require('redis');
var client = redis.createClient();

client.on('connect', function(){
    console.log('connnected');

});

client.on('error', (err) => {
    console.log("Error " + err);
});

exports.addStroke = (room, line) => {
//    console.log(JSON.stringify(line));
client.lpush(room, JSON.stringify(line));
client.lrange(room, 0, -1, function (error, items) {
 console.log('dfdfdf')
  if (error) throw error
  items.forEach(function (item) {
    console.log(item);
  })
})
//    return client.lpush(room, JSON.stringify(line));
}

exports.getStrokes = room => {
    return client.lrange(room, 0, -1);
}

exports.tester = room => {
  //console.log(client.lrange(room, 0, -1))
}

exports.deleteRoom = room => {
    client.del(room);
}

