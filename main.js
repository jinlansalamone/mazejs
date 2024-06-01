window.onload = function(){
    let canvas = document.querySelector('canvas');

    let options = {
        width: 20,
        height: 20,
        pathWidth: 30,
        wall: 4,
        outerWall: 4
    };

    let maze = new Maze(canvas, options);
    maze.draw();
    maze.playerStart(0,0, maze);

    window.onkeydown = e => {
        switch(e.code){
            case 'ArrowUp':
                maze.goUp();
                return;
            case 'ArrowRight':
                maze.goRight();
                return;
            case 'ArrowDown':
                maze.goDown();
                return;
            case 'ArrowLeft':
                maze.goLeft();
        }
    }
}
