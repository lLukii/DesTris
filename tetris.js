var elt = document.getElementById('calculator');
var calculator = Desmos.Calculator(elt);

var tileTypes = [[[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[0,-1],[1,0],[1,1]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[0,0],[0,1],[0,-1],[1,0]]]

var colorPalette = ['#00ffff', '#ffff00', '#800080', '#00ff00', '#ff0000', '#0000ff', '#ff7f00']

var activeTiles = []
var gameBoard = []
var piece_num = 0
var gameState = 'generate'
var gameOn = true


for(var i = 0; i < 24; i++){
    gameBoard[i] = [];
    for(var j = 0; j < 10; j++){
        gameBoard[i][j] = 0;
    }
}

function generatePiece(){
    var piece_type = tileTypes[Math.floor(Math.random() * 4)];
    var init_y = 23, init_x = 4;
    var color = colorPalette[Math.floor(Math.random() * 6)];
    for(var i = 0; i < 4; i++){
        activeTiles[i] = [init_x - piece_type[i][1], init_y - piece_type[i][0], [piece_num, i], color];
    }
}

function shiftPiece(dir){
    for(var i = 0; i < activeTiles.length; i++){
        // calculator.removeExpression({id: activeTiles[i][2]})
        gameBoard[activeTiles[i][1]][activeTiles[i][0]] = 0 // always remember that gameBoard corresponds to y and x respectivley while active tiles is the other way around :skull:
        activeTiles[i][0] += dir[0];
        activeTiles[i][1] += dir[1];
    }
}

function displayTiles(){
    activeTiles.forEach(function(tile, _){
        gameBoard[tile[1]][tile[0]] = [tile[2], tile[3]]
    })
    for(var i = 0; i < 24; i++){
        for(var j = 0; j < 10; j++){
            if(gameBoard[i][j] != 0){
                calculator.setExpression({
                    id: gameBoard[i][j][0],
                    latex: '\\polygon(('+j+','+i+'),('+(j+1)+','+i+'),('+(j+1)+','+(i+1)+'),('+j+','+(i+1)+'))',
                    color: gameBoard[i][j][1]
                })
            }
        }
    }
}


document.addEventListener('DOMContentLoaded', function(){
    if(gameState == 'generate'){
        piece_num++;
        activeTiles = []
        generatePiece()
        displayTiles()
        gameState = 'Falling'; 
    }
    if(gameState == 'Falling'){

        document.addEventListener('keydown', function(event) {
            if(event.keyCode == 40){
                // down arrow
                event.preventDefault();
                shiftPiece([0, -1])
                displayTiles()
            }
            if(event.keyCode == 37){
                event.preventDefault();
                shiftPiece([-1, 0])
                displayTiles()
            }
            if(event.keyCode == 39){
                event.preventDefault();
                shiftPiece([1, 0])
                displayTiles()
            }
        });
    }
})