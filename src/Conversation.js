import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';

export default class Conversation { //ref conversation
	constructor(user, chat, lastSeen){
		this.user = user;
		this.chat = chat;
		this.lastSeen = lastSeen;
		// chat.on('new_message', message => {});
	}

	// sendMessage(message){
	// 	this.chat.sendMessage();
	// }
}