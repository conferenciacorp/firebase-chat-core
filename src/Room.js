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
		this.initRefOnline();
		this.initRefChat();
	}

	initRefUser(){
		const refUsers = this.ref.child('users');
		const key = refUsers.push().key;
		const queryUsers = refUsers.orderByKey().startAt(key);

		queryUsers.on('child_added', snapshot => {
			const uid = snapshot.val().uid;
			const user = new User(uid, snapshot.val(), this, this.ref.child('users/'+uid));

			this.emit("user_enter", user);
		});

		queryUsers.on('child_removed', snapshot => {
			const uid = snapshot.val().uid;

			this.emit("user_leave", uid);
		});
	}

	initRefOnline(){
		const refOnline = this.ref.child('online');
		refOnline.on('child_added', snapshot => {
			const connection = snapshot.key;

			this.emit("user_online_enter", connection);
		});

		refOnline.on('child_removed', snapshot => {
			const connection = snapshot.key;

			this.emit("user_online_leave", connection);
		});
	}

	initRefChat(){
		this.ref.child('chats').on('child_added', snapshot => {
			const id = snapshot.key;
			const chat = new Chat(id, snapshot.val(), this, this.ref.child('chats/'+id));

			this.emit("chat_create", chat);
		});

		this.ref.child('chats').on('child_removed', snapshot => {
			const id = snapshot.key;

			this.emit("chat_remove", id)
		});
	}

	registerUser(uid, name, status = 'visible'){

		const deferred = new Deferred();

		const refUsers = this.ref.child('users');

		refUsers.orderByChild("uid").equalTo(uid).once('value', snapshot => {
			let ref;
			let data = {
				uid: uid,
				name: name,
				status: status
			};

			if(snapshot.hasChildren()){
				const key = Object.keys(snapshot.val())[0];

				ref = snapshot.ref.child(key);
				data = Object.values(snapshot.val())[0];
			}else{
				ref = refUsers.push();
				ref.set(data);
			}

			const user = new User(uid, data, this, ref);

			deferred.resolve(user);
		});

		return deferred.promise;
	}

	connectAs(user, auth){
		const refOnline = this.ref.child('online');
		const refAuth = user.ref.child('auth');

		const connectionUid = auth.getUid();

		if(!user.connection){
			user.connection = refOnline.push().key;
		}

		user.ref.update({
			connection : user.connection
		});

		const refAuthChild = refAuth.push();

		refAuthChild.set(connectionUid);
		refAuthChild.onDisconnect().remove();

		const refOnlineChild = refOnline.child(user.connection).push;

		const uniqueId = Math.random().toString(36).substr(2, 10);

		refOnlineChild.set(uniqueId);
		refOnlineChild.onDisconnect().remove();

		user.ref.child('connection').onDisconnect().remove();
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
