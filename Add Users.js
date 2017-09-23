(function(data){
	var createOneUser = function(username, password, isPlus){
		var user = new Parse.User();
		user.set("username", username.toLowerCase());
		user.set("password", password);
		user.set("email", username + "@example.com");
		user.set("maxLevel", 1);
		user.set("runCondition", isPlus ? 2 : 1);
		user.signUp(null, {
			success: function(user) {
				console.log("Successfully created user: " + username + " - " + user.id);
			},
			error: function(user, error) {
				console.error("Unable to create user: " + username + ": " + error.code + " " + error.message);
			}
		});
	};
	for(var i = 0; i < data.length; i++){
		try{
			createOneUser(data[i][0], data[i][1], false);
		}catch(e){
			console.error(i, row, e.message);
		}
	}
})([
	["username 1", "password"],
	["username 2", "password"]
]);
