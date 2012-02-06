//black
var player1 = 1;

//white
var player2 = 2;

var size    = 19;
var height  = 10;
var width   = 10;

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

function funkifize() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = 0;
  
  for(var x = 1; x <= size; x++) {
    for(var y = 1; y <= size; y++) {
      range = sheet.getRange(x,y);
      funkifizeCell(x,y);
    }
  }
}

function funkifizePlayer() {
  funkifizeCell(turnPosX, turnPosY);
}

function funkifizeCell(x,y) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(x,y);
  var debug = range.getValue();
  
  if(range.getValue() == 1) {
    range.setFontColor(black);
    range.setBackgroundColor(black);
  }
  if(range.getValue() == 2) {
    range.setFontColor(white);
    range.setBackgroundColor(white);
  }
}

function checkStuff(x,y) {
  /*killIfNotFree(x,y);
  for(i in neighbors(x,y)) {
    killIfNotFree(i[0], i[1]);
  }*/
}

function killIfNotFree(x,y) {
  var asdf = isFree(x,y);
  var free = asdf[0];
  var cells = asdf[1];
  
  if(! free) {
    var sheet = SpreadsheetApp.getActiveSheet();
    
    for(i in cells) {
      sheet.getRange(i[0], i[1]).clear();
    }
  }
}

function testIsFree() {
  isFree(1,1);
}

function isFree(x,y) {
  if(isEmpty(x,y)) return true;//(true, []);
  
  var q = [];
  var free = false;
  var done = [];
  var i;
  
  var black = isBlack(x,y);
  
  q.push((x,y));
  while(q.length > 0) {
    i = q.pop();
    done.push(i);
    for(var n in neighbors(i[0], i[1])) {
      if(isEmpty(j[0], j[1])) {
        free = true;
      } else if(black == isBlack(x,y) && done.indexOf(j[0], j[1]) == -1) {
        q.push(j);
      }
    }
  }
  //return (free, done);
  return free;
}

function neighbors(x,y) {
  var ret = [];
  if(inField(x+1, y)) ret.push((x+1,y));
  if(inField(x, y+1)) ret.push((x,y+1));
  if(inField(x-1, y)) ret.push((x-1,y));
  if(inField(x, y-1)) ret.push((x,y-1));
  return ret;
}

function inField(x,y) {
  if(x >= 1 && x <= size && y >= 1 && y <= size) {
    return true;
  }
  return false;
}
