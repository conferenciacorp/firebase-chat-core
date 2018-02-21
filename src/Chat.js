import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';

export default class Chat extends EventEmitter{

	constructor(id, room, ref){
		super();

		this.id = id;
		this.room = room;
		this.ref = ref;

		this.pendings = {};

		this.users = {};
		this.messages = {};

		this.initRefUser();
		this.initRefMessages();
	}

	initRefUser(){
		const users = this.ref.child('users');

		users.on('child_added', snapshot => {
			const uid = snapshot.key;
			const user = this.room.users[uid];

			user.appendConversation(this.id);

			this.users[uid] = snapshot.key;

			this.pendings[uid].resolve(true);

			delete this.pendings[uid];
		});

		users.on('child_removed', snapshot => {
			const uid = snapshot.key;

			delete this.users[uid];

			this.pendings[uid].resolve(true);

			delete this.pendings[uid];
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

		this.ref.child('users/'+user.id).set(user.name);

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