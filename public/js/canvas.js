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

// Brush Color

let currentBrushColor = (ctx.strokeStyle = '#000000');

const brushColors = document.querySelectorAll('.brush-color');
const colorsList = document.querySelector('.colors-list');

colorsList.addEventListener('click', updateBrushColor);

function updateBrushColor(event){

	// TODO: Fix addition / removal of selected class on active brush

	// console.log(event)
	// brushColors.forEach(brushColor => brushColor.classList.remove('selected'));
	// if (event.target.classList){
	// 	event.target.classList.add('selected');
	// }

	currentBrushColor = (ctx.strokeStyle = event.target.dataset.color);
};

// Open Brush Color Selector

const showBrushColorSelector = document.querySelector('#show-brush-color-selector');

showBrushColorSelector.addEventListener('click', showColorSelector);

function showColorSelector(){
	const createNewColor = document.querySelector('#create-new-color');

	createNewColor.classList.toggle('hidden');
}

// Setting color of '#new-color'

const rangeInputs = document.querySelectorAll(' input[type=range].color-range');

rangeInputs.forEach( rangeInput => addEventListener('input', updateNewBrushColor));

function updateNewBrushColor(){

	let redValue = document.querySelector('#red').value;
	let greenValue = document.querySelector('#green').value;
	let blueValue = document.querySelector('#blue').value;
	const newColorBox = document.querySelector('#new-color');

	newColorBox.style.backgroundColor = ('rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')');

}

// Add New Brush Color
// TODO: Pass new brush color through Socket

const addNewBrushColor = document.querySelector('#add-new-brush-color');

addNewBrushColor.addEventListener('click', buildNewBrushColor);

function buildNewBrushColor(){

	const newColorBox = document.querySelector('#new-color');
	const currentColor = newColorBox.style.backgroundColor;
	const li = document.createElement('li');

	li.classList.add('brush-color');
	li.setAttribute('data-color', currentColor);
	li.style.backgroundColor = currentColor;

	const colorsList = document.querySelector('.colors-list');

	colorsList.appendChild(li);

	ctx.strokeStyle = currentColor;

};

// Brush Size
// TODO: Pass brush size to socket

const sizeInput = document.querySelector(' input[type=range].size-range');

sizeInput.addEventListener('change', updateBrushSize);
sizeInput.addEventListener('mousemove', updateBrushSize);

function updateBrushSize(){
	ctx.lineWidth = this.value;
}

ctx.lineWidth = 10;

ctx.lineJoin = 'round';
ctx.lineCap = 'round';

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

setUserNameButton.addEventListener('click', setUsername);
sendChatButton.addEventListener('click', sendChat);

function setUsername(){

	let name = document.querySelector('#user-name-field').value;

	socket.emit('name set', name);

}

function sendChat() {

	let msg = document.querySelector('#chat-input').value;

	socket.emit('message', msg);

	document.querySelector('#chat-input').value = '';

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

	if(chat.childElementCount >= MAX_MESSAGES){
		chat.removeChild(chat.firstElementChild);
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
	return '<p class="chat-message">' + name + ': ' + msg + '</p>'
}