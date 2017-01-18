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
	["676zip", "123"],
	["175jib", "456"],
	["037jam", "789"],
	["606zag", "123"],
	["350jun", "456"],
	["922vex", "789"],
	["124jay", "123"],
	["889haj", "456"],
	["216kex", "789"],
	["163joy", "123"],
	["679vox", "456"],
	["259suq", "789"],
	["459zed", "123"],
	["314wax", "456"],
	["657mix", "789"],
	["599hex", "123"],
	["564jet", "456"],
	["415joe", "789"],
	["217zoo", "123"],
	["883lax", "456"],
	["test1", "cathy2017"],
	["test2", "cathy2017"],
	["test3", "cathy2017"],
	["test4", "cathy2017"],
	["test5", "cathy2017"],
	["test6", "cathy2017"],
	["test7", "cathy2017"],
	["test8", "cathy2017"],
	["test9", "cathy2017"],
	["test10", "cathy2017"]
]);