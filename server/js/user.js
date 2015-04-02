var User = {
	score : 0 ,
	killed : 0,
	totalOnline : 0 ,
	id:null ,

	newUser : function(online){
		User.totalOnline = online;
		User.totalOnline++;
	} ,

	userLeft : function(){
		User.totalOnline--;
	},

	newKill : function(bounty){
		User.score+=bounty;
		User.killed++;
	}  ,

	increaseScore : function(score){
		User.score=score;
	}


}