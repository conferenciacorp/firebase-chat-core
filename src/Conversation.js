import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Prototypes from "./Prototypes";

export default class Conversation { //ref conversation
	constructor(user, chat, lastSeen){
		this.user = user;
		this.chat = chat;
		this.lastSeen = lastSeen;

		this.listenToChatEvents();
	}

	listenToChatEvents(){
		this.chat.on('new_message', (message) => this.emit('new_message', message));
	}

	sendMessage(message){
		return this.chat.sendMessage(this.user.id, message);
	}
}