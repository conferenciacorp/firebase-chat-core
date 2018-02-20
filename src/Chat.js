import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';

export default class Chat extends EventEmitter{

	constructor(id, chat, room, ref){
		super();

		this.id = id;
		this.room = room;
		this.ref = ref;

		this.users = Object.keys(chat.users).forEach(key => {
			return this.room.users[chat.users[key]];
		});

		this.messages = Object.keys(chat.messages).forEach(key => {
			return chat.messages[key];
		}).sort((a, b) => {
			if(a.time > b.time){
				return -1;
			}

			if(b.time > a.time){
				return 1;
			}

			return 0;
		});

		this.initRefUser();
		this.initRefMessages();

	}

	initRefUser(){
		const users = this.ref.child('users');
		const key = users.push().key;

		users.orderByKey().startAt(key).on('child_added', snapshot => {
			const uid = snapshot.val();
			const user = this.room.users[uid];

			user.appendConversation(this.id);

			this.users[uid] = snapshot.key;

			this.pendings[uid].resolve(true);
		});

		users.orderByKey().startAt(key).on('child_removed', snapshot => {
			const uid = snapshot.val();

			delete this.pendings[uid];
			delete this.users[uid];

			this.pendings[uid].resolve(true);
		});
	}

	initRefMessages(){
		const refMessages = this.ref.child('messages');
		const key = refMessages.push().key;

		refMessages.orderByKey().startAt(key).on('child_added', snapshot => {
			this.messages.push(snapshot.val());
			// this.emit('new_message', message);
		});
	}

	registerUser(user){
		let deferred = new Deferred();

		this.pendings[user.id] = deferred;

		this.ref.child('users').push(user.id);

		return deferred.promise;
	}

	unregisterUser(user){
		let deferred = new Deferred();

		this.pendings[user.id] = deferred;

		const key = this.users[user.id];

		this.ref.child('users/'+key).remove();

		return deferred.promise;
	}

	sendMessage(user, message){}
}