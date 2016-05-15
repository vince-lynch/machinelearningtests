var canvas = document.getElementById('canvas');
 var context = canvas.getContext('2d');

 circles = [{X:  50, Y: 0, color: 'grey', col: 0, row: 0},{X:  100, Y: 0, color: 'grey', col: 8, row: 0},{X:  140, Y: 0, color: 'grey', col: 2, row: 0}, {X:  170, Y: 0, color: 'green', col: 4, row: 0},{X:  200, Y: 0, color: 'green',col: 7, row: 0}];

 var requestAnimationFrame = window.requestAnimationFrame || 
                             window.mozRequestAnimationFrame || 
                             window.webkitRequestAnimationFrame || 
                             window.msRequestAnimationFrame;

  robot = {column: 5, line: 9}

  score = 0;
  poison = -1
  food = 1
  foodCount = 0;
  poisonCount = 0;
  exploration = 0.2; // explore
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



 boardX = [0,0,0,0,0,0,0,0,0,0]


function AIrandomAction(){
        //actions are -1,0,+1
        return (Math.random() * 3) - 1;
}

/*function getBoardState(){
    circles.forEach(function(circle) {
    board[circle.row][circle.col] = 1;
    });
}*/



 function endofCanvas(){
  circles.forEach(function(circle) {
      if (circle.row == 9){ 
        circle.row = 0; // back into row ZERO
        boardX[circle.col] = 0; // clear previous pos
        startXranTEN = Math.floor(Math.random() * 10);
        if (circle.color == "green"){boardX[startXranTEN] = 2}
        if (circle.color == "grey"){boardX[startXranTEN] = 3}
        circle.col = startXranTEN;
        startX = (startXranTEN * 30);
          circle.Y = 0 //- startLocY;
          circle.X = startX + 15;
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
//      console.log("circle row is " + circle.row + "circle col is " + circle.col)
      board[circle.row][circle.col] = 0; // clear previous pos
         circle.Y = circle.Y + 30;
         //if (circle.row != 10) {
          circle.row++ 
         //} else {circle.row = 0}
         if (circle.color == "green"){board[circle.row][circle.col] = 2}// update board pos
         if (circle.color == "grey"){board[circle.row][circle.col] == 3}// update board pos
      //board[circle.row][circle.col] = 1; // update board pos
      //console.log(board)
     }); 
     circles.forEach(function(circle) {
        var xAxis = circle.col  * 30;
         makeShape(xAxis,circle.Y,circle.color)
     });
 }
 // Move Robot Circle
 function moveRobot(){
  var radius = 15;
  context.beginPath();
  // if robot off-screen
  if (robot.column < 0){
   robot.column = 9
   } 
  if (robot.column > 9){robot.column = 9
   robot.column = 0;
  }
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
     if(boardX[robot.column] == 2 && circle.col == robot.column && circle.row == 9){
            console.log("robot touched a food")
            score++;
            foodCount = foodCount +1;
            reward = 1;
        } 
        if(boardX[robot.column] == 3 && circle.col == robot.column && circle.row == 9){
             console.log("robot touched a poison")
             score = score -1;
             poisonCount = poisonCount +1;
             reward = -1;
           } 
   });
  }

function getCurrentState(){
  var state = "S";
  var line, column;
  for (var dcol = -1; dcol <= 1 ; dcol++){
      for (var dline = -3; dline < 0 ; dline++){
          line = (robot.line + dline + this.height) % this.height;
          column = (robot.column + dcol + this.width) % this.width;
          state += this.board[column][line];
      }
  }
  return state;
}

 function drawCircle() {
  var currentState = getCurrentState();
    moveCircle()
    var randomAction = AIrandomAction()
    var action = learner.bestAction(currentState);
    //if there is no best action try to explore
    if (action===null || action === undefined || (!learner.knowsAction(currentState, randomAction) && Math.random()<exploration)){
        action = randomAction;
    }
    //action is a number -1,0,+1
    action = Math.round(action);
    //apply the action
    robot.column = robot.column + action;
    reward = 0;
    moveRobot()
    hasRobotTouched() // reward is defined here;
    var nextState = getCurrentState();
    console.log(currentState, nextState, reward, action)
    learner.add(currentState, nextState, reward, action);
    //make que q-learning algorithm number of iterations=10 or it could be another number
    learner.learn(10);
    var totalCollected = foodCount + poisonCount;
    var poisonRatio = (poisonCount / totalCollected) * 100;
    document.getElementById("scorecount").innerHTML = score;
    document.getElementById("foodcount").innerHTML = foodCount;
    document.getElementById("poisoncount").innerHTML = poisonCount;
    document.getElementById("percentcount").innerHTML = poisonRatio
    endofCanvas();
    //console.log(reward)
  //requestAnimationFrame(drawCircle);
 }

 myStartFunction = function() {  // redo every 200ms
  redrawInterval = setInterval(function() {
   drawCircle();
  }, 200); 
 }
 myStartFunction();

 myStopFunction = function() {
     clearInterval(redrawInterval);
     clearInterval(redrawInterval2);
 }
 function fast(){  // redo every 1ms
  redrawInterval2 = setInterval(function() {
   drawCircle();
  }, 1); 
 }

