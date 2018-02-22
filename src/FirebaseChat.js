import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Room from './Room';

export default class FirebaseChat {
	constructor(database){
		this.ref = database.ref('rooms');
	}

	createRoom(name){
		return new Room(name, this.ref.child(name));
	}

	deleteRoom(name){
		return this.ref.child(name).remove();
	}
}