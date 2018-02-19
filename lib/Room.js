import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import User from './User';
import Chat from './Chat';

export class Room extends EventEmitter{ //ref room
	constructor(name, ref){
		this.name = name;
		this.ref = ref;
		this.users = [];
		this.chats = [];

		this.pendings = {
			users: {},
			chats: {}
		};

		this.initRefUser();
		this.initRefChat();
	}

	initRefUser(){
		this.ref.child('users').on('child_added', snapshot => {
			let uid = snapshot.key;

			this.users[uid] = new User(uid, snapshot.val(), this, this.ref.child('users/'+uid));

			if(typeof this.pendings.users[uid] != 'undefined'){
				this.pendings.users[uid].resolve(this.users[uid]);
				delete this.pendings.users[uid];
			}
		});

		this.ref.child('users').on('child_removed', snapshot => {
			let uid = snapshot.key;

			delete this.users[uid];

			if(typeof this.pendings.users[uid] != 'undefined'){
				this.pendings.users[uid].resolve();
				delete this.pendings.users[uid];
			}
		});
	}

	initRefChat(){
		this.ref.child('chats').on('child_added', snapshot => {
			let id = snapshot.key;

			this.chats[id] = new Chat(id, this, this.ref.child('child/'+id));

			if(typeof this.pendings.chats[id] != 'undefined'){
				this.pendings.chats[id].resolve(this.chats[id]);
				delete this.pendings.chats[id];
			}
		});

		this.ref.child('chats').on('child_removed', snapshot => {
			let id = snapshot.key;

			delete this.chats[id];

			if(typeof this.pendings.chats[id] != 'undefined'){
				this.pendings.chats[id].resolve();
				delete this.pendings.chats[id];
			}
		});
	}

	registerUser(uid, name){
		if(typeof this.users[uid] != 'undefined'){
			return new Promise((resolve, reject) => resolve(this.users[uid]));
		}

		let deferred = new Deferred();

		this.pendings.users[uid] = deferred;

		this.ref.child('users/'+uid).set({
			name: name,
			online: true,
			status: 'visible',
			room: this.name,
			conversations: []
		});

		return deferred.promise;
	}

	unregisterUser(uid){
		if(typeof this.users[uid] == 'undefined'){
			return new Promise((resolve, reject) => resolve());
		}

		let deferred = new Deferred();

		this.pendings.users[uid] = deferred;

		this.ref.child('users/'+uid).remove();

		return deferred.promise;
	}

	createChat(id = null){
		if(id == null){
			do{
				id = Utils.generateId(28);
			}while(typeof this.chats[id] != 'undefined');
		}

		if(typeof this.chats[id] != 'undefined'){
			return new Promise((resolve, reject) => resolve(this.chats[id]));
		}

		let deferred = new Deferred();

		this.pendings.chats[id] = deferred;

		this.ref.child('chats/'+id).set({
			users: [],
			messages[]
		});

		return deferred.promise;
	}

	deleteChat(id){
		if(typeof this.chats[id] == 'undefined'){
			return new Promise((resolve, reject) => resolve());
		}

		let deferred = new Deferred();

		this.pendings.chats[id] = deferred;

		this.ref.child('chats/'+id).remove();

		return deferred.promise;
	}
}
