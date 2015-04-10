var currentOpponents;
var cntct=0;
var stry=0;
var crdts=0;
var firstTime = true;
var enemy=false;
var winner = 0;
/*
  The main class is DarkForest. It contains all the visual elements and game logic
  For reference : http://www.smashingmagazine.com/2012/10/19/design-your-own-mobile-game/
*/
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
    entities : [],
    nextBubble: 100,
    currentActive: null,
    mouse : {
            x: 0,
            y: 0,
            clicked: false,
            down: false
        },


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
        DarkForest.ExitFullScreen.active = true;
        DarkForest.loop();
     
        
                
    } ,

    // this is where all entities will be moved
    // and checked for collisions, etc.
    update: function() {
        var i;
    //if the game just started, add the particles and radar in the enitities
		if(firstTime){
			DarkForest.entities.push(new DarkForest.Particle());
			DarkForest.entities.push(new DarkForest.Radar());
			firstTime = false;
		}
		
		    //if menu is clicked, push a new instance of menu in the entities
        if(DarkForest.menu.active){
          DarkForest.entities.push(new DarkForest.menu());
          DarkForest.menu.active = false;
        }

        if(DarkForest.Winner.active){
          DarkForest.entities.push(new DarkForest.Winner());
          DarkForest.Winner.active = false;
          DarkForest.Loss.remove = true;
        }

        if(DarkForest.locationError.active){
          DarkForest.entities.push(new DarkForest.locationError());
          DarkForest.locationError.active = false;
        }
        // spawn a new instance of Touch
        // if the user has tapped the screen
        
        if (DarkForest.Input.tapped) {
            DarkForest.entities.push(new DarkForest.Touch(DarkForest.Input.x, DarkForest.Input.y));
            // set tapped back to false
            // to avoid spawning a new touch
            // in the next cycle
            DarkForest.Input.tapped = false;
        }
        //create the menu button when the game launches for the first time
        if(DarkForest.ExitFullScreen.active){
          var d = new DarkForest.ExitFullScreen('MENU',220 , 15 , 100 , 20 , '#9100EC');
          d.handler = function(){
    		  crdts=0;
    		  stry=0;
    		  cntct=0;
            DarkForest.isFullScreen = !DarkForest.isFullScreen;
            DarkForest.menu.active = true;
          }
          DarkForest.entities.push(d)
 
          DarkForest.ExitFullScreen.active = false;
        }
        // cycle through all entities and update as necessary
        for (i = 0; i < DarkForest.entities.length; i += 1) {
            DarkForest.entities[i].update();

            // delete from array if remove property
            // flag is set to true
            if (DarkForest.entities[i].remove) {
                DarkForest.entities.splice(i, 1);
            }
        }

        //create a new instance of technology explosion popup and add it to the entities
        if(DarkForest.TechnologyExplosion.active && !(DarkForest.currentActive instanceof DarkForest.CloseUserFound)){
          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
           var techExplosion = new DarkForest.TechnologyExplosion();
           DarkForest.currentActive = techExplosion;
           DarkForest.entities.push(techExplosion);
           DarkForest.TechnologyExplosion.active = false;
        }
        //create a new instance of loss popup and add it to the entities

        if(DarkForest.Loss.active){
          if(DarkForest.currentActive!=null )
            DarkForest.currentActive.remove = true;
          var loss = new DarkForest.Loss();
          DarkForest.currentActive = techExplosion;
           DarkForest.entities.push(loss);
           DarkForest.Loss.active = false;
        }
        //create a new instance of wait popup and add it to the entities

        if(DarkForest.Wait.active && !(DarkForest.currentActive instanceof DarkForest.CloseUserFound)){
          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
           var wait = new DarkForest.Wait();
           DarkForest.currentActive = wait;
           DarkForest.entities.push(wait);
           DarkForest.Wait.active = false;
        }

       //create a new instance of win popup and add it to the entities

        if(DarkForest.Win.active){
          if(DarkForest.currentActive!=null )
            DarkForest.currentActive.remove = true;
          var win = new DarkForest.Win();
          DarkForest.currentActive = win;
           DarkForest.entities.push(win);
           DarkForest.Win.active = false;
        }

        //create a new instance of peace popup and add it to the entities

        if(DarkForest.Peace.active && !(DarkForest.currentActive instanceof DarkForest.CloseUserFound)){

          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
          var peace = new DarkForest.Peace();
          DarkForest.currentActive = peace;
           DarkForest.entities.push(peace);
           DarkForest.Peace.active = false;
        }

         //create a new instance of 'war alert' popup and add it to the entities

        if(DarkForest.CloseUserFound.active){
          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
          var closeUserFound = new DarkForest.CloseUserFound();
          DarkForest.currentActive = closeUserFound;
           DarkForest.entities.push(closeUserFound);
           DarkForest.CloseUserFound.active = false;
        }
        
    },

    // this is where we draw all the entities
    render: function() {

       var i;

      DarkForest.Draw.rect(0, 0, DarkForest.width, DarkForest.height, '#534C4D');
      DarkForest.Draw.text('Score:' + DarkForest.score.score, 5, 30, 12, '#fff');
      DarkForest.Draw.text('Killed:' + DarkForest.score.killed, 80, 30, 12, '#fff');
      DarkForest.Draw.text('Online:' + DarkForest.score.totalOnline, 150, 30, 12, '#fff');

       // cycle through all entities and render to canvas
       for (i = 0; i < DarkForest.entities.length; i += 1) {
           DarkForest.entities[i].render();
       }


    },

    // the actual loop
    // requests animation frame,
    // then proceeds to update
    // and render
    loop: function() {

        requestAnimFrame( DarkForest.loop );

        DarkForest.update();
        DarkForest.render();
    },

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

                       
            // we use a timeout here because some mobile
            // browsers don't fire if there is not
            // a short delay
            window.setTimeout(function() {
                    window.scrollTo(0,1);
            }, 1);
        },
    
};

// abstracts various canvas operations into
// standalone functions
DarkForest.Draw = {
    //clear the screen
    clear: function() {
        DarkForest.ctx.clearRect(0, 0, DarkForest.width, DarkForest.height);
    },
    //draw a rectangle at (x,y) with width w, height h and color col
    rect: function(x, y, w, h, col) {
        DarkForest.ctx.fillStyle = col;
        DarkForest.ctx.fillRect(x, y, w, h);
    },
    //draw a circle ar (x,y) with radius r and color col
    circle: function(x, y, r, col) {
        DarkForest.ctx.fillStyle = col;
        DarkForest.ctx.beginPath();
        DarkForest.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
        DarkForest.ctx.closePath();
        DarkForest.ctx.fill();
    },
    //write 'string' at x,y with size 'size' and color col
    text: function(string, x, y, size, col) {
        DarkForest.ctx.font = 'bold '+size+'px Monospace';
        DarkForest.ctx.fillStyle = col;
        DarkForest.ctx.fillText(string, x, y);
    }

};

// + add this at the bottom of your code,
// before the window.addEventListeners
DarkForest.Input = {

    x: 0,
    y: 0,
    tapped :false,

    set: function(data) {
        var offsetTop = DarkForest.canvas.offsetTop,
            offsetLeft = DarkForest.canvas.offsetLeft;

        scale = DarkForest.currentWidth / DarkForest.width;

        this.x = ( data.pageX - offsetLeft ) / scale;
        this.y = ( data.pageY - offsetTop ) / scale;
        this.tapped = true; 
        DarkForest.mouse.x = this.x;
        DarkForest.mouse.y = this.y;
        
    }

};

DarkForest.Touch = function(x, y) {

    this.type = 'touch';    // we'll need this later
    this.x = x;             // the x coordinate
    this.y = y;             // the y coordinate
    this.r = 5;             // the radius
    this.opacity = 1;       // initial opacity; the dot will fade out
    this.fade = 0.05;       // amount by which to fade on each game tick
    this.remove = false;    // flag for removing this entity. POP.update
                            // will take care of this

    this.update = function() {
        // reduce the opacity accordingly
        this.opacity -= this.fade; 
        // if opacity if 0 or less, flag for removal
        this.remove = (this.opacity < 0) ? true : false;
    };

    this.render = function() {
        DarkForest.Draw.circle(this.x, this.y, this.r, 'rgba(255,0,0,'+this.opacity+')');
    };

};

/*
  Handles the technology explosion popup
*/

DarkForest.TechnologyExplosion = function(){
    this.time = 0;
    this.active = false; //set active property to true to display popup
    this.remove = false;  //set remove property to true to remove popup

    this.update = function(){
        this.time++;
        //when the timer reaches 100, remove the popup
        if(this.time>100){
          this.remove=true;
        }
      
      
    }
    this.render = function() {
      //Draw the header
      DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
      DarkForest.Draw.text("Technology Explosion",DarkForest.width/2-90,DarkForest.height/4+15,16,'red')
      //Draw the body
      DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
      DarkForest.Draw.text("You just experienced a technology",10,DarkForest.height/4+50,14,'white')
      DarkForest.Draw.text("explosion, which gives you 5",10,DarkForest.height/4+70,14,'white')
      DarkForest.Draw.text("bonus score.",10,DarkForest.height/4+90,14,'white')
    };
}

DarkForest.CloseUserFound = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
      if(this.time>100){
        //this.remove=true;
      }
  }
  this.render = function() {
    //Draw the header
    var self = this;
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("War Alert",DarkForest.width/2-40,DarkForest.height/4+20,20,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,115,'#5A5959');
    DarkForest.Draw.text("You are in a war with civilization #"+currentOpponents.number,10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("please choose your next move.",10,DarkForest.height/4+70,14,'white')
    //Create the buttons
    if(this.time<1){
      var fight = new DarkForest.Fight(self , "Fight" , 10 , DarkForest.height/4+90 ,DarkForest.width/2-20 ,40 , '#D32B2F');
      fight.handler = function(){
        socket.emit('fight called' , {id:currentOpponents.id , callId:currentOpponents.myId ,  oppId:currentOpponents.oppId});
        self.remove=true;
        fight.remove=true;
        peace.remove = true;
        DarkForest.Wait.active = true;
        DarkForest.currentActive = null;
      }
      DarkForest.entities.push(fight);

      var peace = new DarkForest.PeaceButton(self , "Peace" , DarkForest.width/2 + 5 , DarkForest.height/4+90 ,DarkForest.width/2-20 ,40 , '#40E5EC');
      peace.handler = function(){
        socket.emit('peace called' , {id:currentOpponents.id , callId:currentOpponents.myId ,  oppId:currentOpponents.oppId});
        self.remove=true;
        console.log(currentOpponents);
        DarkForest.Wait.active = true;
        fight.remove=true;
        peace.remove = true;
        DarkForest.currentActive = null;
      }
      DarkForest.entities.push(peace);
    }
    
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "You are in a war with civilization #002, please choose your next move.", 12, 2);

  };
}

DarkForest.PermissionError = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
      if(this.time>100){
        this.remove=true;
      }
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("Permission Error",DarkForest.width/2-20,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("This application needs to access your",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("location.",10,DarkForest.height/4+70,14,'white')
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "Congrats! You win the war. You enemy was a less developed civilization. You have adopted your enemy's score!", 12, 2);

  };
}

DarkForest.Wait = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("Wait",DarkForest.width/2-20,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("Waiting for opponent to respond",10,DarkForest.height/4+50,14,'white')
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "Congrats! You win the war. You enemy was a less developed civilization. You have adopted your enemy's score!", 12, 2);

  };
}

DarkForest.Win = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
      if(this.time>100){
        this.remove=true;
      }
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("You won",DarkForest.width/2-20,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("Congrats! You win the war. You",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("enemy was a less developed civilization",10,DarkForest.height/4+70,14,'white')
    DarkForest.Draw.text("You have adopted your enemy's score!",10,DarkForest.height/4+90,14,'white')
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "Congrats! You win the war. You enemy was a less developed civilization. You have adopted your enemy's score!", 12, 2);

  };
}

DarkForest.Loss = function(){
  this.time = 0;
  var self=this;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
     
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("Loss",DarkForest.width/2-20,DarkForest.height/4+15,16,'red')
    //Draw the body DarkForest.score.score
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,145,'#5A5959');
    DarkForest.Draw.text("Your civilization has been ",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("destroyed. We are looking forward ",10,DarkForest.height/4+70,14,'white')
    DarkForest.Draw.text("to see you again ",10,DarkForest.height/4+90,14,'white')
  	DarkForest.Draw.text("Your Score Is "+DarkForest.score.score,10,DarkForest.height/4+110,14,'white')
  	DarkForest.Draw.text("Killed number Is "+DarkForest.score.killed,10,DarkForest.height/4+130,14,'white')
      if(this.time<2){
         var StartOver = new DarkForest.StartOver(self , "start Over" , 8 , DarkForest.height/4+120 ,DarkForest.width-16 ,40 , '#D32B2F');
          StartOver.handler = function(){
       
            location.reload();
          }
          DarkForest.entities.push(StartOver);
      }
 

  };
}

DarkForest.Peace = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
      if(this.time>100){
        this.remove=true;
      }
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("Peace",DarkForest.width/2-90,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("You and the other civilization are",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("both peaceful. You are free to leave.",10,DarkForest.height/4+70,14,'white')
   // DarkForest.Draw.text("bonus score.",10,DarkForest.height/4+90,14,'black')
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "You and the other civilization are both peaceful. You are free to leave.", 12, 2);

  };
}

DarkForest.Fight = function(parent , text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;

  this.time = 0;
  this.active = false;
  this.remove = false;
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(mouse);
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    this.time++;
    if(parent.remove){
      this.remove=true;
    }
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);

    if (this.clicked && wasNotClicked) {
      console.log("click")
        this.handler()
		DarkForest.mouse.down=false;
    }
  }
  this.render = function(){
    
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 20;
    //DarkForest.ctx.setFillColor(1, 1, 1, 1.0);
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
  }
}

DarkForest.PeaceButton = function(parent , text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;

  this.time = 0;
  this.active = false;
  this.remove = false;
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(mouse);
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            console.log(DarkForest.mouse)
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    this.time++;
    if(parent.remove){
      this.remove=true;
    }
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);

    if (this.clicked && wasNotClicked) {
      console.log("click")
        this.handler()
    }
  }
  this.render = function(){
    
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 20;
    //DarkForest.ctx.setFillColor(1, 1, 1, 1.0);
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
    //console.log(alertButton);
  }
}

DarkForest.ExitFullScreen = function(text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;
  
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);

    if (this.clicked && wasNotClicked) {
      console.log("click")
        this.handler()
    }
  }
  this.render = function(){
    
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 14;
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
    //console.log(alertButton);
  }
}

DarkForest.Contact = function(parent , text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);
    if(this.y>DarkForest.height-100 && !parent.remove)
      this.y-=20;
    if(parent.remove)
      this.y+=20
    if(this.y>DarkForest.height+10)
      this.remove = true;
    if (this.clicked && wasNotClicked) {
      console.log("click")
        this.handler()
    }
  }
  this.render = function(){
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 14;
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
    //console.log(alertButton);
  }
}

DarkForest.Credits = function(parent , text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);
    if(this.y>DarkForest.height-65 && !parent.remove)
      this.y-=13;
    if(parent.remove)
      this.y+=13
    if(this.y>DarkForest.height+10)
      this.remove = true;
    if (this.clicked && wasNotClicked) {
      console.log("click")
        this.handler()
    }
  }
  this.render = function(){
    
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 14;
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
    //console.log(alertButton);
  }
}

DarkForest.Story = function(parent , text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);
    if(parent.remove)
      this.y+=5
    if(this.y>DarkForest.height+10)
      this.remove = true;
    if(this.y>DarkForest.height-30 && !parent.remove)
      this.y-=5;
    
    if (this.clicked && wasNotClicked) {
      console.log("click")
        this.handler()
    }
  }
  this.render = function(){
    
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 14;
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
    //console.log(alertButton);
  }
}

DarkForest.menu = function(){
  this.time = 0;
  
  this.active = false;
  this.remove = false;
  var self = this;
  
  
  
  this.update = function(){
      this.time++;
      if(DarkForest.isFullScreen){
        this.remove=true;
      }
  }
  this.render = function() {
    
    //Create the buttons
	
    if(this.time<3){
	
		
			
		var contact = new DarkForest.Contact(self , "Contact" , 0 , DarkForest.height , DarkForest.width , 30 , '#9100EC');
		contact.handler = function(){
		
		if(cntct==2)
		{
			cntct=0;
		}
		else
		{
		stry=0;
			crdts=0;
		 cntct++;
		 }
		
		DarkForest.entities.push(new DarkForest.ContactMenu());
	 
	  
      }
      DarkForest.entities.push(contact);
	  
      var story = new DarkForest.Story( self , "Story" , 0 , DarkForest.height , DarkForest.width , 30 , '#9100EC');
      story.handler = function(){
	 
	  if(stry==2)
		{
		
			stry=0;
		}
		else
		{
		cntct=0;
			crdts=0;
		 stry++;
		 }
		
		DarkForest.entities.push(new DarkForest.StoryMenu());
	  
      }
      DarkForest.entities.push(story);

      var credits = new DarkForest.Credits(self , "Credits" , 0 , DarkForest.height, DarkForest.width , 30 , '#9100EC');
      credits.handler = function(){
	  if(crdts==2)
		{
		
			crdts=0;
		}
		else
		{
		stry=0;
			cntct=0;
		 crdts++;
		 }
		
		DarkForest.entities.push(new DarkForest.CreditsMenu());

      }
      DarkForest.entities.push(credits);

    }
    
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "You are in a war with civilization #002, please choose your next move.", 12, 2);

  };
}


///////////////////////////////////////////////////////////////////////////////

DarkForest.ContactMenu = function(){

 this.x =-325;
  this.y = 0;
  
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  
  this.update = function(){
  
  if(cntct==2)
  {
  
  if(this.x<=0)
  {
	this.x+=15;
	
	}
	
	
  }
  else
  {
 
  if(this.x>=-325)
	this.x-=15;
	else
  cntct=0;
  }
  
	
  }



  this.render = function() {
    
    //Create the buttons
	
	DarkForest.Draw.rect(this.x,37,DarkForest.width-10,DarkForest.height-170,'#312A2A');
    DarkForest.Draw.text("Contact",this.x+DarkForest.width/2-40,37+20,20,'#9100EC')
    //Draw the body
    DarkForest.Draw.rect(this.x,37+30,DarkForest.width-10,DarkForest.height-170,'#5A5959');
    DarkForest.Draw.text("you can contact us any time at",this.x+10,37+50,14,'white')
    DarkForest.Draw.text("213123-123123123-123123",this.x+10,37+70,14,'white')
	
	}

  };
///////////////////////////////////////////////////////////////////////////////
DarkForest.CreditsMenu = function(){

 this.x =-325;
  this.y = 0;
  
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  
  this.update = function(){
  
  if(crdts==2)
  {
  
  if(this.x<=0)
  {
	this.x+=15;
	
	}
	
	
  }
  else
  {
  
  if(this.x>=-325)
	this.x-=15;
	else
  crdts=0;
  }
  
	
  }



  this.render = function() {
    
    //Create the buttons
	
	DarkForest.Draw.rect(this.x,37,DarkForest.width-10,DarkForest.height-170,'#312A2A');
    DarkForest.Draw.text("Credits",this.x+DarkForest.width/2-40,37+20,20,'#9100EC')
    //Draw the body
    DarkForest.Draw.rect(this.x,37+30,DarkForest.width-10,DarkForest.height-170,'#5A5959');
    DarkForest.Draw.text("you can contact us any time at",this.x+10,37+50,14,'white')
    DarkForest.Draw.text("213123-123123123-123123",this.x+10,37+70,14,'white')
	
	}

  };
///////////////////////
DarkForest.StoryMenu = function(){

 this.x =-325;
  this.y = 0;
  
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  
  this.update = function(){
  
  if(stry==2)
  {
  
  if(this.x<=0)
  {
	this.x+=15;
	
	}
	
	
  }
  else
  {
  if(this.x>=-325)
	this.x-=15;
	else
  stry=0;
  }
  
	
  }



  this.render = function() {
    
    //Create the buttons
	
	DarkForest.Draw.rect(this.x,37,DarkForest.width-10,DarkForest.height-170,'#312A2A');
    DarkForest.Draw.text("Story",this.x+DarkForest.width/2-40,37+20,20,'#9100EC')
    //Draw the body
    DarkForest.Draw.rect(this.x,37+30,DarkForest.width-10,DarkForest.height-170,'#5A5959');
    DarkForest.Draw.text("you can contact us any time at",this.x+10,37+50,14,'white')
    DarkForest.Draw.text("213123-123123123-123123",this.x+10,37+70,14,'white')
	
	}

  };
//////////////////////////particle//////////////////////////
var checker=true;
var particles1 = [];
	var particles2 = [];
	var particles3 = [];
DarkForest.Particle = function(){


var W=DarkForest.width;
var H=DarkForest.height;



 this.x = Math.random()*DarkForest.width;//position
	this.y = Math.random()*DarkForest.height;

	this.vx = Math.random()*0.5 - 0.5;//velocity
    this.vy = Math.random()*0.5 - 0.5;

    this.r1 = Math.random()*50;//particle size
    this.r2 = Math.random()*20;
    this.r3 = Math.random()*80;







 
  this.update = function()
  {
  }





  this.render = function() {
  
    
	if(checker==true)
	{
	for(var i = 0; i <10; i++)
	{
		particles1.push(new DarkForest.Particle());
	}
	
	for(var i = 0; i <5; i++)
	{
	  particles2.push(new DarkForest.Particle());
	}
	
	for(var i = 0; i <10; i++)
	{
	  particles3.push(new DarkForest.Particle());
	}
checker=false;
}
	var image1 = new Image();
	var image2 = new Image();
	var image3 = new Image();
	image1.src = "star1.png";
	image2.src = "star2.png";
	image3.src = "star3.png";

	DarkForest.ctx.fillStyle = "black";
	DarkForest.ctx.fillRect(0, 40, W, H);

    for(var t =0; t < particles1.length; t++)
    {
	     var p = particles1[t];
       p.x += p.vx;
       p.y += p.vy;
		
       if(p.x+50 < 0) p.x = W;
       if(p.y+50 < 0) p.y = H;  
       if(p.x-50 > W ) p.x = 0;
       if(p.y-50 > H ) p.y = 0;
	
       DarkForest.ctx.drawImage(image1,p.x,p.y,p.r1,p.r1); 
       //ctx.alpha=0.2;
	  
    }

   for(var t =0; t < particles2.length; t++)
    {
       var p = particles2[t];
       p.x += p.vx;
       p.y += p.vy;

       if(p.x+50 < 0) p.x = W;
       if(p.y+50 < 0) p.y = H;  
       if(p.x-50 > W ) p.x = 0;
       if(p.y-50 > H ) p.y = 0;
       DarkForest.ctx.drawImage(image2,p.x,p.y,p.r2,p.r2); 
	  
    }

     for(var t =0; t < particles3.length; t++)
    {
       var p = particles3[t];
       p.x += p.vx;
       p.y += p.vy;

       if(p.x+50 < 0) p.x = W;
       if(p.y+50 < 0) p.y = H;  
       if(p.x-50 > W ) p.x = 0;
       if(p.y-50 > H ) p.y = 0;

       DarkForest.ctx.drawImage(image3,p.x,p.y,p.r3,p.r3); 
	   
    }



    }
	
	
	
  };
/////////////////////////////radar/////////////////////////////
DarkForest.Radar = function(){
	var W=DarkForest.width;
	var H=DarkForest.height;



 
  this.update = function()
  {
  
  }





  this.render = function() {
   var image1 = new Image();
    var image = new Image();
	var image3 = new Image();
	
    image.src = "radar.png";
	image1.src = "User.png";
	image3.src = "enermy.png";
	
	DarkForest.ctx.drawImage(image,(W-120)/2,(H-10)/2,120,120); 
	DarkForest.ctx.drawImage(image1,(W-60)/2,(H+60)/2,60,45); 
	if(enemy==true)
	DarkForest.ctx.drawImage(image3,(W)/3,(H)/3,60,45); 
	
    }
	
	
	
  };

  
  
////////////////////////////////////////////////////////////

DarkForest.StartOver = function(parent , text,x,y,width,height , col){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.clicked = false;
  this.hovered = false;
  this.text = text;

  this.time = 0;
  this.active = false;
  this.remove = false;
  
  /*this.handler = function(){
      //this.timesClicked++;
      alert("This button has been clicked " + this.timesClicked + " time(s)!");
  };*/
  this.intersects = function(obj, mouse) {
        var t = 5; //tolerance
        if(mouse==null)
          return;
        //console.log(mouse);
        //console.log(obj)
        var xIntersect = (mouse.x + t) > obj.x && (mouse.x - t) <  obj.x + obj.width;
        var yIntersect = (mouse.y + t) > obj.y && (mouse.y - t) <  obj.y + obj.height;
        //DarkForest.mouse = null;
        return  xIntersect && yIntersect;
    }

  this.updateStats = function(canvas){
        if (this.intersects(this, DarkForest.mouse)) {
            this.hovered = true;
            if (DarkForest.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }

        if (!DarkForest.mouse.down) {
            this.clicked = false;
        }               
    }

  this.update = function(){
    this.time++;
    if(parent.remove){
      this.remove=true;
    }
    var wasNotClicked = !this.clicked;
    this.updateStats(DarkForest.ctx);

    if (this.clicked && wasNotClicked) {
	if(parent.time>0)
        this.handler()
    }
  }
  this.render = function(){
    
    
    //draw button
    DarkForest.ctx.fillStyle = col;
    DarkForest.ctx.fillRect(this.x, this.y, this.width, this.height);

    //text options
    var fontSize = 20;
    //DarkForest.ctx.setFillColor(1, 1, 1, 1.0);
    DarkForest.ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = DarkForest.ctx.measureText(this.text);
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + (this.height/2) + fontSize/3;

    //draw the text
    DarkForest.ctx.fillStyle = 'white';
    DarkForest.ctx.fillText(this.text, textX, textY);
  }
}

DarkForest.locationError = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
      
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("Location Error",DarkForest.width/2-90,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("Please go to the right location to ",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("participate in the game",10,DarkForest.height/4+70,14,'white')
   // DarkForest.Draw.text("bonus score.",10,DarkForest.height/4+90,14,'black')
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "You and the other civilization are both peaceful. You are free to leave.", 12, 2);

  };
}

DarkForest.Winner = function(){
  this.time = 0;
  this.active = false;
  this.remove = false;
  this.update = function(){
      this.time++;
      
  }
  this.render = function() {
    //Draw the header
    DarkForest.Draw.rect(5,DarkForest.height/4,DarkForest.width-10,30,'#312A2A');
    DarkForest.Draw.text("Winner",DarkForest.width/2-90,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("Civilization "+winner+" is the strongest",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("civilization in the universe",10,DarkForest.height/4+70,14,'white')

  };
}


/////////////////////////////////////////////////////////////







//this goes at the start of the program
// to track players's progress
DarkForest.score = {
    score: 0,
    killed: 0,
    totalOnline: 0
};


var socket ;
window.onload = function(){
  //connect to the server
    getLocation();

}

//get lat,lon of the current user and send them to server alongwith user id
function showLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  socket.emit('location change' , {id:User.id , lat:latitude, lon:longitude});
}

//if an error occurs while accessing location
function errorHandler(err) {
   DarkForest.PermissionError.active = true;
}

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
  return d; //distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//updates each time the location of user changes
function getLocationUpdate(){

   if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      var options = {enableHighAccuracy:true , timeout:5000};
      geoLoc = navigator.geolocation;
      watchID = geoLoc.watchPosition(showLocation, 
                                     errorHandler,
                                     options);
   }else{
      alert("Sorry, browser does not support geolocation!");
   }
}

getLocation = function(){
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(savePosition , handleError);
      } else { 
         locationAccess.bool = false;
      }
    
    }
  savePosition = function(position){
    var lat =  position.coords.latitude;
    var lon =  position.coords.longitude;

    if(distance(lat , lon , 40.692206, -73.963042)<16000000000000000000){
          socket = io.connect('/');

        //receive your random id from server
          socket.on('welcome',function(data){
              User.id = data.id;
              console.log(User.id);
          })
          //if a new user arrives
          socket.on('new user',function(data){
          User.newUser(data.online);
          DarkForest.score.totalOnline=++data.online;
          getLocationUpdate();

        });

        //if a user leavers
        socket.on('user disconnected', function(data){
          console.log("user disconnected");
          //User.userLeft();
          //DarkForest.score.totalOnline--;
        });

          //periodically receive score updates
          socket.on('score update', function(data){
              if(data.id==User.id)
              {
                  User.increaseScore(data.score);
                  DarkForest.score.score=data.score;
              }
          });
          //if a close user found, show popup for teh user to decide between fight and peace
          socket.on('close user found', function(data){
              enemy=true;
              var ids = {id:data.id , myId:User.id , oppId:data.oppId , number:data.number}
              console.log(ids);
              currentOpponents = ids;
              DarkForest.CloseUserFound.active=true;
          })
          //if the user loses a fight, display loss popup
          socket.on('loss' , function(data){
             enemy=false;
              DarkForest.Loss.active = true;
              DarkForest.score.totalOnline--;
          })
          //if the user wins a fight, display win popup

          socket.on('win',function(data){
               enemy=false;
              User.newKill(data.score);
              DarkForest.score.score+=data.score;
              DarkForest.score.killed++;
              DarkForest.Win.active = true;
              DarkForest.score.totalOnline--;

          });
          //if both user choose peace, show peace popup
          socket.on('peace' , function(data){
             enemy=false;
              DarkForest.Peace.active = true;
          })
          //if the user receives a technology explosion bonus, show the popu notifying him about the bonus
          socket.on('tech explosion' , function(data){
              User.increaseScore(5);
              DarkForest.score.score+=5;
              DarkForest.TechnologyExplosion.active = true;
          })

          socket.on('winner' , function(data){
            DarkForest.Winner.active = true;
            winner.number = data.number;
            winner.id = data.id

          })
          
        }else{
          DarkForest.locationError.active = true;
        }

}

handleError = function(error){

}



window.addEventListener('load', DarkForest.init, false);
window.addEventListener('resize', DarkForest.resize, false);
// listen for clicks
window.addEventListener('click', function(e) {
    e.preventDefault();
    DarkForest.Input.set(e);
}, false);
//listen for mouse down events
window.addEventListener("mousedown", function(e) {
    console.log("mousedown")
    DarkForest.mouse.clicked = !DarkForest.mouse.down;
    DarkForest.mouse.down = true;
});
//listen for mousemove events

window.addEventListener("mousemove", function(e) {
    
    e.preventDefault();
    DarkForest.Input.set(e);
    DarkForest.mouse.clicked = (e.which == 1 && !DarkForest.mouse.down);
    DarkForest.mouse.down = (e.which == 1);
});
//listen for mouseup events

window.addEventListener("mouseup", function(e) {
    DarkForest.mouse.down = false;
    console.log("mouseup")
    DarkForest.mouse.clicked = false;
});

// listen for touches
window.addEventListener('touchstart', function(e) {
    e.preventDefault();
    // the event object has an array
    // named touches; we just want
    // the first touch
    DarkForest.mouse.clicked = !DarkForest.mouse.down;
    DarkForest.mouse.down = true;
    DarkForest.Input.set(e.touches[0]);
}, false);
window.addEventListener('touchmove', function(e) {
    // we're not interested in this,
    // but prevent default behaviour
    // so the screen doesn't scroll
    // or zoom
    e.preventDefault();
}, false);
window.addEventListener('touchend', function(e) {
    // as above
    e.preventDefault();
    DarkForest.mouse.down = false;
    DarkForest.mouse.clicked = false;
}, false);
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

