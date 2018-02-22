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

		this.ref = ref;

		this.ref.on('value', snapshot => {
			let user = snapshot.val();
			console.log(user);
			if(user.status != this.status){
				this.status = user.status;
				this.emit("status_change", user.status);
			}

			if(user.online != this.online){
				this.online = user.online;
				this.emit("online_change", user.online);
			}
		});

		this.initRefConversations();
	}

	getConversations(){
		const deferred = new Deferred();

		this.ref.child('conversations').once('value', snapshot => {
			if(!snapshot.hasChildren()){
				deferred.resolve([]);
			}

			const conversations = Object.values(snapshot.val()).map(data => {
				const idChat = data.idChat;
				const chat = new Chat(idChat, this.room, this.room.ref.child('chats/'+idChat));

				return new Conversation(this, chat, data.lastSeen);
			});

			deferred.resolve(conversations);
		});

		return deferred.promise;
	}

	initRefConversations(){
		this.ref.child('conversations').on('child_added', snapshot => {
			const data = snapshot.val();
			const idChat = data.idChat;
			const chat = new Chat(idChat, this.room, this.room.ref.child('chats/'+idChat));

			const conversation = new Conversation(this, chat, data.lastSeen);

			this.emit('conversation_create', conversation);
		});

		this.ref.child('conversations').on('child_removed', snapshot => {
			let key = snapshot.key;

			this.emit('conversation_remove', key);
		});
	}

	appendConversation(idChat){
		return this.ref.child('conversations/'+idChat).set({idChat: idChat, lastSeen: Date.now()});
	}

	removeConversation(idChat){
		return this.ref.child('conversations/'+idChat).remove();
	}

	thisIsMe(){
		this.ref.on('value', snapshot => {
			let user = snapshot.val();

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
}