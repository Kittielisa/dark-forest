var DarkForest = {
	width : 320 ,
	height : 480 ,
	// we'll set the rest of these
    // in the init function
    ratio:  null,
    currentWidth:  null,
    currentHeight:  null,
    canvas: null,
    ctx:  null,
    isFullScreen : true ,
    isEligible : false ,

    init : function(){
    	// the proportion of width to height
        DarkForest.ratio = DarkForest.width / DarkForest.height;
        // these will change when the screen is resized
        DarkForest.currentWidth = DarkForest.width;
        DarkForest.currentHeight = DarkForest.height;
        // this is our canvas element
        DarkForest.canvas = document.getElementsByTagName('canvas')[0];
        // setting this is important
        // otherwise the browser will
        // default to 320 x 200
        DarkForest.canvas.width = DarkForest.width;
        DarkForest.canvas.height = DarkForest.height;
        // the canvas context enables us to 
        // interact with the canvas api
        DarkForest.ctx = DarkForest.canvas.getContext('2d');

        // we're ready to resize
        DarkForest.resize();

        
    } ,

    resize: function() {

    		//if full screen is not active, leave some place below the canvas for buttons
    		if(DarkForest.isFullScreen==false){
    			DarkForest.currentHeight = window.innerHeight - window.innerHeight/6;
    			// resize the width in proportion
    			// to the new height
    			DarkForest.currentWidth = window.innerHeight * DarkForest.ratio;

    		}else{
    			DarkForest.currentHeight = window.innerHeight;
    			// resize the width in proportion
    			// to the new height
    			DarkForest.currentWidth = DarkForest.currentHeight * DarkForest.ratio;
    		}

            

            // this will create some extra space on the
            // page, allowing us to scroll past
            // the address bar, thus hiding it.
            if (DarkForest.android || DarkForest.ios) {
                document.body.style.height = (window.innerHeight + 50) + 'px';
            }

            // set the new canvas style width and height
            // note: our canvas is still 320 x 480, but
            // we're essentially scaling it with CSS
            DarkForest.canvas.style.width = DarkForest.currentWidth + 'px';
            DarkForest.canvas.style.height = DarkForest.currentHeight + 'px';

            //adjust buttons according to canvas width
            document.getElementById('contact-button').width = DarkForest.currentWidth;
            document.getElementById('story-button').width = DarkForest.currentWidth;
            document.getElementById('credits-button').width = DarkForest.currentWidth;

            
            // we use a timeout here because some mobile
            // browsers don't fire if there is not
            // a short delay
            window.setTimeout(function() {
                    window.scrollTo(0,1);
            }, 1);
        },

    //display the error if user is out of campus
    locationError : function(err){
        if(err.code == 1) {
            //display the permission error
            $( "#error-permission" ).dialog({
                modal: true,closeOnEscape: false, width: DarkForest.currentWidth -20,show: { effect: "blind", duration: 800 } ,
                buttons: {
                  Ok: function() {
                    $( this ).dialog( "close" );
                  }
                }
              });
            $('#error-permission').dialog('option', 'position', 'center');

        }else if( err.code == 2) {
            //display position not accessible error
          $( "#error-postion" ).dialog({
                  modal: true, closeOnEscape: false,width: DarkForest.currentWidth -20,show: { effect: "blind", duration: 800 } ,               
                  buttons: {
                  Ok: function() {
                    $( this ).dialog( "close" );
                  }
                }
            });
        }
    }  ,

    closeUserFound : function(data){
          //display position not accessible error
        $( "#close-user-found" ).dialog({
                modal: true, autoOpen: false, width: DarkForest.currentWidth -20,               
                buttons: {
                Fight: function() {
                  console.log(data.id);
                  console.log(data.oppId);
                  socket.emit('fight called' , {id:data.id , oppId:data.oppId});
                  $( this ).dialog( "close" );
                } , 
                Peace: function() {
                  console.log(data.id);
                  console.log(data.oppId);
                  socket.emit('peace called' , {id:data.id , oppId:data.oppId});
                  $( this ).dialog( "close" );
                } 
              },
              open: function(event, ui){
                   setTimeout(function(){
                           $('#close-user-found').dialog('close');                
                       }, 3000);
               }
          });

          $("#close-user-found").dialog( "open" )
    },

    win : function(data){
          //display position not accessible error
        $(".ui-dialog-content").dialog("close");
        $( "#win-message" ).dialog({
                modal: true, closeOnEscape: false, width: DarkForest.currentWidth -20,show: { effect: "blind", duration: 800 } ,               
                buttons: {
                Ok: function() {
                  $( this ).dialog( "close" );
                } 
              }
          });
    } ,

    loss : function(data){
          //display position not accessible error
        $(".ui-dialog-content").dialog("close");
        $( "#loss-message" ).dialog({
                modal: true, closeOnEscape: false, width: DarkForest.currentWidth -20,show: { effect: "blind", duration: 800 } ,               
                buttons: {
                Ok: function() {
                  $( this ).dialog( "close" );
                } 
              }
          });
    } ,


    //draw the score, kills and total users
    drawStats : function(user){
    	DarkForest.clearStats();
    	DarkForest.ctx.font="14px Georgia";
        DarkForest.ctx.fillText("Score : " + user.score + " Killed : " + user.killed + "     " + user.totalOnline + " Players online " ,10,50);
    } , 

    clearStats : function(){
    	DarkForest.ctx.clearRect(0, 0,DarkForest.currentWidth, DarkForest.currentHeight);
    } ,
    //if the user receives a tech explosion bonus
    receivedTechExplosion : function(){
        User.increaseScore(5);
        $( "#tech-explosion" ).dialog({
            modal: true, width: DarkForest.currentWidth -20,show: { effect: "blind", duration: 800 } ,               
            buttons: {
              Ok: function() {
                $( this ).dialog( "close" );
              }
            }
          });
    }




};

var socket ;
window.onload = function(){
	//connect to the server
    socket = io.connect('http://127.0.0.1:3000');

	//receive your random id from server
    socket.on('welcome',function(data){
        User.id = data.id;
        console.log(User.id);
    })
    //if a new user arrives
	socket.on('new user',function(data){
		console.log("new user connected");
		User.newUser(data.online);
		DarkForest.drawStats(User);
		getLocationUpdate();

	});

	//if a user leavers
	socket.on('user disconnect', function(data){
		console.log("user disconnected");
		User.userLeft();
		DarkForest.drawStats(User);
	});

    //periodically receive score updates
    socket.on('score update', function(data){
        console.log("score updated");
        if(data.id==User.id)
        {
            User.increaseScore(data.score);
            DarkForest.drawStats(User);
        }
    });

    socket.on('close user found', function(data){
        var ids = {id:User.id , oppId:data.id}
        console.log(ids);
        DarkForest.closeUserFound(ids);
    })

    socket.on('loss' , function(data){
        DarkForest.loss(data);
    })

    socket.on('win',function(data){
        User.newKill(data.score);
        DarkForest.win(data);
    })
    



}

//get lat,lon of the current user and send them to server alongwith user id
function showLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  socket.emit('location change' , {id:User.id , lat:latitude, lon:longitude});
}

//if an error occurs while accessing location
function errorHandler(err) {
   DarkForest.locationError(err);
}

//updates each time the location of user changes
function getLocationUpdate(){

   if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      var options = {timeout:5000};
      geoLoc = navigator.geolocation;
      watchID = geoLoc.watchPosition(showLocation, 
                                     errorHandler,
                                     options);
   }else{
      alert("Sorry, browser does not support geolocation!");
   }
}

window.addEventListener('load', DarkForest.init, false);
window.addEventListener('resize', DarkForest.resize, false);

