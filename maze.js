class Maze {
    self = null;

    constructor(canvas, options){
        self = this;
        options = options || {};

        this.canvas = canvas;
        this.pathWidth = options.pathWidth || 20;           //Width of the Maze Path
        this.wall = options.wall || 2;                      //Width of the Walls between Paths
        this.outerWall = options.outerWall || 2;            //Width of the Outer most wall
        this.width = options.width || 30;                   //Number paths fitted horisontally
        this.height = options.height || 30;                 //Number paths fitted vertically
        this.x = options.x || this.width/2|0;               //Horisontal starting position
        this.y = options.y || this.height/2|0;              //Vertical starting position
        this.seed = options.seed || Math.random()*100000|0; //Seed for random numbers
        this.wallColor = options.wallColor || '#fff';       //Color of the walls
        this.pathColor = options.pathColor || '#222a33';    //Color of the path
        this.showGoal = options.showGoal === undefined ? true : options.showGoal;
        this.playerSize = this.pathWidth - 10;
        this.mazeDirs = [];

        for(let i=0; i<this.height; i++){
            this.mazeDirs[i] = [];
            for(let j=0; j<this.width; j++){
                this.mazeDirs[i][j] = new Set();
            }
        }
    }

    draw(){
        let offset = this.pathWidth/2 + this.outerWall;
        let map = [], x = this.x, y = this.y;
        let ctx = this.canvas.getContext('2d');
        this.canvas.width = this.outerWall * 2 + this.width * (this.pathWidth + this.wall) - this.wall;
        this.canvas.height = this.outerWall * 2 + this.height * (this.pathWidth + this.wall) - this.wall;
        ctx.fillStyle = this.wallColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = this.pathColor;
        ctx.lineCap = 'square';
        ctx.lineWidth = this.pathWidth;
        ctx.beginPath();

        for(var i=0; i<this.height*2; i++){
            map[i] = [];
            for(var j=0;j<this.width*2;j++){
                map[i][j] = false
            }
        }

        map[this.y*2][this.x*2] = true
        let route = [[x, y]]
        ctx.moveTo(x * (this.pathWidth + this.wall) + offset, y*(this.pathWidth + this.wall) + offset);
        loop(this);

        // draw end goal
        this.drawGoal();

        // draw ogre
        self.ogreX = (self.width/2)|0 + Math.floor(Math.random() * self.width/2);
        self.ogreY = (self.height/2)|0 + Math.floor(Math.random() * self.height/2);
        self.drawOgreAt(self.ogreY, self.ogreX);
        self.ogreInterval = setInterval(() => {
            let dirs = [...self.mazeDirs[self.ogreY][self.ogreX]];

            if(dirs.length > 1){
                if(self.ogreDir){
                    dirs = dirs.filter(x => {
                        return x !== ({'r':'l','l':'r','u':'d','d':'u'})[self.ogreDir];
                    });
                }

                self.ogreDir = dirs[Math.floor(Math.random()*dirs.length)];
            } else {
                self.ogreDir = dirs[0];
            }

            self.eraseSpriteAt(self.ogreY, self.ogreX);

            switch(self.ogreDir){
                case 'u':
                    self.ogreY -= 1;
                    break;
                case 'd':
                    self.ogreY += 1;
                    break;
                case 'l':
                    self.ogreX -= 1;
                    break;
                case 'r':
                    self.ogreX += 1;
                    break;
            }

            self.drawOgreAt(self.ogreY, self.ogreX);
            if (self.playerX === self.ogreX && self.playerY === self.ogreY) {
                alert('caught by the ogre!');
                clearInterval(self.ogreInterval);
                self.ogreInterval = null;
            }
        }, 500);

        // draw maze
        function loop(self){
            x = route[route.length-1][0]|0
            y = route[route.length-1][1]|0


            let directions = [[1,0],[-1,0],[0,1],[0,-1]];
            let alternatives = []

            directions.forEach(dir => {
                if(map[(dir[1]+y)*2]==undefined){
                    return;
                }

                // if moving in this direction would cause us to move off of the map, return
                if((x+dir[0] < 0) || (x+dir[0] > self.width+1) || (y+dir[1] < 0) || (y+dir[1] > self.height+1)){
                    return;
                }

                if(map[(dir[1]+y)*2][(dir[0]+x)*2] === false){
                    alternatives.push(dir);
                }
            });

            // we are at a dead end so we need to backtrack
            if(alternatives.length === 0){
                route.pop();
                if(route.length > 0){
                    let moveX = route[route.length-1][0]*(self.pathWidth+self.wall)+offset;
                    let moveY = route[route.length-1][1]*(self.pathWidth+self.wall)+offset;
                    ctx.moveTo(moveX,moveY);
                    loop(self);
                }

                return;
            }

            let idx = Math.random()*alternatives.length|0;
            let direction = alternatives[idx];
            let temp = {'1,0':'r', '-1,0':'l', '0,1':'d', '0,-1':'u'};
            temp = temp[direction.toString()];

            try{
                // add the path from the current square to the next square
                self.mazeDirs[y][x].add(temp);

                // add the path from the next square to the current square
                self.mazeDirs[direction[1]+y][direction[0]+x].add(({'r':'l','l':'r','u':'d','d':'u'})[temp]);
            } catch(e){
                console.log(e);
            }

            route.push([direction[0]+x,direction[1]+y]);
            ctx.lineTo((direction[0]+x)*(self.pathWidth+self.wall)+offset, (direction[1]+y)*(self.pathWidth+self.wall)+offset);
            map[(direction[1]+y)*2][(direction[0]+x)*2] = true;
            map[direction[1]+y*2][direction[0]+x*2] = true;
            ctx.stroke();
            loop(self);
        }
    }

    goUp(){
        if(self.playerY === 0) return;
        if(!self.mazeDirs[self.playerY][self.playerX].has('u')) return;
        self.eraseSpriteAt(self.playerY, self.playerX);
        self.playerY--;
        self.drawPlayerAt(self.playerY, self.playerX);
        self.checkVictory();
    }

    goRight(){
        if(self.playerX === self.width-1) return;
        if(!self.mazeDirs[self.playerY][self.playerX].has('r')) return;
        self.eraseSpriteAt(self.playerY, self.playerX);
        self.playerX++;
        self.drawPlayerAt(self.playerY, self.playerX);
        self.checkVictory();
    }

    goDown(){
        if(self.playerY === self.height-1) return;
        if(!self.mazeDirs[self.playerY][self.playerX].has('d')) return;
        self.eraseSpriteAt(self.playerY, self.playerX);
        self.playerY++;
        self.drawPlayerAt(self.playerY, self.playerX);
        self.checkVictory();
    }

    goLeft(){
        if(self.playerX === 0) return;
        if(!self.mazeDirs[self.playerY][self.playerX].has('l')) return;
        self.eraseSpriteAt(self.playerY, self.playerX);
        self.playerX--;
        self.drawPlayerAt(self.playerY, self.playerX);
        self.checkVictory();
    }

    eraseSpriteAt(y, x){
        let ctx = this.canvas.getContext('2d');
        let drawX = x * (self.pathWidth + self.wall) + self.outerWall + 5;
        let drawY = y * (self.pathWidth + self.wall) + self.outerWall + 5;
        ctx.fillStyle = self.pathColor;
        ctx.fillRect(drawX, drawY, self.playerSize, self.playerSize);
        if (x === self.width - 1 && y === self.height - 1) {
          this.drawGoal();
        }
    }

    drawPlayerAt(y, x){
        let drawX = x * (self.pathWidth + self.wall) + self.outerWall + 5;
        let drawY = y * (self.pathWidth + self.wall) + self.outerWall + 5;
        let ctx = this.canvas.getContext('2d');
        let r = self.playerSize / 2;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(drawX + r, drawY + r, r, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGoal() {
      let ctx = this.canvas.getContext('2d');
      ctx.fillStyle = '#39c37f';
      let drawX = (this.width - 1) * (this.pathWidth + this.wall) + this.outerWall + 5;
      let drawY = (this.height - 1) * (this.pathWidth + this.wall) + this.outerWall + 5;
      ctx.fillRect(drawX, drawY, this.playerSize, this.playerSize);
    }

    drawOgreAt(y, x){
        let drawX = x * (self.pathWidth + self.wall) + self.outerWall + 5;
        let drawY = y * (self.pathWidth + self.wall) + self.outerWall + 5;
        let ctx = this.canvas.getContext('2d');
        let r = self.playerSize / 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(drawX + r, drawY + r, r, 0, Math.PI * 2);
        ctx.fill();
    }

    playerStart(y, x){
        self.playerY = y;
        self.playerX = x;

        self.drawPlayerAt(y, x);
    }

    checkVictory(){
        if(self.playerX === self.width - 1 && self.playerY === self.height-1){
            alert('you win!')
        }
    }
}
