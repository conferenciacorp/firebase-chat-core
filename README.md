# Firebase chat core

The Firebase chat core is the core to create a chat. You still need to create a view and handle all events.

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

## TODO

 - Tests
 - Documentation
 - A better readme