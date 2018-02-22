import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Prototypes from "./Prototypes";

export default class Chat extends EventEmitter{

	constructor(id, room, ref){
		super();

		this.id = id;
		this.room = room;
		this.ref = ref;

		this.initRefUser();
		this.initRefMessages();
	}

	initRefUser(){
		const users = this.ref.child('users');

		users.on('child_added', snapshot => {
			const uid = snapshot.key;

			this.emit('user_join', uid);
		});

		users.on('child_removed', snapshot => {
			const uid = snapshot.key;

			this.emit('user_leave', uid);
		});
	}

	initRefMessages(){
		this.ref.child('messages').on('child_added', snapshot => {
			this.emit('new_message', snapshot.val());
		});
	}

	registerUser(user){
		const deferred = new Deferred();

		this.ref.child('users/'+user.id).set(user.name).then(() => {
			user.appendConversation(this.id).then(() => {
				deferred.resolve(true);
			});
		});

		return deferred.promise;
	}

	unregisterUser(user){
		const deferred = new Deferred();
		const uid = user.id;

		this.ref.child('users/'+uid).remove().then(() => {
			user.removeConversation(this.id);

			deferred.resolve(true);
		});

		return deferred.promise;
	}

	sendMessage(user, message){
		var refMessages = this.ref.child('messages');
		var key = refMessages.push().key;

		return refMessages.child(key).set({
			id: key,
			user: user.id,
			message: message,
			time: Date.now()
		});
	}

	getMessages(){
		const deferred = new Deferred();

		this.ref.child('messages').once('value', snapshot => {
			if(!snapshot.hasChildren()){
				deferred.resolve([]);
			}

			const messages = Object.values(snapshot.val()).map(data => {
				return data;
			});

			deferred.resolve(messages);
		});

		return deferred.promise;
	}
}