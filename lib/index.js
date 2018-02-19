import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Room from './Room';

export class FirebaseChat {
	constructor(auth, database){
		this.auth = auth;
		this.database = database;
		this.userFirebase = null;

		this.rooms = {};
		this.pendings = {};

		this.auth.onAuthStateChanged(user => {
			if(user){
				this.userFirebase = user;
			}
		});
	}

	createRoom(name){
		if(typeof this.rooms[name] != 'undefined'){
			return new Promise((resolve, reject) => resolve(this.rooms[name]));
		}

		let deferred = new Deferred();

		this.pendings[name] = deferred;

		const ref = this.database.ref('rooms/'+name);

		ref.once('value', snapshot => {
			if(!snapshot.hasChildren()){
				ref.set({
					users: [],
					chats: []
				});
			}

			this.rooms[name] = new Room(name, ref);

			this.pendings[name].resolve(this.rooms[name]);

			delete this.pendings[name];
		});

		return deferred.promise;
	}

	deleteRoom(name){
		let deferred = new Deferred();

		this.pendings[name] = deferred;

		this.database.ref('rooms/'+name).remove().then(() => this.pendings[name].resolve(true));

		return deferred.promise;

	}
}