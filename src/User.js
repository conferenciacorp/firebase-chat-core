import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Conversation from './Conversation';

export default class User extends EventEmitter{
	static STATUS_VISIBLE = "visible";
	static STATUS_INVISIBLE = "invisible";
	static STATUS_AWAY = "away";

	constructor(uid, user, room, ref){
		super();

		this.uid = uid;
		this.name = user.name;
		this.online = user.online;
		this.status = user.status;
		this.room = room;
		this.conversations = {};

		Object.keys(user.conversations).forEach(key => {
			let conversation = user.conversations[key];
			this.conversations[key] = new Conversation(this, this.room.chats[conversation.chatId], conversation.lastSeen);
		});

		this.ref = ref;

		this.ref.on('value', snapshot => {
			let user = snapshot.val();

			if(user.online !== true){
				this.update({online: true})
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
			let conversation = snapshot.val();
			this.conversations[key] = new Conversation(this, this.room.chats[conversation.chatId], conversation.lastSeen);
		});
	}

	appendConversation(chatId){
		this.ref.child('conversations').push({chatId: chatId, lastSeen: Date.now()});
	}
}