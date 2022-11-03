//-------------------FUNCTII AJUTATOARE-----------------------

function _(elmnt){return document.getElementById(elmnt)}
function getStyle(elmnt){return getComputedStyle(_(elmnt))}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function drawLine(xFrom,yFrom,xTo,yTo,width,color){
    ctx.globalAlpha =1;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(xFrom, yFrom);
    ctx.lineTo(xTo,yTo)
    ctx.stroke();
}

//-------------------VARIABILELE SI CONSTANTE GLOBALE -----------------------

const canvas = _('canvas');
const ctx = canvas.getContext("2d");

let game=null;
let myTimer;
let level;

const dim={
    snake : 25,
    border : 10,
    buttonWidth : 180,
    nRows : null,
    nColumns : null,
}

const key={
    arrow:{
        up : 38,
        down : 40,
        left : 37,
        right : 39,
    },
    w : 87,
    a : 65,
    s : 83,
    d : 68, 
}

let Snake={
    size : 3,
    coord : {
        x : 4,
        y : 4, 
    },
    direction : 'down', 
}

const Mancare = -1;
const border = -2;
const snakeLovit = -3;
const imgMancare = new Image(); 
const imgSnakeHead = new Image();
const imgSnakeBody = new Image();
imgMancare.src = 'img/Mancare.png';
imgSnakeHead.src = 'img/SnakeHead2.png';
imgSnakeBody.src = 'img/SnakeBody.png';

//------------FUNCTII PENTRU CREAREA MENIULUI JOCULUI----------------------

function TextMenu(){
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "bold 70px Arial";
    ctx.fillText("Snake Game", (canvas.width / 2)  , (canvas.height / 2)-110);
    ctx.font = "bold 50px Arial";
    ctx.fillText("Choose level", (canvas.width / 2)  , (canvas.height / 2)-40);
}
function CreateBorders(){
    drawLine(0,0,0,canvas.height,dim.border,'black');
    drawLine(0,0,canvas.width,0,dim.border,'black');
    drawLine(canvas.width,0,canvas.width,canvas.height,dim.border,'black');
    drawLine(0,canvas.height,canvas.width,canvas.height,dim.border,'black');
}
function CreateLevelButtons(){
    let string='';
    string = `<button id="btn-1" onclick=LevelButton(${1})>SLUG</button>`;
    string +=  `<button id="btn-2" onclick=LevelButton(${2})>WORM</button>`;
    string +=  `<button id="btn-3" onclick=LevelButton(${3})>PHYTON</button>`;

    _('body').insertAdjacentHTML('beforeend',string);

    PlaceLevelButtons();
}

function PlaceLevelButtons(){
    _('btn-2').style.left = `${Math.floor((50*window.innerWidth)/100)}px`;
    _('btn-1').style.left = `${Math.floor((50*window.innerWidth)/100)-dim.buttonWidth}px` 
    _('btn-3').style.left = `${Math.floor((50*window.innerWidth)/100)+dim.buttonWidth}px`;
}

function CreateMenu(){
    TextMenu();
    CreateBorders();
    CreateLevelButtons();
}

//-------------------CREAREA JOCULUI-----------------------

class SnakeGame{

    M = [];

    constructor(LVL){
        //SE STERGE MENIUL

        this.#InitializareaMatricei();

        if(_('btn-1')!=null) _('btn-1').parentNode.removeChild( _('btn-1'));
        if(_('btn-2')!=null) _('btn-2').parentNode.removeChild( _('btn-2'));
        if(_('btn-3')!=null) _('btn-3').parentNode.removeChild( _('btn-3'));
    
        ctx.clearRect(0,0,canvas.width,canvas.height);
        CreateBorders();

        let speed;
        switch(LVL){
            case 'SLUG'   : speed = 140;
                break;
            case 'WORM'   : speed = 100;
                break;
            case 'PHYTON' : speed = 60;
                break;
        }

        myTimer=setInterval(()=>
        {   
            ctx.clearRect(dim.border-5, dim.border-5, canvas.width-2*dim.border+10, canvas.height-2*dim.border+10);
            game.#MiscareaSnake();
        },speed);

    }

    #InitializareaMatricei(){

        dim.nRows = Math.floor((canvas.height-dim.border)/dim.snake);
        dim.nColumns = Math.floor((canvas.width-dim.border)/dim.snake);

        for(let i=0; i<=dim.nRows+1; i++){
            this.M[i] = [];
        }

        for(let i=0; i<=dim.nRows+1; i++){
            for(let j=0; j<=dim.nColumns+1; j++){
                
                if(j==0 || i==0)this.M[i][j]= border;
                else if(i==dim.nRows+1 || j==dim.nColumns+1)this.M[i][j]= border;
                else this.M[i][j] = 0;
            }
        }

        Snake.size = 3;
        Snake.coord.x = Snake.coord.y = 4;
        Snake.direction = 'down';

       // console.log(this.M[dim.nRows][dim.nColumns])

        for(let i=0; i<Snake.size; i++){
            this.M[4-i][4] = Snake.size-i;
        }

        this.#putFood();

    }

    #putFood(){
        do{
            var xMancare = getRndInteger(1,dim.nColumns);
            var yMancare = getRndInteger(1,dim.nRows);
        }while(this.M[yMancare][xMancare]!=0)

        this.M[yMancare][xMancare] = Mancare;
    }


    #AfisareaMatricei(){

        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "white";

        for(let i=1; i<=dim.nRows; i++){
            for(let j=1; j<=dim.nColumns; j++){
                if(this.M[i][j]==Mancare) {
                    //ctx.fillStyle = "red";
                    ctx.drawImage(imgMancare,dim.border + (j-1)*dim.snake,dim.border + (i-1)*dim.snake)
                }
                else if(this.M[i][j]==snakeLovit) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(dim.border + (j-1)*dim.snake,dim.border + (i-1)*dim.snake,dim.snake,dim.snake);
                    ctx.rect(dim.border + (j-1)*dim.snake,dim.border + (i-1)*dim.snake,dim.snake,dim.snake)
                    ctx.stroke();
                }
                else if(this.M[i][j]!=0){
                    ctx.fillStyle = "black";
                    ctx.fillRect(dim.border + (j-1)*dim.snake,dim.border + (i-1)*dim.snake,dim.snake,dim.snake);
                    //CREAZA BORDURA ALBA
                    ctx.rect(dim.border + (j-1)*dim.snake,dim.border + (i-1)*dim.snake,dim.snake,dim.snake)
                    ctx.stroke();
                }
            }
        }
    }

    #MiscareaSnake(){
 
        let s ="";
        var xIndex=0, yIndex=0;

        switch(Snake.direction){
            case 'left':
                xIndex = -1;
            break;
            case 'right':
                xIndex = 1;
            break;
            case 'up':
                yIndex = -1;
            break;
            case 'down':
                yIndex = 1;
            break;
        }

        if((this.M[Snake.coord.y+yIndex][Snake.coord.x+xIndex]==border)
            ||(this.M[Snake.coord.y+yIndex][Snake.coord.x+xIndex]>0)){
                this.#gameOver();
            return;
        }
        
        if(this.M[Snake.coord.y+yIndex][Snake.coord.x+xIndex]==Mancare){
            Snake.size++;
            this.#putFood();
        }
        else{
            this.#Algoritm(Snake.coord.y,Snake.coord.x);
        }
        
        Snake.coord.y += yIndex;
        Snake.coord.x += xIndex;
        this.M[Snake.coord.y][Snake.coord.x]=Snake.size;
        
        /*
        for(let i=1; i<=dim.nRows; i++){
            for(let j=1; j<=dim.nColumns; j++){
                s+= this.M[i][j] + ' ';
            }
            s+='\n';
        }
        console.log(s)
        */
        //clearInterval(myTimer);
        this.#AfisareaMatricei();
    }



    #Algoritm(x,y){

        if(this.M[x][y]==1){this.M[x][y]--; return;}
        else{
            let prev = this.M[x][y]-1;
            if     (this.M[x-1][y]==prev){this.M[x][y]--;this.#Algoritm(x-1,y);}
            else if(this.M[x+1][y]==prev){this.M[x][y]--;this.#Algoritm(x+1,y);}
            else if(this.M[x][y-1]==prev){this.M[x][y]--;this.#Algoritm(x,y-1);}
            else if(this.M[x][y+1]==prev){this.M[x][y]--;this.#Algoritm(x,y+1);}
        }

    }

    #gameOver(){
        clearInterval(myTimer);
        this.Over = true;

        this.M[Snake.coord.y][Snake.coord.x]=snakeLovit;
        this.#AfisareaMatricei();
        
        // Face background ul grey transparent
        ctx.globalAlpha = 0.2;
        ctx.fillStyle ='grey'
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalAlpha = 0.8;
        ctx.textAlign = "center";
        ctx.font = "bold 90px Arial";
        ctx.fillStyle = 'red'
        ctx.fillText("GAME OVER", (canvas.width / 2)  , (canvas.height / 2)-30);

        let string;
        //string=`<button id="btn-restartGame"  style="left:50%; top:52%; font: bold 40px Arial; " width:80px height:40px >Restart</button>\n`;
        //string+=`<button id="btn-backToMenu"  style="left:50%; top:60%; font: bold 40px Arial; " width:80px height:40px >Back To Menu</button>`;
        
        string=`<button id="btn-restartGame" width:80px height:40px onclick=restartGame(); >Restart</button>\n`;
        string+=`<button id="btn-backToMenu" width:80px height:40px onclick=backToMenu(); >Back To Menu</button>`;
       
        _('body').insertAdjacentHTML('beforeend',string)
    
    }

}

//-------------------EVENIMENTE----------------------

window.onload = ()=>{

    base_image = new Image();
    base_image.src = 'img/Mancare.png';
    base_image.onload = () => 

    CreateMenu();
}

window.onresize = ()=>{
    PlaceLevelButtons();
}

window.onkeydown = (e)=>{

    let Key = e.keyCode;

    let i = Snake.coord.y;
    let j = Snake.coord.x; 

    if((Key==key.arrow.left || Key==key.a) && (game.M[i][j-1]<=0))Snake.direction = 'left';
    else if((Key==key.arrow.right || Key==key.d) && (game.M[i][j+1]<=0))Snake.direction = 'right';
    else if((Key==key.arrow.up || Key==key.w) && (game.M[i-1][j]<=0))Snake.direction = 'up';
    else if((Key==key.arrow.down || Key==key.s) && (game.M[i+1][j]<=0))Snake.direction = 'down';

}

function LevelButton(btn){
    switch(btn){
        case 1 : game = new SnakeGame('SLUG'); level='SLUG';
            break;
        case 2 : game = new SnakeGame('WORM'); level='WORM';
            break;
        case 3 : game = new SnakeGame('PHYTON'); level='PHYTON';
            break;
    }
}

function restartGame(){
    game = null;
    ctx.globalAlpha=1;
    
    _('btn-restartGame').parentNode.removeChild( _('btn-restartGame'));
    _('btn-backToMenu').parentNode.removeChild( _('btn-backToMenu'));

    game = new SnakeGame(level);

    /*
    let s='';
    for(let i=1; i<=dim.nRows; i++){
        for(let j=1; j<=dim.nColumns; j++){
            s+= game.M[i][j] + ' ';
        }
        s+='\n';
    }
    console.log(s)
    */
}

function backToMenu(){
    game = null;
    ctx.globalAlpha=1;
    
    _('btn-restartGame').parentNode.removeChild( _('btn-restartGame'));
    _('btn-backToMenu').parentNode.removeChild( _('btn-backToMenu'));

    ctx.clearRect(0,0,canvas.width,canvas.height);

    CreateMenu();

}




