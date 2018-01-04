var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = require('./lib/users.js')

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
    
    io.sockets.emit('update users', userList);

    //Additional event handlers go here
    socket.on('user draw', line =>{
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

})

/*
 * 
 */
http.listen(process.env.PORT || 3000, function(){
    console.log('listening');
})

