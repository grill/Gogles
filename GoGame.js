//black
var player1 = 1;

//white
var player2 = 2;

var size = 19;
var height = 10;
var width = 10;

//color constants
var black = "#000000";
var white = "#ffffff";
var brown = "#653700";

//Position of the cell which indicates the currently active player
var turnPosRow = 1;
var turnPosCol = size+2;

//Position of the points on the spreadshee
//[player 1, player 2]
var lostPosRow = [2, 3];
var lostPosCol = size+2;

//adds a menuitem to start a Go game
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("Games", [{name: "New Go Game", functionName: "start"}]);
}

//initializes the cells
function start() {
  var ss = SpreadsheetApp.getActiveSheet();
  ss.getRange(1, 1, size, size).clear();
  
  for(var row = 1; row <= size; row++) {
    ss.setRowHeight(row, size);
  }

  for(var col = 1; col <= size; col++) {
    ss.setColumnWidth(col, size);
  }
  
  ss.getRange(1, 1, size, size).setBorder(true,true,true,true,true,true);
  ss.getRange(1, 1, size, size).setBackgroundColor(brown);
  ss.getRange(1, 1, size, size).setFontColor(brown);

  ss.getRange(turnPosRow, turnPosCol).setValue(player1);
  
  ss.getRange(lostPosRow[0], lostPosCol).setValue("0");
  ss.getRange(lostPosRow[1], lostPosCol).setValue("0");
  
  colorPlayer();
}

//increases the count of lost pieces of a player by amount
function incLostPieces(amount, player) {
  var ss = SpreadsheetApp.getActiveSheet();
  var curPoints = ss.getRange(lostPosRow[player-1], lostPosCol).getValue();
  ss.getRange(lostPosRow[player-1], lostPosCol).setValue(curPoints+amount);
}

function onEdit() {
  var ss = SpreadsheetApp.getActiveSheet();
  var cell = ss.getActiveCell();
  var turn = ss.getRange(turnPosRow, turnPosCol);
  
  if(inField(cell.getRow(), cell.getColumn())) {
  
    //switch turns between the players
    cell.setValue(turn.getValue());
    if(turn.getValue() == player1)
      turn.setValue(player2);
    else
      turn.setValue(player1);
    colorPlayer();

    //looks for piece chains without liberties and removes them from the field
    checkCell(cell.getRow(), cell.getColumn());
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
function color() {
  //don't use this, too slow
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = 0;
  
  for(var row = 1; row <= size; row++) {
    for(var col = 1; col <= size; col++) {
      range = sheet.getRange(row,col);
      colorCell(row,col);
    }
  }
}

//colors in the active player indicator
function colorPlayer() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(turnPosRow,turnPosCol);
  if(range.getValue() == 1) {
    range.setFontColor(white);
    range.setBackgroundColor(black);
  } else if(range.getValue() == 2) {
    range.setFontColor(black);
    range.setBackgroundColor(white);
  }
}

//sets the color of the cell according to wether/which player's piece is placed there
function colorCell(row,col) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(row,col);
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

//checks the updated cell: sets the correct color and erases it if has no liberties
function checkCell(row,col) {
  var ns = neighbors(row,col);
  colorCell(row,col);
  for(var i = 0; i < ns.length; i++) {
    killIfNotFree(ns[i][0], ns[i][1]);
  }
  killIfNotFree(row,col);
}

//checks if the cluster of pieces around (row,col) has liberties and deletes them if they don't
function killIfNotFree(row,col) {
  var asdf = isFree(row,col);
  var free = asdf[0];
  var cells = asdf[1];
  var player = asdf[2];
  
  if(! free) {
    var sheet = SpreadsheetApp.getActiveSheet();
    
    incLostPieces(cells.length, player);
    
    for(var i = 0; i < cells.length; i++) {
      sheet.getRange(cells[i][0], cells[i][1]).clear();
      colorCell(cells[i][0], cells[i][1]);
    }
  }
}

//gets the color of the piece at (row,col)
function getColor(row,col) {
  var range = SpreadsheetApp.getActiveSheet().getRange(row,col);
  return range.getValue();
}

//checks if an array of length 2 arrays contains another length 2 array
function contains(arr, coord) {
  for(var i = 0; i < arr.length; i++) {
    if(arr[i][0] == coord[0] && arr[i][1] == coord[1])
      return true;
  }
  return false;
}

//checks if the cluster of pieces around (row,col) has liberties
function isFree(row,col) {
  if(isEmpty(row,col)) return [true, [], 0];
  
  var q = [];
  var free = false;
  var done = [];
  var i;
  var ns = [];
  
  var color = getColor(row,col);
  
  q.push([row,col]);
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
function neighbors(row,col) {
  var ret = [];
  if(inField(row+1, col)) ret.push([row+1,col]);
  if(inField(row, col+1)) ret.push([row,col+1]);
  if(inField(row-1, col)) ret.push([row-1,col]);
  if(inField(row, col-1)) ret.push([row,col-1]);
  return ret;
}

//checks wether (x,y) is inside the playing field
function inField(row,col) {
  if(row >= 1 && row <= size && col >= 1 && col <= size) {
    return true;
  }
  return false;
}