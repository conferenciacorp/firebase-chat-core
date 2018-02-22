import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';

export default class Chat extends EventEmitter{

	constructor(id, room, ref){
		super();

		this.id = id;
		this.room = room;
		this.ref = ref;

		this.users = {};
		this.messages = {};

		// this.initRefUser();
		// this.initRefMessages();
	}

	initRefUser(){
		const users = this.ref.child('users');

		users.on('child_added', snapshot => {
			const uid = snapshot.key;

			this.emit('chat_user_join', uid);
		});

		users.on('child_removed', snapshot => {
			const uid = snapshot.key;

			delete this.users[uid];

			this.emit('chat_user_leave', uid);
		});
	}

	initRefMessages(){
		this.ref.child('messages').on('child_added', snapshot => {
			this.messages.push(snapshot.val());
		});
	}

	registerUser(user){
		const deferred = new Deferred();
		const uid = user.id;

		this.ref.child('users/'+uid).set(user.name).then(() => {
			this.users[uid] = user.name;
			user.appendConversation(this.id);

			deferred.resolve(true);
		});

		return deferred.promise;
	}

	unregisterUser(user){
		let deferred = new Deferred();
		const uid = user.id;

		this.ref.child('users/'+uid).remove().then(() => {
			user.removeConversation(this.id);

			deferred.resolve(true);
		});

		return deferred.promise;
	}

	sendMessage(user, message){
		this.ref.child('messages').push({
			user: user.id,
			message: message,
			time: Date.now()
		});
	}
}