import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import User from './User';
import Chat from './Chat';
import Prototypes from './Prototypes';

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
		const refNewUsers = refUsers.orderByChild("createdAt").startAt(Date.now());

		refNewUsers.on('child_added', snapshot => {
			const id = snapshot.key;

			const user = new User(id, snapshot.val(), this, snapshot.ref);

			this.emit("user_registered", user);
		});

		refNewUsers.on('child_removed', snapshot => {
			const id = snapshot.key;

			this.emit("user_removed", id);
		});
	}

	initRefOnline(){
		const refOnline = this.ref.child('online');
		const key = refOnline.push().key;
		const refNewOnline = refOnline.orderByKey().startAt(key);

		refNewOnline.on('child_added', snapshot => {
			const connection = snapshot.key;

			this.emit("user_joined", connection);
		});

		refNewOnline.on('child_removed', snapshot => {
			const connection = snapshot.key;

			this.emit("user_leaved", connection);
		});
	}

	initRefChat(){
		const refChat = this.ref.child('chats');
		const refNewChats = refChat.orderByChild("createdAt").startAt(Date.now());

		refNewChats.on('child_added', snapshot => {
			const id = snapshot.key;
			const chat = new Chat(id, snapshot.val(), snapshot.ref);

			this.emit("chat_created", chat);
		});

		refNewChats.on('child_removed', snapshot => {
			const id = snapshot.key;

			this.emit("chat_removed", id)
		});
	}

	getUsers(){
		const deferred = new Deferred();

		this.ref.child('users').once('value', snapshot => {
			if(!snapshot.hasChildren()){
				deferred.resolve([]);
			}

			const users = [];

			snapshot.forEach(childSnapshot => {
				const id = childSnapshot.key;
				const data = childSnapshot.val();
				const ref = childSnapshot.ref;

				users.push(new User(id, data, this, ref));
			});

			deferred.resolve(users);
		});

		return deferred.promise;
	}

	registerUser(id, name, status = 'visible'){

		const deferred = new Deferred();

		this.ref.child('users/'+id).once('value', snapshot => {
			let data = {
				name: name,
				status: status,
				createdAt: Date.now()
			};

			if(snapshot.hasChildren()){
				data = snapshot.val();
			}else{
				snapshot.ref.set(data);
			}

			const user = new User(id, data, this, snapshot.ref);

			deferred.resolve(user);
		});

		return deferred.promise;
	}

	unregisterUser(user){
		return this.ref.child('users/'+user.id).remove();
	}

	connectAs(user, auth){
		const refOnline = this.ref.child('online');
		const refAuth = user.ref.child('auth');

		const connectionid = auth.getUid();

		if(!user.connection){
			user.connection = refOnline.push().key;
		}

		user.ref.update({
			connection : user.connection
		});

		const refAuthChild = refAuth.child(connectionid);

		refAuthChild.set({
			insertedAt: Date.now()
		});
		refAuthChild.onDisconnect().remove();

		const refOnlineChild = refOnline.child(user.connection).push();

		refOnlineChild.set(user.id);
		refOnlineChild.onDisconnect().remove();

		user.ref.on('value', snapshot => {
			const data = snapshot.val();

			if(data === null){
				return;
			}

			if(typeof data.connection == "undefined"){
				snapshot.ref.update({
					connection: user.connection
				});
			}

			if(typeof data.auth[connectionid] == "undefined"){
				refAuthChild.set({
					insertedAt: Date.now()
				});
			}
		});

		user.ref.child('connection').onDisconnect().remove();
	}

	getChats(){
		const deferred = new Deferred();

		this.ref.child('chats').once('value', snapshot => {
			if(!snapshot.hasChildren()){
				deferred.resolve([]);
			}

			const chats = [];

			snapshot.forEach(snapshot => {
				chats.push(new Chat(snapshot.key, this, snapshot.ref));
			});

			deferred.resolve(users);
		});

		return deferred.promise;
	}

	createChat(id){
		const ref = this.ref.child('chats');
		id = id || ref.push().key;

		return new Chat(id, this, ref.child(id));
	}

	deleteChat(chat){
		return this.ref.child('chats/'+chat.id).remove();
	}
}
