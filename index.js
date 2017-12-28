var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = require('./lib/users.js')
var strokesdb = require('./lib/strokesdb.js');

var userList = [];

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/index.html');
});

//Set the route for static elements (css, client js)
app.use(express.static('public'));

/*
 * socket.io part
 */
io.on('connection', socket =>{
    
    socket.join('default');

    io.sockets.emit('update users', userList);

    let drawing = strokesdb.getStrokes('default');
    io.sockets.emit('load canvas', drawing);

    //Additional event handlers go here
    socket.on('user draw', line =>{
        strokesdb.addStroke('default', line);
        //strokesdb.tester(Object.values(socket.rooms)[0]);
        socket.broadcast.emit('user draw', line);
    })

    socket.on('disconnect', function(){
        userList = users.removeUsername(socket.id, userList);
        io.sockets.emit('update users', userList);
      });

    socket.on('name set', name =>{
        userList = users.setUsername(socket.id, name, userList);
        io.sockets.emit('update users', userList);
    })

    socket.on('message', msg=>{
        io.local.emit('msg', msg, users.getUsername(socket.id))
    })

    // socket.on('join room', room => {
    //     let drawing = strokesdb.getStrokes(room);
    //     io.sockets.emit('load canvas', drawing);
    // })

})

/*
 * 
 */
http.listen(process.env.PORT || 3000, function(){
    console.log('listening');
})

