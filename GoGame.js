//black
var player1 = 1;

//white
var player2 = 2;

var size    = 19;
var height  = 10;
var width   = 10;

//color constants
var black = "#000000";
var white = "#ffffff";
var brown = "#653700";

//Position of the cell which indicates the currently active player
var turnPosX = size+2;
var turnPosY = 1;

//Position of the points on the spreadshee
//[player 1, player 2]
var lostPosY = [2, 3];
var lostPosX = size+2;

//adds a menuitem to start a Go game
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("Games", [{name: "New Go Game", functionName: "start"}]);
}

//initializes the cells
function start() {
  var ss = SpreadsheetApp.getActiveSheet();
  ss.getRange(1, 1, size, size).clear();
  
  for(var x = 1; x <= size; x++) {
    ss.setRowHeight(x, size);
  }

  for(var y = 1; y <= size; y++) {
    ss.setColumnWidth(y, size);
  }
  
  ss.getRange(1, 1, size, size).setBorder(true,true,true,true,true,true);
  ss.getRange(1, 1, size, size).setBackgroundColor(brown);
  ss.getRange(1, 1, size, size).setFontColor(brown);
  
  ss.getRange(turnPosX, 1, size, lostPosY[1]+1).setFontSize(14);
  ss.getRange(turnPosX, 1, size, lostPosY[1]+1).setFontWeight("bold");

  ss.getRange(turnPosY, turnPosX).setValue(player1);
  
  ss.getRange(lostPosY[0], lostPosX).setValue("0");
  ss.getRange(lostPosY[1], lostPosX).setValue("0");
  
  funkifizePlayer();
}

//increases the count of lost pieces of a player by amount
function incLostPieces(amount, player) {
  var ss = SpreadsheetApp.getActiveSheet();
  var curPoints = ss.getRange(lostPosY[player-1], lostPosX).getValue();
  ss.getRange(lostPosY[player-1], lostPosX).setValue(curPoints+amount);
}

function onEdit() {
  var ss = SpreadsheetApp.getActiveSheet();
  var cell = ss.getActiveCell();
  var turn = ss.getRange(turnPosY, turnPosX);
  
  if(inField(cell.getRow(), cell.getColumn())) {
  
    //switch turns between the players
    cell.setValue(turn.getValue());
    if(turn.getValue() == player1)
      turn.setValue(player2);
    else
      turn.setValue(player1);
    funkifizePlayer();

    //looks for piece chains without liberties and removes them from the field
    checkStuff(cell.getRow(), cell.getColumn());
  }
}

//returns true if a cell contains a black piece, false otherwise
function isBlack(row, col) {
  var ss = SpreadsheetApp.getActiveSheet();
  return ss.getRange(row, col).getValue() == player1;
}

//returns true if a cell contains a white piece, false otherwise
function isWhite(row, col) {
  var ss = SpreadsheetApp.getActiveSheet();
  return ss.getRange(row, col).getValue() == player2;
}

//returns true if a cell doesn't contain a piece, false otherwise
function isEmpty(row, col) {
  var ss = SpreadsheetApp.getActiveSheet();
  return ss.getRange(row,col).getValue() != player1 &&
    ss.getRange(row, col).getValue() != player2;
}

//colors in the playing field
function funkifize() {
  //don't use this, too slow
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = 0;
  
  for(var x = 1; x <= size; x++) {
    for(var y = 1; y <= size; y++) {
      range = sheet.getRange(x,y);
      funkifizeCell(x,y);
    }
  }
}

//colors in the active player indicator
function funkifizePlayer() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(playercellY,playercellX);
  if(range.getValue() == 1) {
    range.setFontColor(white);
    range.setBackgroundColor(black);
  } else if(range.getValue() == 2) {
    range.setFontColor(black);
    range.setBackgroundColor(white);
  }
}

//sets the color of the cell according to wether/which player's piece is placed there
function funkifizeCell(x,y) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(x,y);
  var debug = range.getValue();
  
  if(range.getValue() == 1) {
    range.setFontColor(black);
    range.setBackgroundColor(black);
  } else if(range.getValue() == 2) {
    range.setFontColor(white);
    range.setBackgroundColor(white);
  } else {
    range.setFontColor(brown);
    range.setBackgroundColor(brown);
  }
}

//checks the updated cell and sets the color and erases it if has no liberties
function checkStuff(x,y) {
  var ns = neighbors(x,y);
  funkifizeCell(x,y);
  for(var i = 0; i < ns.length; i++) {
    killIfNotFree(ns[i][0], ns[i][1]);
  }
  killIfNotFree(x,y);
}

//checks if the cluster of pieces around (x,y) has liberties and deletes them if they don't
function killIfNotFree(x,y) {
  var asdf = isFree(x,y);
  var free = asdf[0];
  var cells = asdf[1];
  var player = asdf[2];
  
  if(! free) {
    var sheet = SpreadsheetApp.getActiveSheet();
    
    addPoints(cells.length, player);
    
    for(var i = 0; i < cells.length; i++) {
      sheet.getRange(cells[i][0], cells[i][1]).clear();
      funkifizeCell(cells[i][0], cells[i][1]);
    }
  }
}

//checks if the cluster of pieces around (x,y) has liberties
function isFree(x,y) {
  if(isEmpty(x,y)) return [true, [], 0];
  
  var q = [];
  var free = false;
  var done = [];
  var i;
  var ns = [];
  
  var color = getColor(x,y);
  
  q.push([x,y]);
  while(q.length > 0) {
    i = q.pop();
    done.push(i);
    ns = neighbors(i[0], i[1]);
    for(var n = 0; n < ns.length; n++) {
      if(isEmpty(ns[n][0], ns[n][1])) {
        free = true;
      } else if(color == getColor(ns[n][0],ns[n][1]) && (! contains(done, ns[n]))) {
        q.push(ns[n]);
      }
    }
  }
  return [free, done, color];
}

//gets the neighbors for the cell at (x,y)
function neighbors(x,y) {
  var ret = [];
  if(inField(x+1, y)) ret.push([x+1,y]);
  if(inField(x, y+1)) ret.push([x,y+1]);
  if(inField(x-1, y)) ret.push([x-1,y]);
  if(inField(x, y-1)) ret.push([x,y-1]);
  return ret;
}

//checks wether (x,y) is inside the playing field
function inField(x,y) {
  if(x >= 1 && x <= size && y >= 1 && y <= size) {
    return true;
  }
  return false;
}
