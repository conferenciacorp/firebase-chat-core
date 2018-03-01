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
		this.status = user.status;
		this.room = room;

		if(typeof user.connection != "undefined"){
			this.connection = Object.keys(user.connection)[0];
		}

		this.ref = ref;

		this.ref.on('value', snapshot => {
			const data = snapshot.val();

			if(data === null){
				return;
			}

			if(data.status != this.status){
				this.status = data.status;
				this.emit("status_change", data.status);
			}
		});

		this.initRefConversations();
	}

	initRefConversations(){
		const refConversations = this.ref.child('conversations');
		const refNewConversations = refConversations.orderByChild("createdAt").startAt(Date.now());

		refNewConversations.on('child_added', snapshot => {
			const data = snapshot.val();

			const idChat = childSnapshot.key;
			const chat = new Chat(idChat, this.room, this.room.ref.child('chats/'+idChat));

			const conversation = new Conversation(this, chat, data.lastSeen, snapshot.ref);

			this.emit('conversation_created', conversation);
		});

		refNewConversations.on('child_removed', snapshot => {
			let key = snapshot.key;

			this.emit('conversation_removed', key);
		});
	}

	getConversations(){
		const deferred = new Deferred();

		this.ref.child('conversations').once('value', snapshot => {
			if(!snapshot.hasChildren()){
				deferred.resolve([]);
			}

			let conversations = [];
			snapshot.forEach(childSnapshot => {
				const data = childSnapshot.val();

				const idChat = childSnapshot.key;
				const chat = new Chat(idChat, this.room, this.room.ref.child('chats/'+idChat));

				conversations.push(new Conversation(this, chat, data.lastSeen, childSnapshot.ref));
			});

			deferred.resolve(conversations);
		});

		return deferred.promise;
	}

	appendConversation(chat, time){
		const deferred = new Deferred();

		this.ref.child('conversations/'+chat.id).on('value', snapshot => {
			let data = {
				lastSeen: time || Date.now(),
				createdAt: time || Date.now()
			};

			if(snapshot.hasChildren()){
				data = snapshot.val();
			}else{
				snapshot.ref.set(data);
			}

			const conversation = new Conversation(this, chat, data.lastSeen, snapshot.ref);

			deferred.resolve(conversation);
		});

		return deferred.promise;
	}

	removeConversation(chat){
		return this.ref.child('conversations/'+chat.id).remove();
	}
}