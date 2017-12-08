//Initialize express
var express = require('express');
var app = express();

//Initialize a new http server
var http = require('http').Server(app);

//Initialize socket.io passing the server as
//a parameter
var io = require('socket.io')(http);

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

    //Additional event handlers go here
    socket.on('user draw', line =>{
        socket.broadcast.emit('user draw', line);
    })

})


io.on('disconnection', socket =>{
    console.log('A user disconnected');
})

/*
 * 
 */
http.listen(process.env.PORT || 3000, function(){
    console.log('listening');
})

