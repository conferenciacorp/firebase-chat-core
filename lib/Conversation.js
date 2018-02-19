import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';

export class Conversation { //ref conversation
	constructor(user, chat){

		chat.on('new_message', message => {});
	}


	sendMessage(message){
		this.chat.sendMessage();
	}
}