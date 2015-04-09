var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookieParser = require('cookie-parser')

//the server port and IP are configured
var server_port = process.env.PORT || 3000
var server_ip_address = process.env.IP || '127.0.0.1'

app.use(cookieParser())

//if a request comes, get teh required file from the path and return as response
app.get('/*.*' , function(req , res , next){
    var fileName = req.path;
    res.cookie('user' , 'true' , {httpOnly: false });
    res.sendFile(__dirname +'/'+ fileName);
})



var playerCount = 1;
var users = [];	//keep track of all the online users
var sockets = [];
var deciding_pairs = [];
var idle_pairs = [];

//start the server on the port specified
server.listen(server_port, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});


//socket.io code to handle multiple users
io.on('connection' , function(socket){
	console.log("new user connected");
	//a unique id to be assigned to each user
	var uniqueId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	            return v.toString(16);
	            //alert(unique_url);
	        });
	//push the new user to users array
	users.push({id:uniqueId , lat:0 , lon:0 , score:0 , number:playerCount++});
	//push the newly created socket to sockets array
	sockets.push({id:uniqueId , con:socket , status:'open'});
	//allow all online users to know that a new user has joined
	io.emit('new user' , {online : users.length-1});
	//send the unique id to the newly joining user
	socket.emit('welcome' , {id:uniqueId});

	//if a player leaves, remove it from the users array, remove its socket from sockets array and close the socket
	socket.on('disconnect',function(data){
		var disconnect_user = getUserById(uniqueId);
		var disconnect_socket = getSocketById(uniqueId);

		var index = users.indexOf(disconnect_user);
		users.splice(index , 1);
		index = sockets.indexOf(disconnect_socket);
		sockets.splice(index,1);

		io.emit('user disconnected');
		socket.disconnect();
	})

	socket.on('pause' , function(data){
		var s = sockets.indexOf(socket);
		sockets[s].status = 'pause';
	})

	socket.on('unpause' , function(data){
		var s = sockets.indexOf(socket);
		sockets[s].status = 'open';
	})
	//fires when a user location change event is detected
	socket.on('location change' , function(data){
		console.log("location change received")
		//get the data of the user
		var user = getUserById(data.id);
		var index = users.indexOf(user);
		users[index].lat = data.lat;
		users[index].lon = data.lon;
		//check if any user is within the war zone
		var closeUser = isClose(users[index]);
		//if there is no user in the war zone, do nothing
		if(closeUser==null){
			return;
		}
		//else if a user is found close enough and the pair is not in idleUsers
		else if(closeUser.id!=data.id && !idleUser(closeUser , users[index]) ){
			var exist = false;
			//check if one of them is already not in the deciding pairs
			for (var i = deciding_pairs.length - 1; i >= 0; i--) {
				if(deciding_pairs[i].user1==closeUser || deciding_pairs[i].user2==users[index] || deciding_pairs[i].user2==closeUser || deciding_pairs[i].user1==users[index]){
					exist = true;
				
				}
			};
			if(!exist){
				//generate a unique id for the pair
				var uniqueId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				        return v.toString(16);
				    });
				//add both the users in the deciding pairs array
				deciding_pairs.push({id:uniqueId , user1:users[index] , user1_status:"open" , user2:closeUser , user2_status:"open"});
				var closeUserSocket = getSocketById(closeUser.id);
				//send a event notifying both of them about the opponent
				socket.emit('close user found' , {id:uniqueId , oppId:closeUser.id , lat:closeUser.lat , lon:closeUser.lon , score:closeUser.score , number:closeUser.number});
				closeUserSocket.con.emit('close user found' , {id:uniqueId , oppId:closeUser.id , lat:users[index].lat , lon:users[index].lon , score:users[index].score , number:users[index].number});
			}
			
		}
		
	})
	//if a user calls fight
	socket.on('fight called' , function(data){
		var caller_id = data.callId;
		var opponent_id = data.oppId;

		var caller = getUserById(caller_id);
		var opponent = getUserById(opponent_id);
		console.log("fight called")

		var pair = getDecidingPairById(data.id);
		if(pair!=null){
	//the caller is stored as user1 in the pair
			if(pair.user1.id==caller_id){
				//if the other user chose to fight
				if(pair.user2_status!="open"){
					decideWinner(pair);
					//remove the pair from deciding pairs
					var index = deciding_pairs.indexOf(pair);
					deciding_pairs.splice(index , 1);

				}
				//else update the status of the caller to fight in deciding_pairs
				else{
					var index = deciding_pairs.indexOf(pair);
					deciding_pairs.splice(index , 1);
					deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:"fight" , user2:pair.user2 , user2_status:pair.user2_status});
				}

			}
			//the caller is stored as user2
			else if(pair.user2.id==caller_id){
				//if the other user chose to fight
				if(pair.user1_status!="open"){
					decideWinner(pair);
					//remove the pair from deciding pairs
					var index = deciding_pairs.indexOf(pair);
					deciding_pairs.splice(index , 1);

				}
				//else update the status of the caller in deciding_pairs
				else{
					var index = deciding_pairs.indexOf(pair);
					deciding_pairs.splice(index , 1);
					deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:pair.user1_status , user2:pair.user2 , user2_status:"fight"});
				}
			}
		
		}
			
	})

	//if a user calls peace
	socket.on('peace called' , function(data){
		var caller_id = data.callId;
		var opponent_id = data.oppId;

		var caller = getUserById(caller_id);
		var opponent = getUserById(opponent_id);
		console.log("peace called")

		var pair = getDecidingPairById(data.id);

		
		//the caller is stored as user1 in the pair
		if(pair.user1.id==caller_id){
			//if the other user chose to fight
			if(pair.user2_status=="peace"){
				makePeace(pair);
				//remove the pair from deciding pairs
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);

				idle_pairs.push(pair);

			}
			else if(pair.user2_status=="fight"){
				decideWinner(pair);
				//remove the pair from deciding pairs
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				//idle_pairs.push(pair);

			}
			//else update the status of the caller in deciding_pairs
			else{
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:"peace" , user2:pair.user2 , user2_status:pair.user2_status});
			}

		}
		//the caller is stored as user2
		else if(pair.user2.id==caller_id){
			//if the other user chose to fight
			if(pair.user1_status=="peace"){
				makePeace(pair);
				//remove the pair from deciding pairs
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);

				idle_pairs.push(pair);
			}
			else if(pair.user1_status=="fight"){
				decideWinner(pair);
				//remove the pair from deciding pairs
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				//idle_pairs.push(pair);

			}
			//else update the status of the caller in deciding_pairs
			else{
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:pair.user1_status , user2:pair.user2 , user2_status:"peace"});
				//console.log(deciding_pairs);
			}
		}
		
	})

})

//calculates the distance between two {latitude , longitude} pairs
function distance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;	//distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
//if an user called fight, checks which of the two players' score is less and decides a winner among them
function decideWinner(pair){
	var caller = pair.user1;
	var opponent = pair.user2;
	var caller_id = pair.user1.id;
	var opponent_id = pair.user2.id;
	if(caller.score<opponent.score){
		var caller_socket = getSocketById(caller_id);
		var opp_socket = getSocketById(opponent_id);

		caller_socket.con.emit('loss');
		opp_socket.con.emit('win' , {score:caller.score});

		opponent.score+=caller.score;

		caller_socket.con.disconnect();
		
		

	}
	else{
		var caller_socket = getSocketById(caller_id);
		var opp_socket = getSocketById(opponent_id);

		opp_socket.con.emit('loss');
		opp_socket.con.disconnect();
		
		caller_socket.con.emit('win' , {score:caller.score});

		caller.score+=opponent.score;

		
	}
}
//if both user choose peace, send a peace event to both of them
function makePeace(pair){
	
	var caller_id = pair.user1.id;
	var opponent_id = pair.user2.id;

	var caller_socket = getSocketById(caller_id);
	var opp_socket = getSocketById(opponent_id);

	caller_socket.con.emit('peace');
	opp_socket.con.emit('peace');

	console.log('peace made')

}
//stores the pairs that have chosen peace. They are not considered for fight next time unless they move apart from each other
function idleUser(user1 , user2){
	for(var i=0;i<idle_pairs.length;i++){
		if(idle_pairs[i].user1==user1 && idle_pairs[i].user2==user2){
			return true;
		}
		else if(idle_pairs[i].user1==user2 && idle_pairs[i].user2==user1){
			return true;
		}
	}
	return false;
}
//randomly selects a user and sends him a bonus after a certain time
function chooseTechExplosion()
{
	if(users.length<=0)
		return;

	var winner = Math.floor(Math.random()*(users.length));
	users[winner].score+=5;
    var winner_socket = getSocketById(users[winner].id);
	winner_socket.con.emit('tech explosion');
    
}
//check if any other user is close to the current user
function isClose(user){
	var closeUser = null;
	for(var k=0;k<users.length ;k++){
			var d = distance(users[k].lat , users[k].lon , user.lat , user.lon);
			if(d<10 && !idleUser(users[k] , user) && users[k]!=user)
			{
				closeUser= users[k];
				break;
			}
		}		

	return closeUser;
}

//get user by id
function getUserById(id){
    var count = users.length;
    var user = null;
    for(var i=0;i<count;i++){
      	if(users[i].id==id){
            user = users[i];
            break;
        }
    }
    return user;
}

//get deciding user by id
function getDecidingPairById(id){
    var count = deciding_pairs.length;
    var pair = null;
    for(var i=0;i<count;i++){
      	if(deciding_pairs[i].id==id){
            pair = deciding_pairs[i];
            break;
        }
    }
    return pair;
}

//get socket by id
function getSocketById(id){
    var count = sockets.length;
    var socket = null;
    for(var i=0;i<count;i++){
      	if(sockets[i].id==id){
            socket = sockets[i];
            break;
        }
    }
    return socket;
}
//increase the score of all users periodically
function increaseScore(){
	for(var i=0;i<users.length;i++){
		users[i].score+=1;
		sockets[i].con.emit('score update' , {id:users[i].id , score:users[i].score});
	}
}
//remove idle pairs if the distance between them increase by 50m
function checkIdlePairs(){
	for (var i = idle_pairs.length - 1; i >= 0; i--) {
		if(distance(idle_pairs[i].user1.lat , idle_pairs[i].user1.lon , idle_pairs[i].user2.lat , idle_pairs[i].user2.lon)>50)
		{
			console.log('idle pair removed');
			idle_pairs.splice(i,1);
		}
	};
}
setInterval(chooseTechExplosion, 60000);
setInterval(increaseScore , 1000);
