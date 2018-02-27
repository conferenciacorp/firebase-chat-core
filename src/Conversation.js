import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Prototypes from "./Prototypes";

export default class Conversation extends EventEmitter{ //ref conversation
	constructor(user, chat, lastSeen,ref){
		super();

		this.user = user;
		this.chat = chat;

		this.lastSeen = lastSeen;

		this.ref = ref;

		this.listenToChatEvents();
	}

	listenToChatEvents(){
		this.chat.on('new_message', message => this.emit('new_message', message));
	}

	updateLastSeen(timestamp){
		this.lastSeen = timestamp || Date.now();

		return this.ref.update({lastSeen: lastSeen});
	}

	sendMessage(message){
		return this.chat.sendMessage(this.user, message);
	}
}