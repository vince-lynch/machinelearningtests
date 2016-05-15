var canvas = document.getElementById('canvas');
 var context = canvas.getContext('2d');

 circles = [{X:  50, Y: 0, color: 'grey', col: 0, row: 0},{X:  100, Y: 0, color: 'grey', col: 8, row: 0},{X:  140, Y: 0, color: 'grey', col: 2, row: 0}, {X:  170, Y: 0, color: 'green', col: 4, row: 0},{X:  200, Y: 0, color: 'green',col: 7, row: 0}];

 var requestAnimationFrame = window.requestAnimationFrame || 
                             window.mozRequestAnimationFrame || 
                             window.webkitRequestAnimationFrame || 
                             window.msRequestAnimationFrame;

  score = 0;
  food = 2;
  poison = 3;
  robotVal = 1;
  density = 0.1;
  foodPoisonRatio = 0.5;
  foodCount = 0;
  poisonCount = 0;
  exploration = 0.2; // explore
  width = 10; //cells
  height = 10; //cells

  robot = {
      line: this.height-1,
      column: ~~(this.width/2)
  };
  var learner = new QLearner();

  board =[[0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0]];


function AIrandomAction(){
    //actions are -1,0,+1
    return ~~(Math.random() * 3) - 1;
};


 function endofCanvas(){ //deals with xAxis
  circles.forEach(function(circle) {
      if (circle.row == 9){ 
        board[9][circle.col] = 0; // clear back to ZERO
        circle.row = 0; // back into row ZERO
        startX = Math.floor(Math.random() * 10);
        if (circle.color == "green"){board[0][startX] = 2}
        if (circle.color == "grey"){board[0][startX] = 3}
        circle.col = startX;
      }
    });
 }

 function makeShape(x,y,color){
     var radius = 15;
     context.beginPath();
     context.arc(x, y, radius, 0, 2 * Math.PI, false);
     context.fillStyle = color;
     context.fill();
     context.lineWidth = 1;
     context.strokeStyle = '#003300';
     context.stroke();
 }

 // move circles
 function moveCircle(){
   context.clearRect(0,0,canvas.width,canvas.height);  // clear canvas
     circles.forEach(function(circle) {
      board[circle.row][circle.col] = 0; // clear previous pos
          circle.row++ 
         if (circle.color == "green"){board[circle.row][circle.col] = 2}
         if (circle.color == "grey"){board[circle.row][circle.col] = 3}// update board pos
     }); 
     circles.forEach(function(circle) {
        var xAxis = circle.col  * 30;
        var yAxis = circle.row  * 30;
         makeShape(xAxis,yAxis,circle.color)
     });
 }
 // Move Robot Circle
 function moveRobot(){
  var radius = 15;
  context.beginPath();
  var rXaxis = robot.column * 30;
  var rYaxis = robot.line * 30;
  context.arc(rXaxis, rYaxis, radius, 0, 2 * Math.PI, false);
  context.fillStyle = "black";
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = '#003300';
  context.stroke();
  }
  function hasRobotTouched(){
   circles.forEach(function(circle) {
     if(board[9][robot.column] == 2 && circle.col == robot.column){
            console.log("robot touched a food")
            score++;
            foodCount = foodCount +1;
            reward = 1;
        } 
        if(board[9][robot.column] == 3 && circle.col == robot.column){
             console.log("robot touched a poison")
             score = score -1;
             poisonCount = poisonCount +1;
             reward = -1;
           } 
   });
  }

  robotsetPosition = function(column){
      //set agents position
      column = (column + width) % width; //circular world
      robot.column = column;
      console.log(column)
  };

  CurrentState = function(){
      //get a string representation of the objects in the 3x3 square in front of the agent
      var state = "S";
      var line, column;
      for (var dline = -3; dline < 0 ; dline++){
        for (var dcol = -1; dcol <= 1 ; dcol++){
              line = (robot.line + dline + height) % height;
              column = (robot.column + dcol + width) % width;
              state += board[line][column];
          }
      }
      return state;
  };



 function drawCircle() {
  var currentState = CurrentState();
    moveCircle()
    var randomAction = AIrandomAction()
    var action = learner.bestAction(currentState);
    //if there is no best action try to explore
    if (action===null || action === undefined || (!learner.knowsAction(currentState, randomAction) && Math.random()<exploration)){
        action = randomAction;
    }
    //action is a number -1,0,+1
    //apply the action
    robotsetPosition(robot.column + Number(action));
    reward = 0;
    moveRobot()
    hasRobotTouched() // reward is defined here;
    var nextState = CurrentState();
    //console.log(currentState, nextState, reward, action);
    learner.add(currentState, nextState, reward, action);
    learner.learn(10);
    var totalCollected = foodCount + poisonCount;
    var poisonRatio = (poisonCount / totalCollected) * 100;
    document.getElementById("scorecount").innerHTML = score;
    document.getElementById("foodcount").innerHTML = foodCount;
    document.getElementById("poisoncount").innerHTML = poisonCount;
    document.getElementById("percentcount").innerHTML = poisonRatio
    endofCanvas();
  //requestAnimationFrame(drawCircle);
 }

 myStartFunction = function() {  // redo every 200ms
  redrawInterval = setInterval(function() {
   drawCircle();
  }, 200); 
 }
 myStartFunction();

 function fast(){  // redo every 1ms
  redrawInterval2 = setInterval(function() {
   drawCircle();
  }, 1); 
 }

 myStopFunction = function() {
     clearInterval(redrawInterval);
     clearInterval(redrawInterval2);
 }


