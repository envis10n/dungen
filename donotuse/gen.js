Math.Vector2D = {};
Math.Vector2D.Length = function(a, b){
    return Math.sqrt((Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)));
}
Math.Vector2D.To1D = function(x, y, width){
    return x + width * y;
}
Math.Vector2D.From1D = function(i, width){
    return {
        x: i % width,
        y: Math.floor(i / width)
    };
}

class Cell {
    constructor(index, pos){
        this.state = false;
        this.index = index;
        this.pos = pos;
    }
}

class CellularAutomata {
    constructor(opts = {width: 100, height: 100, startAlive: 0.8, deathLimit: 1, birthLimit: 3, overPop: 4, lifetime: 5}){
        opts = Object.assign({}, {width: 100, height: 100, startAlive: 0.8, deathLimit: 1, birthLimit: 3, overPop: 4, lifetime: 5}, opts);
        this.width = opts.width;
        this.height = opts.height;
        this.startAlive = opts.startAlive;
        this.deathLimit = opts.deathLimit;
        this.birthLimit = opts.birthLimit;
        this.overPop = opts.overPop;
        this.lifetime = opts.lifetime;
        this.map = new Array(this.width * this.height);
        this.init();
    }
    init(){
        for(var i = 0; i < this.width * this.height; i++){
            this.map[i] = new Cell(i, Math.Vector2D.From1D(i, this.width));
        }
        for(var i = 0; i < this.width * this.height; i++){
            if(Math.random() <= this.startAlive) this.map[i].state = true;
            if(this.map[i].state == true && Math.random() <= this.startAlive){
                this.bloom(i);
            }
        }
    }
    countAliveNeighbors(v){
        var c = 0;
        var pos = Math.Vector2D.From1D(v, this.width);
        var x = pos.x;
        var y = pos.y;
        for(var i = -1; i < 2; i++){
            for(var j = -1; j < 2; j++){
                var nx = x+i;
                var ny = y+j;
                if(i != 0 && j != 0){
                    if(nx < 0 || ny < 0 || nx >= this.width || ny >= this.height){
                        if(nx < 0) nx = this.width-1;
                        if(ny < 0) ny = this.height-1;
                        if(nx >= this.width) nx = 0;
                        if(ny >= this.height) ny = 0;
                    }
                    if(this.map[Math.Vector2D.To1D(nx, ny, this.width)].state == true){
                        c += 1;
                    }
                }
            }
        }
        return c;
    }
    GetTile(x, y){
        var i = Math.Vector2D.To1D(x, y, this.width);
        if(i >= this.map.length) i = 0;
        if(i < 0) i = this.map.length - 1;
        return this.map[i];
    }
    getNeighbors(v){
        var pos = Math.Vector2D.From1D(v, this.width);
        var x = pos.x;
        var y = pos.y;
        var t = [
            x+1 >= this.map.width ? undefined : this.map[Math.Vector2D.To1D(x+1, y, this.width)],
            x-1 < 0 ? undefined : this.map[Math.Vector2D.To1D(x-1, y, this.width)],
            y+1 >= this.map.height ? undefined : this.map[Math.Vector2D.To1D(x, y+1, this.width)],
            y-1 < 0 ? undefined : this.map[Math.Vector2D.To1D(x, y-1, this.width)],
        ];
        return t;
    }
    GetWalkableNeighbors(v){
        var neighbors = this.getNeighbors(v);
        return neighbors.filter(cell=>{
            if(cell)
                return cell.state == false;
            else return false;
        });
    }
    GetAlivePercent(){
        return this.map.filter(cell=>{
            return cell.state == true;
        }).length / this.map.length;
    }
    bloom(v){
        var pos = Math.Vector2D.From1D(v, this.width);
        var x = pos.x;
        var y = pos.y;
        this.map[v].state = true;
        for(var i = -1; i < 2; i++){
            for(var j = -1; j < 2; j++){
                var nx = x+i;
                var ny = y+j;
                if(i != 0 && j != 0){
                    if(nx < 0 || ny < 0 || nx >= this.width || ny >= this.height){
                        if(nx < 0) nx = this.width-1;
                        if(ny < 0) ny = this.height-1;
                        if(nx >= this.width) nx = 0;
                        if(ny >= this.height) ny = 0;
                    }
                    if(Math.random() <= 0.1) this.bloom(Math.Vector2D.To1D(nx, ny, this.width));
                }
            }
        }
    }
    simulate(rounds = 1){
        for(var r = 0; r < rounds; r++){
            var nMap = new Array(this.width * this.height).fill(new Cell(this.lifetime));
            for(var i = 0; i < this.width * this.height; i++){
                var nbs = this.countAliveNeighbors(i);
                nMap[i] = new Cell(i, Math.Vector2D.From1D(i, this.width));
                if(this.map[i].state == true && nbs < 2)
                {
                    nMap[i].state = false;
                }
                else if(this.map[i].state == true && nbs > 3)
                {
                    nMap[i].state = false;
                }
                else if(this.map[i].state == false && nbs == 3) nMap[i].state = true;
                else nMap[i] = this.map[i];
                //if(nMap[i].state == true && Math.random() <= 0.3) this.bloom(i);
            }
            this.map = nMap;
        }
    }
}

function Manhattan(pos, dest){
    return (Math.abs(pos.x - dest.x) + Math.abs(pos.y - dest.y));
}

class Character {
    constructor(){
        this.x = 0;
        this.y = 0;
        this.destination = {x: 0, y: 0};
        this.map = null;
        this.path = [];
        this.searched = [];
    }
    SetLocation(x, y){
        if(!this.map) return false;
        if(this.map.GetTile(x, y) && this.map.GetTile(x, y).state == false){
            this.x = x;
            this.y = y;
            return true;
        }
        else return false;
    }
    GeneratePath(){
        if(!this.map) return false;
        var open = [];
        var closed = [{i: Math.Vector2D.To1D(this.x, this.y, this.map.width), parent: null, g: 0, h: Manhattan({x: this.x, y: this.y}, this.destination), f: Manhattan({x: this.x, y: this.y}, this.destination)}];
        var effective = closed[0];
        var solved = false;
        var lowf = 100;
        var dest = Math.Vector2D.To1D(this.destination.x, this.destination.y, this.map.width);
        while(!solved){
            var av = this.map.GetWalkableNeighbors(effective.i);
            for(var i = 0; i < av.length;i++){
                var cell = av[i];
                if(!closed.find(el=>{
                    return el.i == cell.index;
                }))
                {
                    var op = open.find(el=>{
                        return el.i == cell.index;
                    });
                    var g = effective.g + 1;
                    var h = Manhattan(cell.pos, this.destination);
                    var f = g + h;
                    if(!op) open.push({i: cell.index, f: f, g: effective.g + 1, h: h, parent: Object.assign({}, effective)});
                    else
                    {
                        op.h = h;
                        op.g = effective.g + 1;
                        op.f = op.h+op.g;
                        op.parent = Object.assign({}, effective);
                    };
                }
            };
            if(open.length != 0)
            {
                if(open.find(el=>{
                    return el.i == dest;
                }))
                {
                    closed.push(open.find(el=>{
                        return el.i == dest;
                    }));
                    solved = true;
                }
                else
                {
                    var l = open.reduce((a, b)=>{
                        return a.f <= b.f ? a : b;
                    });
                    lowf = l;
                    var low = open.filter(el=>{
                        return el.f == l.f;
                    });
                    if(low.length > 1)
                    {
                        low = low.reduce((a,b)=>{
                            return a.g < b.g ? a : b;
                        });
                    }
                    else low = low[0];
                    effective = Object.assign({}, low);
                    closed.push(Object.assign({}, low));
                    open.splice(open.findIndex(el=>{
                        return el.i == low.i;
                    }), 1);
                }
            }
            else
            {
                solved = true;
            }
        }
        var b = closed.find(el=>{
            return el.i == dest;
        });
        var ret = [];
        while(b != null)
        {
            ret.push(b.i);
            b = b.parent;
        }
        return ret.reverse();
    }
    Pathfind(){
        if(!this.map) return false;
        this.path = this.GeneratePath();
    }
}