# tetris
import numpy as np
from random import randint
import keyboard, os
from collections import defaultdict

gameBoard = np.zeros(shape=(24, 10))
for i in range(10): gameBoard[23][i] = 1
tileID = np.zeros(shape=(24,10)) # denotes which piece each tile originated from. 
tileTypes = [[(0,0),(0,1),(1,0),(1,1)],
             [(0,0),(0,1),(0,2),(0,3)],
             [(0,0),(0,-1),(1,0),(1,1)],
             [(0,0),(0,1),(0,2),(1,2)],
             [(0,0),(0,1),(0,-1),(1,0)]]

activePieces = [] # tuple of three numbers denoting the tile's x/y coordinates and ID. 
min_x = min_y = 1e9
max_x = max_y = 0
gameState = 'Generate'
num_tile = 0
gameOn = True

def generatePiece():
    global min_x, min_y, max_x, max_y, gameOn
    min_x = min_y = 1e9
    max_x = max_y = 0
    init_x, init_y = 0, 4
    tileLayout = tileTypes[randint(0, 4)]
    for tile in tileLayout: 
        activePieces.append([init_x + tile[0], init_y + tile[1], num_tile]) 
        min_x = min(min_x, init_x + tile[0])
        max_x = max(max_x, init_x + tile[0])
        min_y = min(min_y, init_y + tile[1])
        max_y = max(max_y, init_y + tile[1]) 
    
    if checkForCollision():
        gameOn = False

def shiftPieces(change):
    global min_x, min_y, max_x, max_y
    if change[1] == 1 and max_y == 9 or change[1] == -1 and min_y == 0: return False # out of bounds if we move any further. 
    for idx, (x, y, _) in enumerate(activePieces): 
        gameBoard[x][y] = 0
        tileID[x][y] = 0
        activePieces[idx][0] += change[0]
        activePieces[idx][1] += change[1]
        min_x = min(min_x, activePieces[idx][0])
        max_x = max(max_x, activePieces[idx][0])
        min_y = min(min_y, activePieces[idx][1])
        max_y = max(max_y, activePieces[idx][1]) 

def checkForCollision():
    if max_x == 23: return True
    for x, y, identity in activePieces: # under this circumstance no out of bounds error should occur. 
        if gameBoard[x+1][y] == 1 and tileID[x+1][y] != identity: 
            print(x+1, y)
            return True
    
    return False


def checkForLineClear():
    lineClears = []
    for i, row in enumerate(gameBoard):
        clearRow = True
        for tile in row: 
            if not tile: clearRow = False
        
        if clearRow: 
            lineClears.append(i)
            for j in range(10): 
                gameBoard[i][j] = 0 # if all tiles in this row are 1, clear it. 
                tileID[i][j] = 0

    
    lineClears = lineClears[::-1]
    remove = 0
    for i in range(23, -1, -1):
        # for each non-controlled tile, shift down until we neighbor the bottom of the grid or another tile. 
        if remove < len(lineClears) and i == lineClears[remove]: # two pointer
            remove += 1
            print(remove)
            # continue

        for j in range(10):
            if gameBoard[i][j]: 
                tmp = tileID[i][j]
                gameBoard[i][j] = 0
                tileID[i][j] = 0
                gameBoard[i+remove][j] = 1
                tileID[i+remove][j] = tmp
        

def fillBoard():
    for x, y, _ in activePieces: 
        gameBoard[x][y] = 1
        tileID[x][y] = _


pieceShift = defaultdict(lambda: (0,0))
pieceShift['s'] = (1,0)
pieceShift['d'] = (0,1)
pieceShift['a'] = (0,-1)

while gameOn:
    # key = keyboard.read_key()
    if gameState == 'Generate':
        min_x = min_y = 1e9
        max_x = max_y = 0
        num_tile += 1
        os.system('clear')
        activePieces.clear()
        generatePiece()
        fillBoard()
        print(gameBoard)
        gameState = 'Falling'
    
    elif gameState == 'Falling':
        control = input("Which way do you want to move?")
        shiftPieces(pieceShift[control])
        fillBoard()
        os.system('clear')
        print(gameBoard)
        
        if checkForCollision():
            gameState = 'Generate'
            checkForLineClear()
            
