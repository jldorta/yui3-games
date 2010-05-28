/**
 * Copyright (c) 2010, Jorge Luis Dorta
 * All rights reserved.
 *
 * This work is licensed under the Creative Commons Attribution 2.5 License. To view a copy 
 * of this license, visit http://creativecommons.org/licenses/by/2.5/ or send a letter to 
 * Creative Commons, 543 Howard Street, 5th Floor, San Francisco, California, 94105, USA.
 *
 * This work was created by Jorge Luis Dorta (http://jldorta.co.cc/, jldorta@gmail.com).
 * 
 * The only attribution I require is to keep this notice of copyright & license 
 * in this original source file.
 *
 * Version 1.0 - 5.21.2010
 *
 */
YUI.add('snake', function (Y) {

    Y.SnakeGame = function SnakeGame ( config ) {
        Y.SnakeGame.superclass.constructor.apply(this, arguments);
        //SnakeGame.initializer (config);       
    }
    
    Y.SnakeGame.NAME = "snake"; // used as prefix for events
    Y.SnakeGame.ATTRS = { 
        div: { },
        velocity:  { value : 1 },
        direction: { value : 1 },
        remains: { value : 3 },
        from: { value : [0,5] },
        
        cols: { value : 16 },
        rows: { value : 12 }
    };
    
    var proto = {
        _snake: Array(),
        _grid: Array(),
        _pdirection: 0,
        _minX: 0,
        _minY: 0,
        _div: null,
        _velocity: 1,
        _eated: 0,
        _active: false,
        _aTimeout: null,
        _fTimeout: null,
        _config: null,
        
        _init: function(config) {
            var rows = this.get('rows'),
                cols = this.get('cols'),
                from = this.get('from'),
                direction = this.get('direction'),
                div = this.get('div');
            
            var SnakeGame = this;
            
            this.reset();
            this._velocity = 1;
            this._eated = 0,
            
            this._grid = Array(cols);
            for (i = 0; i < cols; i++) {
                this._grid[i] = Array(rows);
                for (j = 0; j < rows; j++)
                    this._grid[i][j] = 0;
            }
                
            this._grid[from[0],from[1]] = 1;
            
            this._div = Y.one(div);
            this._div.removeClass("dead_snake");
            this._div._node.innerHTML = "";
            this._snake = Array();
            
            head = {x: from[0],y: from[1],direction: direction,pdirection: direction};
            this._snake.push(head);
            
            clearTimeout(SnakeGame._atimeout);
            clearTimeout(SnakeGame._ftimeout);
        },
        newGame: function() {
            if (!this._active) {
                var SnakeGame = this;
                this._init();
                clearTimeout(SnakeGame._ftimeout);
                SnakeGame._ftimeout = setTimeout(function() {SnakeGame.newFruit();}, Math.random()*5000);
                this._active = true;
                this.act();
            } 
        },
        pauseGame: function() {
            var SnakeGame = this;
            if (SnakeGame._active) {
                SnakeGame._active = false;
                alert('Juego en Pausa');
                SnakeGame._active = true;    
            }
        },
        act: function() {
            var SnakeGame = this;
            if (this._active) {
                clearTimeout(SnakeGame._aTimeout);
                var direction = this.get('direction'),
                    head = null,
                    nhead = null,
                    x = 0,
                    y = 0;
                    
                head = this._snake[0];
                switch (direction) {
                    case 1 : x = 1;
                    break;
                    case 2 : y = 1;
                    break;
                    case 3 : x = -1
                    break;
                    case 4 : y = -1
                    break
                }
                head.direction = direction;
                nhead = {x: head.x+x,y: head.y+y,direction: direction,pdirection: head.direction};
                
                var validMove = this.validMove(nhead)
                if (validMove > 0) {
                    this.eat(nhead);
                    this.move(nhead, head);
                    this._velocity = Math.ceil((this._eated+1)/5)+1;
                    
                    this._aTimeout = setTimeout(function() {SnakeGame.act()}, Math.round(1000/SnakeGame._velocity));    
                } else {
                    this.kill(nhead, head, validMove);    
                }
            }
        },
        eat: function(head) {
            var remains = this.get('remains');
            if (this._grid[head.x][head.y] == 9) {
                this.set('remains', remains+4);
                this._grid[head.x][head.y] = 0;
                var fid = '#'+this.getBodyId(head);
                this._eated++;
                Y.one(fid).remove();
                SnakeGame = this;
                clearTimeout(SnakeGame._ftimeout);
                SnakeGame._ftimeout = setTimeout(function() {SnakeGame.newFruit();}, Math.random()*5000);
            }
            
        },
        move: function(nhead, head) {
            var direction = this.get('direction'),
                remains = this.get('remains'),
                tile = null,
                ntile = null;
                
            this._snake.unshift(nhead);
        
            if (remains--) {
                this.set('remains',remains);
            } else {
                tile = this._snake.pop();    
                ntile = this._snake[this._snake.length-1];
                this.printTile(ntile,tile);
                this._grid[ntile.x][ntile.y] = 3;
                this._grid[tile.x][tile.y] = 0;
            }
            this.printHead(nhead, head);
            this._grid[nhead.x][nhead.y] = 1;
            this._grid[head.x][head.y] = 2;
        },
        printHead: function(head, oldHead) {
            var hid = this.getBodyId(head);
            var node = new Y.Node.create('<div class="snake_part snake_head_'+head.direction+'">&nbsp;</div>').setXY([head.x*25,head.y*25]).set('id',hid);
            this._div.append(node);
            
            var oldhid = '#'+this.getBodyId(oldHead);
            if (Y.one(oldhid)) {
                Y.one(oldhid).replaceClass('snake_head_'+oldHead.direction,'snake_body_'+oldHead.direction+'_'+oldHead.pdirection);
            }
        },
        printTile: function(tile,oldTile) {
            var oldTid = '#'+this.getBodyId(oldTile);
            if(Y.one(oldTid)) {
                Y.one(oldTid).remove();
            }
            var tid = '#'+this.getBodyId(tile);
            Y.one(tid).replaceClass('snake_body_'+tile.direction+'_'+tile.pdirection,'snake_tail_'+tile.direction)
        },
        newFruit: function() {
            var rows = this.get('rows'),
                cols = this.get('cols'),
                fpos = 0,
                col = 5,
                row = 5,
                kind = 0;
                
            kind = Math.floor(Math.random()*3)+1;
                
            while(this._grid[col][row] != 0) {
                fpos = Math.floor(Math.random()*cols*rows);
                col = Math.floor(fpos/(cols));
                row = fpos%(cols);
            }
            
            this._grid[col][row] = 9;
            var fid = this.getBodyId({x: col, y: row});
            var node = new Y.Node.create('<div class="fruit fruit'+kind+'">&nbsp;</div>').setXY([col*25,row*25]).set('id',fid);
            this._div.append(node);
        },
        validMove: function(head) {
            var preHead = null,
                tail = null;

            preHead = (this._snake.length >= 2) ? this._snake[1] : {x: -1,y: -1};
            tail = (this._snake.length >= 2) ? this._snake[this._snake.length-1] : {x: -1,y: -1};
            //alert(head.x+' '+head.y+tail.x+' '+tail.y+' '+this._grid[head.x][head.y]);                
            
            if (head.x >= 0 && head.y >= 0 && head.x < this.get('cols') && head.y < this.get('rows')
                && this._grid[head.x][head.y] != 1 && this._grid[head.x][head.y] != 2
                && (this._grid[head.x][head.y] != 3 || (this._grid[head.x][head.y] == 3 && tail.x == head.x && tail.y == head.y)))
                return true;
            else if (preHead.x != head.x || preHead.y != head.y) {
                 //alert();
                return -1;
            }else
                return -2;                
        },
        kill: function(nhead, head, razon) {
            this._div.addClass('dead_snake');
            var hid = '#'+this.getBodyId(head);
            if (razon == -1) {
                this.printHead(nhead, head);
                Y.one(hid).replaceClass('snake_head_'+nhead.direction,'snake_head_dead_'+nhead.direction);
            } else {
                Y.one(hid).replaceClass('snake_head_'+head.direction,'snake_head_dead_'+head.direction);
            }
            //alert(hid);
            /*if (this._snake[1] != head)
                this.printHead(nhead, head);*/
            //alert('Juego Finalizado');
            this._active = false;
        },
        getBodyId: function(part) {
            return 'snake_body_'+part.x+'_'+part.y;
        },
        initializer : function( cfg ) {
            var SnakeGame = this;
            
            this._config = cfg; 
            
            Y.on("keydown", function (event) {
                switch (event.charCode) {
                    case 37: SnakeGame.set('direction',3);event.halt();
                    break;
                    case 38: SnakeGame.set('direction',4);event.halt();
                    break;
                    case 39: SnakeGame.set('direction',1);event.halt();
                    break;
                    case 40: SnakeGame.set('direction',2);event.halt();
                    break;
                    case 78: SnakeGame.newGame();event.halt();
                    break;
                    case 80: SnakeGame.pauseGame();event.halt();
                    break;
                    default: ;//SnakeGame.set('remains',30);
                }
            }, Y.one('document'));
            
            this._init(cfg);
        },
        destructor : function() { 
        }
    }
    
    Y.extend(Y.SnakeGame, Y.Base, proto);

}, '1.0.0', { requires: ['anim'] });
