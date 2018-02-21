import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Room from './Room';

export default class FirebaseChat {
	constructor(database){
		this.ref = database.ref('rooms');

		this.rooms = {};
		this.pendings = {};
	}

	createRoom(name){
		if(typeof this.rooms[name] != 'undefined'){
			return new Promise((resolve, reject) => resolve(this.rooms[name]));
		}

		let deferred = new Deferred();

		this.pendings[name] = deferred;

		const ref = this.ref.child(name);

		ref.once('value', snapshot => {
			if(!snapshot.hasChildren()){
				ref.set({
					users: "",
					chats: ""
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

		this.ref.child(name).remove().then(() => this.pendings[name].resolve(true));

		return deferred.promise;

	}
}