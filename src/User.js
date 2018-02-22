import EventEmitter from 'events';
import Deferred from 'mozilla-deferred';
import Chat from './Chat';
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
			Object.values(user.conversations).map(conversation => {
				const idChat = conversation.idChat;
				const chat = new Chat(idChat, this.room, this.room.ref.child('chats/'+idChat));

				this.conversations[idChat] = new Conversation(this, chat, conversation.lastSeen);
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

		this.initRefConversations();
	}

	initRefConversations(){
		this.ref.child('conversations').on('child_added', snapshot => {
			const conversation = snapshot.val();
			const idChat = conversation.idChat;
			const chat = new Chat(idChat, this.room, this.room.ref.child('chats/'+idChat));

			this.conversations[idChat] = new Conversation(this, chat, conversation.lastSeen);

			this.emit('conversation_create', this.conversations[idChat]);
		});

		this.ref.child('conversations').on('child_removed', snapshot => {
			let key = snapshot.key;

			delete this.conversations[key];

			this.emit('conversation_remove', key);
		});
	}

	appendConversation(idChat){
		return this.ref.child('conversations/'+idChat).set({idChat: idChat, lastSeen: Date.now()});
	}

	removeConversation(idChat){
		return this.ref.child('conversations/'+idChat).remove();
	}
}