var currentOpponents;

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
        // spawn a new instance of Touch
        // if the user has tapped the screen
        if (DarkForest.Input.tapped) {
            DarkForest.entities.push(new DarkForest.Touch(DarkForest.Input.x, DarkForest.Input.y));
            // set tapped back to false
            // to avoid spawning a new touch
            // in the next cycle
            DarkForest.Input.tapped = false;
        }
        if(DarkForest.ExitFullScreen.active){
          var d = new DarkForest.ExitFullScreen('Exit Fullscreen',220 , 15 , 100 , 20 , '#9100EC');
          d.handler = function(){
            alert("Exit full screen");
            DarkForest.isFullScreen = !DarkForest.isFullScreen;
            console.log('exit')
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
        if(DarkForest.TechnologyExplosion.active && !(DarkForest.currentActive instanceof DarkForest.CloseUserFound)){
          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
           var techExplosion = new DarkForest.TechnologyExplosion();
           DarkForest.currentActive = techExplosion;
           DarkForest.entities.push(techExplosion);
           DarkForest.TechnologyExplosion.active = false;
        }
        if(DarkForest.Loss.active){
          if(DarkForest.currentActive!=null )
            DarkForest.currentActive.remove = true;
          var loss = new DarkForest.Loss();
          DarkForest.currentActive = techExplosion;
           DarkForest.entities.push(loss);
           DarkForest.Loss.active = false;
        }
        if(DarkForest.Win.active){
          if(DarkForest.currentActive!=null )
            DarkForest.currentActive.remove = true;
          var win = new DarkForest.Win();
          DarkForest.currentActive = win;
           DarkForest.entities.push(win);
           DarkForest.Win.active = false;
        }
        if(DarkForest.Peace.active && !(DarkForest.currentActive instanceof DarkForest.CloseUserFound)){

          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
          var peace = new DarkForest.Peace();
          DarkForest.currentActive = peace;
           DarkForest.entities.push(peace);
           DarkForest.Peace.active = false;
        }
        if(DarkForest.CloseUserFound.active){
          if(DarkForest.currentActive!=null)
            DarkForest.currentActive.remove = true;
          var closeUserFound = new DarkForest.CloseUserFound();
          DarkForest.currentActive = closeUserFound;
           DarkForest.entities.push(closeUserFound);
           DarkForest.CloseUserFound.active = false;
        }
        // spawn an explosion
        for (var n = 0; n < 1; n +=1 ) {
            DarkForest.entities.push(new DarkForest.Particle(
                Math.random()*DarkForest.width, 
                Math.random()*DarkForest.height, 
                2, 
                // random opacity to spice it up a bit
                'rgba(255,255,255,'+Math.random()*1+')'
            )); 
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
    
};

// abstracts various canvas operations into
// standalone functions
DarkForest.Draw = {

    clear: function() {
        DarkForest.ctx.clearRect(0, 0, DarkForest.width, DarkForest.height);
    },

    rect: function(x, y, w, h, col) {
        DarkForest.ctx.fillStyle = col;
        DarkForest.ctx.fillRect(x, y, w, h);
    },

    circle: function(x, y, r, col) {
        DarkForest.ctx.fillStyle = col;
        DarkForest.ctx.beginPath();
        DarkForest.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
        DarkForest.ctx.closePath();
        DarkForest.ctx.fill();
    },

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
        console.log(DarkForest.mouse)
       // DarkForest.mouse.down = (data.which == 1);
       // DarkForest.mouse.clicked = (data.which == 1 && !DarkForest.mouse.down);
        DarkForest.Draw.circle(this.x, this.y, 10, 'red');
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

DarkForest.Bubble = function() {

    this.type = 'bubble';
    this.x = 100;
    this.r = 5;                // the radius of the bubble
    this.y = DarkForest.height + 100; // make sure it starts off screen
    this.remove = false;

    this.update = function() {

        // move up the screen by 1 pixel
        this.y -= 1;

        // if off screen, flag for removal
        if (this.y < -10) {
            this.remove = true;
        }

    };

    this.render = function() {

        DarkForest.Draw.circle(this.x, this.y, this.r, 'rgba(255,255,255,1)');
    };

};

DarkForest.Particle = function(x, y,r, col) {

    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;

    // determines whether particle will
    // travel to the right of left
    // 50% chance of either happening
    this.dir = (Math.random() * 2 > 1) ? 1 : -1;

    // random values so particles do not
    // travel at the same speeds
    this.vx = ~~(Math.random() * 4) * this.dir;
    this.vy = ~~(Math.random() * 7);

    this.remove = false;

    this.update = function() {

        // update coordinates
        this.x += this.vx;
        this.y += this.vy;

        // increase velocity so particle
        // accelerates off screen
        this.vx *= 0.99;
        this.vy *= 0.99;

        // adding this negative amount to the
        // y velocity exerts an upward pull on
        // the particle, as if drawn to the
        // surface
        this.vy -= 0.25;

        // off screen
        if (this.y < 0) {
            this.remove = true;
        }

    };

    this.render = function() {
        DarkForest.Draw.circle(this.x, this.y, this.r, this.col);
    };

};

DarkForest.TechnologyExplosion = function(){
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
      DarkForest.Draw.text("Technology Explosion",DarkForest.width/2-90,DarkForest.height/4+15,16,'red')
      //Draw the body
      DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
      DarkForest.Draw.text("You just experienced a technology",10,DarkForest.height/4+50,14,'white')
      DarkForest.Draw.text("explosion, which gives you 5",10,DarkForest.height/4+70,14,'white')
      DarkForest.Draw.text("bonus score.",10,DarkForest.height/4+90,14,'white')
      //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "You just experienced a technology explosion, which gives you 5 bonus score.", 12, 2);
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
    DarkForest.Draw.text("You are in a war with civilization #002",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("please choose your next move.",10,DarkForest.height/4+70,14,'white')
    //Create the buttons
    if(this.time<1){
      var fight = new DarkForest.Fight(self , "Fight" , 10 , DarkForest.height/4+90 ,DarkForest.width/2-20 ,40 , '#D32B2F');
      fight.handler = function(){
        socket.emit('fight called' , {id:currentOpponents.id , callId:currentOpponents.myId ,  oppId:currentOpponents.oppId});
        self.remove=true;
        fight.remove=true;
        peace.remove = true;
        DarkForest.currentActive = null;
      }
      DarkForest.entities.push(fight);

      var peace = new DarkForest.PeaceButton(self , "Peace" , DarkForest.width/2 + 5 , DarkForest.height/4+90 ,DarkForest.width/2-20 ,40 , '#40E5EC');
      peace.handler = function(){
        socket.emit('peace called' , {id:currentOpponents.id , callId:currentOpponents.myId ,  oppId:currentOpponents.oppId});
        self.remove=true;
        console.log(currentOpponents);
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
    DarkForest.Draw.text("Loss",DarkForest.width/2-20,DarkForest.height/4+15,16,'red')
    //Draw the body
    DarkForest.Draw.rect(5,DarkForest.height/4+30,DarkForest.width-10,85,'#5A5959');
    DarkForest.Draw.text("Your civilization has been ",10,DarkForest.height/4+50,14,'white')
    DarkForest.Draw.text("destroyed. We are looking forward ",10,DarkForest.height/4+70,14,'white')
    DarkForest.Draw.text("to see you again.",10,DarkForest.height/4+90,14,'white')
    //paint_centered_wrap(DarkForest.canvas, 20, DarkForest.height/4, DarkForest.width-40, DarkForest.height/4, "Your civilization #001 has been destroyed. We are looking forward to see you again.", 12, 2);

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
    socket = io.connect('/');

	//receive your random id from server
    socket.on('welcome',function(data){
        User.id = data.id;
        console.log(User.id);
    })
    //if a new user arrives
	socket.on('new user',function(data){
		console.log("new user connected");
		User.newUser(data.online);
		DarkForest.score.totalOnline=++data.online;
    getLocationUpdate();

	});

	//if a user leavers
	socket.on('user disconnected', function(data){
		console.log("user disconnected");
		User.userLeft();
	  DarkForest.score.totalOnline--;
	});

    //periodically receive score updates
    socket.on('score update', function(data){
        if(data.id==User.id)
        {
            User.increaseScore(data.score);
            DarkForest.score.score=data.score;
        }
    });

    socket.on('close user found', function(data){
        var ids = {id:data.id , myId:User.id , oppId:data.oppId}
        console.log(ids);
        currentOpponents = ids;
        DarkForest.CloseUserFound.active=true;
    })

    socket.on('loss' , function(data){
        DarkForest.Loss.active = true;
    })

    socket.on('win',function(data){
        User.newKill(data.score);
        DarkForest.score.score+=data.score;
        DarkForest.score.killed++;
        DarkForest.Win.active = true;
    });

    socket.on('peace' , function(data){
        DarkForest.Peace.active = true;
        console.log('peace made');
    })

    socket.on('tech explosion' , function(data){
        User.increaseScore(5);
        DarkForest.score.score+=5;
        DarkForest.TechnologyExplosion.active = true;
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
   DarkForest.PermissionError.active = true;
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
// listen for clicks
window.addEventListener('click', function(e) {
    e.preventDefault();
    DarkForest.Input.set(e);
}, false);

window.addEventListener("mousedown", function(e) {
    console.log("mousedown")
    DarkForest.mouse.clicked = !DarkForest.mouse.down;
    DarkForest.mouse.down = true;
});

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

