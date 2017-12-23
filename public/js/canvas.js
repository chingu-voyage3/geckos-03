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

function draw(event, line){

	// Stop drawing if not clicking mouse down
	if (!isDrawing) return;

	ctx.beginPath();

	// Start line from
	ctx.moveTo(lastX, lastY);

	// End line
	ctx.lineTo(event.offsetX, event.offsetY);
	ctx.stroke();

	socket.emit('user draw', line);
	[lastX, lastY] = [event.offsetX, event.offsetY];

}

function socketDraw(line){

	ctx.beginPath();

	// Start line from
	ctx.moveTo(line.startX, line.startY);

	// End line
	ctx.lineTo(line.endX, line.endY);
	ctx.stroke();

}

canvas.addEventListener('mousemove', (event) => {

	let line = {
		startX: lastX,
		startY: lastY,
		endX: event.offsetX,
		endY: event.offsetY
	};

	draw(event, line);

});

canvas.addEventListener('mousedown', (event) => {
	isDrawing = true;
	[lastX, lastY] = [event.offsetX, event.offsetY];

	let line = {
		startX: lastX,
		startY: lastY,
		endX: event.offsetX,
		endY: event.offsetY
	};

	draw(event, line);
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

/*
 * User events part 
 */
const setUserNameButton = document.querySelector('#set-user-name');
const sendChatButton = document.querySelector('#send-chat');
const toggleOverflowButton = document.querySelector('#toggle-scroll');

setUserNameButton.addEventListener('click', setUsername);
sendChatButton.addEventListener('click', sendChat);
toggleOverflowButton.addEventListener('click', toggleOverflow);

function setUsername(){

	let name = document.querySelector('#user-name-field').value;

	// // Responsible for removing the registration.
	document.querySelector("#sign-in").classList.toggle("signed-in");
	document.querySelector(".cover").classList.toggle("cover");
	console.log("SasdSFF");
	socket.emit('name set', name);

}

function sendChat() {

	let msg = document.querySelector('#chat-input').value;

	socket.emit('message', msg);

	document.querySelector('#chat-input').value = '';

}

//For mobile devices. If the screen is too small the canvas will scroll and not draw.
//This is so that the canvas locks and mobile users can draw.
//Still does not work on mobile devices but this can be solved with third party libraries
function toggleOverflow() {
	//Stop Canvas from scrolling
	document.querySelector('#canvas-overflow').classList.toggle("scroll-lock");

	//Stop document from scrolling.
	document.querySelector('html').classList.toggle("scroll-lock");
}

const chatInput = document.querySelector('#chat-input')

chatInput.addEventListener('keydown', function(event){
	if (event.keyCode === 13) {
		sendChat();
	}
});

/*
 * DOM Updating Part
 */
function refreshUserList(list){

	const currentUsers = document.querySelector('#current-users');
	currentUsers.innerHTML = currentUsersHTML(list);
}

function appendMessage(msg, name) {

	const MAX_MESSAGES = 13;
	const chat = document.querySelector('#chat-area');

	//Removed Limit because the chat does not break once too many messages are sent anymore
	if(chat.childElementCount >= MAX_MESSAGES){
		// chat.removeChild(chat.firstElementChild);
	}

	chat.innerHTML += chatHTML(msg, name);
}

/*
 * socket.io part
 */
socket.on('user draw', line => {
	socketDraw(line);
});


socket.on('update users', userList =>{
	refreshUserList(userList);
})

socket.on('msg', (msg, name) => {
	appendMessage(msg, name);
})

/*
 * HTML parsing part
 */
function currentUsersHTML(users) {
	return [...users].map(user => `<p class="artist-name">${user}</p>`).join('');
}

function chatHTML(msg, name) {
	return '<p class="chat-message">' + '<span class="message-author">' + name + ': </span>' + msg + '</p>'
}