# Firebase Chat Core

The Firebase chat core is the core to create a chat. You still need to create a view and handle all events.

## USAGE
```javascript
	var firebaseChat = new FirebaseChat(firebase.database());

	var room = firebaseChat.createRoom("newRoom");

	room.registerUser("MY_ID", "Marcelo Cerqueira")
	.then(user => {
		//transform this user into your user
		room.connectAs(user, firebase.auth());

		user.on('conversation_created', conversation => {
			console.log("conversation_created");
			conversation.on('new_message', message => {
				console.log("new_message", message);
			});
		});

		user.getConversations().then(conversations => {
			console.log('getConversations');
			conversations.forEach(conversation => {
				conversation.on('new_message', message => {
					console.log('new_message', message);
				});
			});
		});
	});

	room.on('user_registered', (user) => {
		console.log("user_registered", user);
		user.on('status_change', console.log);
	});

	room.on('user_joined', (user) => {
		console.log("user_joined", user);
	});
```

## API REFERENCE
```javascript
	class FirebaseChat{
		//return a new or an existing Room
		createRoom(idRoom); //returns Room object
	}

	class Room{
		getUsers(); //returns array of Users object

		//return a new or an existing User
		registerUser(id, name); //return User object
		unregisterUser(id, name); //return a Promise

		//make this user as your main User
		connectAs(user. firebaseAuth);

		//return a new or existing Chat
		createChat(id); //return Chat object
		deleteChat(chatObject); //return a Promise

		//emit events "user_registered", "user_removed", "user_joined", "user_leaved", "chat_created", "chat_removed"
	}

	class Chat{
		//if exists is overwrited
		registerUser(userObject); //return Promise
		unregisterUser(userObject); //return Promise
		getMessages(); //return array of messages
		sendMessage(userObject, message); //return Promise

		//emit events "user_joined", "user_leaved", "new_message"
	}

	class User{
		getConversations(); //return array of Conversations object

		//emit events "status_change", "conversation_created", "conversation_removed"
	}

	class Conversation{
		sendMessage(message); //return Promise
		updateLastSeen(timestamp); //return Promise

		//emit events "new_message"
	}
```

## TODO

 - Tests
 - Documentation
 - A better readme