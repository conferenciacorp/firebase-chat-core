import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';

export class User extends EventEmitter{ //ref user
	constructor(uid, name, room, ref){
		this.uid = uid;
		this.name = name;
		this.online = false;
		this.status = 'visible';
		this.room = room;
		this.conversations = [];
		this.ref = ref;

		this.ref.on('value', snapshot => {
			var user = snapshot.val();
			if(user.online !== true){
				this.update({online: true})
			}
		});

		this.ref.onDisconnect().update({
			online: false
		});
	}


	appendConversation(){}
}
