var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var server_port = process.env.PORT || 3000
var server_ip_address = process.env.IP || '127.0.0.1'

app.get('/*.*' , function(req , res , next){
    var fileName = req.path;
    res.sendFile(__dirname +'/'+ fileName);
})

var playerCount = 0;
var users = [];	//keep track of all the online users
var sockets = [];
var deciding_pairs = [];

server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

//console.log(distance(34,78,34.0001,78));
//socket.io code to handle multiple users
io.on('connection' , function(socket){
	console.log("new user connected");

	var uniqueId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	            return v.toString(16);
	            //alert(unique_url);
	        });

	users.push({id:uniqueId , lat:0 , lon:0 , score:0});
	sockets.push({id:uniqueId , con:socket});

	io.emit('new user' , {online : users.length-1});
	socket.emit('welcome' , {id:uniqueId});

	socket.on('location change' , function(data){
		console.log("location change received")
		var user = getUserById(data.id);
		var i = users.indexOf(user);
		users[i].lat = data.lat;
		users[i].lon = data.lon;

		var closeUser = isClose();
		if(closeUser==null)
			return;
		else if(closeUser.id!=data.id){

			var uniqueId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			        return v.toString(16);
			    });

			console.log(closeUser.id);
			deciding_pairs.push({id:uniqueId , user1:users[i] , user1_status:"open" , user2:closeUser , user2_status:"open"});
			var closeUserSocket = getSocketById(closeUser.id);
			socket.emit('close user found' , {id:uniqueId , oppId:closeUser.id , lat:closeUser.lat , lon:closeUser.lon , score:closeUser.score});
			closeUserSocket.con.emit('close user found' , {id:uniqueId , oppId:closeUser.id , lat:users[i].lat , lon:users[i].lon , score:users[i].score});
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
		//console.log(pair);
		if(pair!=null){
			decideWinner(pair);
		}
		/*
		//the caller is stored as user1 in the pair
		if(pair.user1.id==caller_id){
			//if the other user chose to fight
			if(pair.user2.status=="fight"){
				decideWinner(pair);
			}
			//else update the status of the caller in deciding_pairs
			else{
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:"fight" , user2:pair.user2 , user2_status:pair.user2_status});
				console.log(deciding_pairs);
			}

		}
		//the caller is stored as user2
		else if(pair.user2.id==caller_id){
			//if the other user chose to fight
			if(pair.user1.status=="fight"){
				decideWinner(pair);
			}
			//else update the status of the caller in deciding_pairs
			else{
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:pair.user1_status , user2:pair.user2 , user2_status:"fight"});
				console.log(deciding_pairs);
			}
		}*/
		
	})

	//if a user calls peace
	socket.on('peace called' , function(data){
		var caller_id = data.callId;
		var opponent_id = data.oppId;

		var caller = getUserById(caller_id);
		var opponent = getUserById(opponent_id);
		console.log("peace called")

		var pair = getDecidingPairById(data.id);
		//console.log(pair);
		
		//the caller is stored as user1 in the pair
		if(pair.user1.id==caller_id){
			//if the other user chose to fight
			if(pair.user2_status=="peace"){
				makePeace(pair);
			}
			//else update the status of the caller in deciding_pairs
			else{
				var index = deciding_pairs.indexOf(pair);
				deciding_pairs.splice(index , 1);
				deciding_pairs.push({id:pair.id , user1:pair.user1 , user1_status:"peace" , user2:pair.user2 , user2_status:pair.user2_status});
				//console.log(deciding_pairs);
			}

		}
		//the caller is stored as user2
		else if(pair.user2.id==caller_id){
			//if the other user chose to fight
			if(pair.user1_status=="peace"){
				makePeace(pair);
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
  return d*1000;	//distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

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
		
		var index = users.indexOf(caller);
		users.splice(index , 1);

	}
	else{
		var caller_socket = getSocketById(caller_id);
		var opp_socket = getSocketById(opponent_id);

		opp_socket.con.emit('loss');
		opp_socket.con.disconnect();
		
		caller_socket.con.emit('win' , {score:caller.score});

		caller.score+=opponent.score;

		var index = users.indexOf(opponent);
		users.splice(index , 1);
	}
}

function makePeace(pair){
	
	var caller_id = pair.user1.id;
	var opponent_id = pair.user2.id;

	var caller_socket = getSocketById(caller_id);
	var opp_socket = getSocketById(opponent_id);

	caller_socket.con.emit('peace');
	opp_socket.con.emit('peace');

	console.log('peace made')

}

function chooseTechExplosion()
{
	if(users.length<=0)
		return;

	var winner = Math.floor(Math.random()*(users.length));
	users[winner].score+=5;
    var winner_socket = getSocketById(users[winner].id);
	winner_socket.con.emit('tech explosion');
	console.log("tech explosion called");
    
}

function isClose(){
	var closeUser = null;
	for(var i=0;i<users.length;i++){
		for(var k=0;k<users.length && k!=i;k++){
			var d = distance(users[k].lat , users[k].lon , users[i].lat , users[i].lon);
			if(d<10)
			{
				closeUser= users[k];
				break;
			}
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

function increaseScore(){
	for(var i=0;i<users.length;i++){
		users[i].score+=1;
		sockets[i].con.emit('score update' , {id:users[i].id , score:users[i].score});
	}
}

setInterval(chooseTechExplosion, 60000);
setInterval(increaseScore , 1000);
//setInterval(increaseScore , 2000);