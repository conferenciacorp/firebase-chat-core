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
		const refUsers = this.ref.child('users');
		const refNewUsers = refUsers.orderByChild("insertedAt").startAt(Date.now());

		refNewUsers.on('child_added', snapshot => {
			const id = snapshot.key;

			this.emit('user_joined', id);
		});

		refNewUsers.on('child_removed', snapshot => {
			const id = snapshot.key;

			this.emit('user_leaved', id);
		});
	}

	initRefMessages(){
		const refMessages = this.ref.child('messages');
		const refNewMessages = refMessages.orderByChild("time").startAt(Date.now());

		refNewMessages.on('child_added', snapshot => {
			this.emit('new_message', snapshot.val());
		});
	}

	registerUser(user){
		const deferred = new Deferred();

		const time = Date.now();

		this.ref.child('users/'+user.id).set({
			insertedAt: time
		}).then(() => {
			user.appendConversation(this, time).then((conversation) => {
				deferred.resolve(conversation);
			});
		});

		return deferred.promise;
	}

	unregisterUser(user){
		const deferred = new Deferred();

		this.ref.child('users/'+user.id).remove().then(() => {
			user.removeConversation(this);

			deferred.resolve(true);
		});

		return deferred.promise;
	}

	sendMessage(user, message){
		return this.ref.child('messages').push({
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

			let messages = [];
			snapshot.forEach(childSnapshot => {
				messages.push(childSnapshot.val());
			});

			deferred.resolve(messages);
		});

		return deferred.promise;
	}
}