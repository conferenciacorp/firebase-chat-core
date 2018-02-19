import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Room from 'Room.js';

export class FirebaseChat {
	constructor(auth, database){
		this.auth = auth;
		this.database = database;
		this.userFirebase = null;

		this.rooms = {};
		this.pending = {};

		this.auth.onAuthStateChanged(user => {
			if(user){
				this.userFirebase = user;
			}
		});

		this.initRefRooms();
	}

	initRefRooms(){
		let refRooms = this.database.ref('rooms');

		refRooms.on('child_added', snapshot => {
			let name = snapshot.key;
			let ref = this.database.ref('rooms/'+name);

			this.rooms[name] = new Room(name, ref);

			if(typeof this.pending[name] != 'undefined'){
				this.pending[name].resolve(this.rooms[name]);
				delete this.pending[name];
			}
		});

		refRooms.on('child_removed', snapshot => {
			let name = snapshot.key;

			delete this.rooms[name];

			if(typeof this.pending[name] != 'undefined'){
				this.pending[name].resolve();
				delete this.pending[name];
			}
		});
	}

	createRoom(name){
		if(typeof this.rooms[name] != 'undefined'){
			return new Promise((resolve, reject) => resolve(this.rooms[name]));
		}

		let deferred = new Deferred();

		this.pending[name] = deferred;

		this.database.ref('rooms/'+name).set({
			users: [],
			chats: []
		});

		return deferred.promise;
	}

	deleteRoom(name){
		let promise = new Deferred();

		this.pending[name] = promise;

		this.database.ref('rooms/'+name).remove();

		return deferred.promise;

	}
}