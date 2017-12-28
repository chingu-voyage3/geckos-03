//Initialize express
var express = require('express');
var app = express();

//Initialize a new http server
var http = require('http').Server(app);

//Initialize socket.io passing the server as
//a parameter
var io = require('socket.io')(http);

//Import our users file
var users = require('./lib/users.js')
var strokesdb = require('./lib/strokesdb.js');

/*
 * express part
 */

//Serve index.html
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/index.html');
});

//Set the route for static elements (css, jquerey)
app.use(express.static('public')); 


/*
 * socket.io part
 */
io.on('connection', socket =>{

    console.log('A user connected');

    let userList = users.addUsername(socket.id, 'Unknown Artist');

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

        userList = users.removeUsername(socket.id);

        io.sockets.emit('update users', userList);
      });

    socket.on('name set', name =>{

        /*
        * Not the cleanest way to handle this, but good enough for now
        */
        userList = users.removeUsername(socket.id);
        userList = users.addUsername(socket.id, name);
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

