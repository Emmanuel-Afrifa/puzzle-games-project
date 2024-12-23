// Global variables 
let CANVAS = null; // Initializing the Canvas element
let CONTEXT = null; // Initializing the context
let SCALER =  0.7; 
let SIZE = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    row: 5,
    col: 5}
let PIECES = [];
PIECE_SELECTED = null;
// const RECT_START_X = window.innerWidth <= 460 ? window.innerWidth - window.innerWidth*0.15 : window.innerWidth * 0.8;
let RECT_START_X = null;


const img = new Image();
img.setAttribute('crossOrigin', 'anonymous')
img.src = "./pic.jpg";



window.addEventListener('load', onload);

function onload(){
    CANVAS = document.getElementById("rootCanvas");
    CONTEXT = CANVAS.getContext('2d');


    pieceMovements();

    resizeHandler();
    // Preserving aspect ratio of the image
    initializePieces(SIZE.row, SIZE.col);
    window.addEventListener('resize', resizeHandler);
    randomizePieces();
    updateCanvas();
}

function resizeHandler(){
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    let resize = SCALER*Math.min(
        window.innerWidth/img.width, 
        window.innerHeight/img.height);

    SIZE.width = resize*img.width;
    SIZE.height = resize*img.height;
    RECT_START_X = window.innerWidth - (SIZE.width/SIZE.row) - 20;

    SIZE.y = window.innerHeight/2 - SIZE.height/2;
    SIZE.x = (RECT_START_X - SIZE.width)/2;
    // SIZE.x = window.innerWidth/2 - SIZE.width/2;

    // RECT_START_X = window.innerWidth <= 460 ? window.innerWidth - (SIZE.width/SIZE.row) - 20 : window.innerWidth * 0.8;
    
    // updateCanvas();
}

function updateCanvas(){
    CONTEXT.clearRect(0,0, CANVAS.width, CANVAS.height);

    CONTEXT.globalAlpha = 0.3;
    CONTEXT.drawImage(img, SIZE.x, SIZE.y, SIZE.width, SIZE.height);

    // initializePieces(SIZE.row, SIZE.col); // This initializes the pieces array to enable use draw on the individual pieces

    CONTEXT.globalAlpha = 1;
    CONTEXT.fillStyle = "white"; 
    
    
    CONTEXT.fillRect(
        RECT_START_X, 
        window.innerHeight/window.innerHeight, 
        SIZE.x + SIZE.width + 0.1*SIZE.width, 
        CANVAS.height); 
    
    // randomizePieces(); // This function ensures the pieces are randomly scattered on the screen
    for (let i = 0; i<PIECES.length; i++){
        PIECES[i].draw(CONTEXT);
    }
}

// // Initializing the pieces array
function initializePieces(row, col){
    SIZE.row = row;
    SIZE.col = col;

    PIECES = [];
    for (let i = 0; i<row;i++){
        for (let j=0; j<col; j++){
            PIECES.push(new Piece(i,j));
        }
    }
}

function randomizePieces(){
    // CONTEXT.clearRect(0,0, CANVAS.width, CANVAS.height);

    const sideBarHeight = (SIZE.height/SIZE.row) * SIZE.row * SIZE.col + (15 * SIZE.row * SIZE.col)
    console.log(sideBarHeight);

    const yStarts = [15];
    for (let i = 0; i<PIECES.length-1; i++){
        let newEle = Math.floor(SIZE.height/SIZE.row + yStarts[yStarts.length - 1] + 15);
        yStarts.push(newEle)
    }

    console.log(yStarts);

    for (let i=0; i<PIECES.length; i++){
        const yIndex = Math.floor(Math.random() * yStarts.length);
        let loc = {
            x: RECT_START_X + 10,
            y: yStarts.splice(yIndex, 1)
        }
        PIECES[i].x = loc.x;
        PIECES[i].y = loc.y;
    }
}

function pieceMovements(){
    CANVAS.addEventListener('mousedown', mouseDownEvent);
    CANVAS.addEventListener('mousemove', mouseMoveEvent);
    CANVAS.addEventListener('mouseup', mouseUpEvent);
    CANVAS.addEventListener('touchstart', touchStartEvent);
    CANVAS.addEventListener('touchmove', touchMoveEvent);
    CANVAS.addEventListener('touchend', touchEndEvent);
}

function mouseDownEvent(event){
    PIECE_SELECTED = getPressedPiece(event);
    if (PIECE_SELECTED != null){
        const pieceIndex = PIECES.indexOf(PIECE_SELECTED);
        if (pieceIndex > -1){
            PIECES.splice(pieceIndex, 1);
            PIECES.push(PIECE_SELECTED);
        }
        PIECE_SELECTED.offset = {
            x: event.x - PIECE_SELECTED.x,
            y: event.y - PIECE_SELECTED.y
        }
    }
}

function mouseMoveEvent(event){
    if (PIECE_SELECTED != null){
        PIECE_SELECTED.x = event.x - PIECE_SELECTED.offset.x;
        PIECE_SELECTED.y = event.y - PIECE_SELECTED.offset.y;
    }
    updateCanvas();
}

function mouseUpEvent(){
    if (PIECE_SELECTED != null){
        if (PIECE_SELECTED.isClose()){
            PIECE_SELECTED.snapInPlace();
        }
    }
    updateCanvas();
    PIECE_SELECTED = null;
}

function touchStartEvent(event){
    let loc={x: event.touches[0].clientX, y: event.touches[0].clientY};
    mouseDownEvent(loc);
}

function touchMoveEvent(event){
    let loc={x: event.touches[0].clientX, y: event.touches[0].clientY};
    mouseMoveEvent(loc);
}

function touchEndEvent(){
    mouseUpEvent();
}


function getPressedPiece(location){
    // console.log(location.x)
    for (let i = PIECES.length-1; i>=0; i--){
        if ((location.x > PIECES[i].x && location.x < PIECES[i].x + PIECES[i].width) &&
            (location.y > PIECES[i].y && location.y < PIECES[i].y + PIECES[i].height)
        ){
            return PIECES[i]
        }
        
    }
    return null;
}

// // Defining the pieces class
class Piece{
    constructor(rowIndex, colIndex){
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.height = SIZE.height/SIZE.row;
        this.width = SIZE.width/SIZE.col;
        this.x = SIZE.x + this.width*this.colIndex;
        this.y = SIZE.y + this.height*this.rowIndex;
        this.correctX = this.x;
        this.correctY = this.y;
    }

    // Function to draw/cut pieces
    draw(context){
        context.beginPath();

        context.drawImage(img,
            this.colIndex*img.width/SIZE.col,
            this.rowIndex*img.height/SIZE.row,
            img.width/SIZE.col,
            img.height/SIZE.row,
            this.x,
            this.y,
            this.width,
            this.height
        );

        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }

    // Implementing the function that snaps the piece to its correct place if it's close enough
    isClose(){
        if (distance({
            x: this.x, y: this.y
        }, {x: this.correctX, y: this.correctY}) < this.width/3 )
        {
            return true;
        }
        return false;
    }
    snapInPlace(){
        this.x = this.correctX;
        this.y = this.correctY;
    }

}

function distance(point1, point2){
    return Math.sqrt(
        (point1.x - point2.x) * (point1.x - point2.x) + 
        (point1.y - point2.y) * (point1.y - point2.y)
    );
}