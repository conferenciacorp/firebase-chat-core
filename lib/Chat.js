import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import User from 'User.js';

export class Chat extends EventEmitter{ //ref chat
	constructor(id, room, ref){
		this.id = id;
		this.room = room;
		this.ref = ref;

		this.users = [];
		this.messages = [];

		this.ref.child('messages').on('child_added', snapshot => {
			this.emit('new_message', message);
		});
	}

	registerUser(user){
		const conversation;
		this.users.append(user);
		user.appendConversation(conversation);
	}
	unregisterUser(user){}

	sendMessage(){}
}