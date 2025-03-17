var elt = document.getElementById('calculator');
var calculator = Desmos.Calculator(elt);

var tileTypes = [[[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[0,-1],[1,0],[1,1]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[0,0],[0,1],[0,-1],[1,0]]]

var colorPalette = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#000000']

var activeTiles = []
var gameBoard = []
var piece_num = 0
var gameState = 'generate'
var gameOn = true

calculator.setExpression({
    id: 'b1',
    latex: 'y=0\\{0\\le x \\le 10\\}',
    color: '#000000'
})
calculator.setExpression({
    id: 'b2',
    latex: 'y=24\\{0\\le x \\le 10\\}',
    color: '#000000'
})
calculator.setExpression({
    id: 'b3',
    latex: 'x=0\\{0\\le y \\le 24\\}',
    color: '#000000'
})
calculator.setExpression({
    id: '41',
    latex: 'x=10\\{0\\le y \\le 24\\}',
    color: '#000000'
})


for(var i = 0; i < 24; i++){
    gameBoard[i] = [];
    for(var j = 0; j < 10; j++){
        gameBoard[i][j] = 0;
    }
}

function generatePiece(){
    var piece_type = tileTypes[Math.floor(Math.random() * 5)];
    var init_y = 23, init_x = 4;
    var color = colorPalette[Math.floor(Math.random() * 6)];
    for(var i = 0; i < 4; i++){
        activeTiles[i] = [init_x - piece_type[i][1], init_y - piece_type[i][0], [piece_num, i], color];
    }
    if(checkForCollision()){
        window.close()
    }
}

function shiftPiece(dir){
    for(var tile of activeTiles){
        const newX = dir[0] + tile[0];
        const newY = dir[1] + tile[1];
        if(newX < 0 || newX > 9 || newX < 0 || newY > 23 || 
            (gameBoard[newY][newX] != 0 && gameBoard[newY][newX][0][0] != tile[2][0])){
            return;
        }
    }

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

function checkForCollision(){
    for(var tile of activeTiles){
        var x = tile[0], y = tile[1], identity = tile[2][0];
        if(y == 0 || (gameBoard[y-1][x] != 0 && gameBoard[y-1][x][0][0] != identity)) return true;
    }
    return false;
}

function checkForLineClear(){
    var lineClears = [], rows = 0
    gameBoard.forEach(function(row, idx){
        var clearRow = true;
        for(var tile of row){
            if(tile == 0){
                clearRow = false;
                break;
            }
        }
        if(clearRow){
            lineClears[rows++] = idx;
        }
    });
}

function gameLoop(){
    if(gameState == 'generate'){
        piece_num++;
        activeTiles = []
        generatePiece()
        displayTiles()
        gameState = 'Falling'; 
    }
    if(gameState == 'Falling'){
        if(checkForCollision()){
            gameState = 'generate'
            checkForLineClear()
        }
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 40){
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

document.addEventListener('DOMContentLoaded', function(){
    gameLoop();
})
