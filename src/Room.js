import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import User from './User';
import Chat from './Chat';

export default class Room extends EventEmitter{ //ref room
	constructor(name, ref){
		super();

		this.name = name;
		this.ref = ref;

		this.initRefUser();
		this.initRefChat();
	}

	initRefUser(){
		this.ref.child('users').on('child_added', snapshot => {
			const uid = snapshot.key;
			const user = new User(uid, snapshot.val(), this, this.ref.child('users/'+uid));

			this.emit("user_enter", user);
		});

		this.ref.child('users').on('child_removed', snapshot => {
			let uid = snapshot.key;

			this.emit("user_leave", uid);
		});
	}

	initRefChat(){
		this.ref.child('chats').on('child_added', snapshot => {
			const id = snapshot.key;
			const chat = new Chat(id, snapshot.val(), this, this.ref.child('child/'+id));

			this.emit("chat_create", chat);
		});

		this.ref.child('chats').on('child_removed', snapshot => {
			const id = snapshot.key;

			this.emit("chat_remove", id)
		});
	}

	registerUser(uid, name, status = 'visible'){

		const deferred = new Deferred();

		const ref = this.ref.child('users/'+uid);

		ref.once('value', snapshot => {
			let data = {
				uid: uid,
				name: name,
				online: true,
				status: status
			};

			if(snapshot.hasChildren()){
				data = snapshot.val();
			}else{
				ref.set(data);
			}

			const user = new User(uid, data, this, ref);

			deferred.resolve(user);
		});

		return deferred.promise;
	}

	getUsers(){
		const deferred = new Deferred();

		this.ref.child('users').once('value', snapshot => {
			if(!snapshot.hasChildren()){
				deferred.resolve([]);
			}

			const users = Object.values(snapshot.val()).map(data => {
				const { uid } = data;
				const ref = snapshot.ref.child(uid);

				return new User(uid, data, this, ref);
			});

			deferred.resolve(users);
		});

		return deferred.promise;
	}

	unregisterUser(uid){
		return this.ref.child('users/'+uid).remove();
	}

	createChat(id){
		const ref = this.ref.child('chats');
		id = id || ref.push().key;

		return new Chat(id, this, ref.child(id));
	}

	deleteChat(id){
		return this.ref.child('chats/'+id).remove();
	}
}
