import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Conversation from './Conversation';

export default class User extends EventEmitter{
	static STATUS_VISIBLE = "visible";
	static STATUS_INVISIBLE = "invisible";
	static STATUS_AWAY = "away";

	constructor(id, user, room, ref){
		super();

		this.id = id;
		this.name = user.name;
		this.online = user.online;
		this.status = user.status;
		this.room = room;
		this.conversations = {};

		if(typeof user.conversations != 'undefined'){
			Object.keys(user.conversations).forEach(key => {
				let conversation = user.conversations[key];
				this.conversations[key] = new Conversation(this, this.room.chats[conversation.chatId], conversation.lastSeen);
			});
		}

		this.ref = ref;

		this.ref.on('value', snapshot => {
			let user = snapshot.val();

			if(user == null){
				return;
			}

			if(user.online !== true || this.online !== true){
				this.online = true;
				this.ref.update({
					online: true
				});
			}
		});

		this.ref.onDisconnect().update({
			online: false
		});
	}

	initRefConversations(){
		var refConversation = this.ref.child('conversations');
		var key = refConversation.push().key;

		refConversation.orderByKey().startAt(key).on('child_added', snapshot => {
			let key = snapshot.key;
			let conversation = snapshot.val();

			this.conversations[key] = new Conversation(this, this.room.chats[conversation.chatId], conversation.lastSeen);
		});
	}

	appendConversation(chatId){
		this.ref.child('conversations').push({chatId: chatId, lastSeen: Date.now()});
	}
}