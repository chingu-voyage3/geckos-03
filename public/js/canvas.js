'use strict';

/*
 * The socket.io script in the html file exposes
 * our client side instance of socket via the io()
 * variable
 */
var socket = io();

const canvas = document.querySelector('#draw');
const ctx = canvas.getContext('2d');

// if we want to make the canvas full screen in the future
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

ctx.strokeStyle = '#000000';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 10;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

function draw(line){

    // Stop drawing if not clicking mouse down
    if (!isDrawing) return;

    ctx.beginPath();

    // Start line from
    ctx.moveTo(line.startX, line.startY);

    // End line
    ctx.lineTo(line.endX, line.endY);
    ctx.stroke();
    [lastX, lastY] = [event.offsetX, event.offsetY];


    //
    socket.emit('user draw', line);
}

canvas.addEventListener('mousemove', event=>{

    /*
     * Added so the line's parameters can easily be passed
     * by socket.emit;
     */
    let line = {startX: lastX, startY: lastY, 
            endX: event.offsetX, endY: event.offsetY, color: ctx.strokeStyle,
            size: ctx.lineWidth}

    draw(line);

});

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);


/*
 * socket.io part
 */

 socket.on('user draw', line => {
    console.log('Yo')
    draw(line);
 });