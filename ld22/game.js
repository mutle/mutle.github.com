(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.engine = null;

  $(document).ready(function() {
    var Character, Engine, Layer, Rect, Renderable, Scene, Sprite, Text, TilesLayer, Vector, mainScene, update, updateRate;
    Engine = (function() {

      function Engine() {
        this.screen = $('#screen').get(0);
        this.ctx = this.screen.getContext("2d");
        this.origw = this.w = this.screen.width;
        this.origh = this.h = this.screen.height;
        this.clearColor = '#000';
        this.ctx.fillStyle = this.clearColor;
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.running = true;
        this.lastMillis = this.milliseconds();
        this.resolution = 1;
        this.keyEvents = {};
        this.delta = 0;
        this.scene = null;
        window.document.addEventListener('keydown', function(event) {
          var char;
          char = String.fromCharCode(event.keyCode);
          window.engine.updateEvent(char, 'down');
          return false;
        });
        window.document.addEventListener('keyup', function(event) {
          var char;
          char = String.fromCharCode(event.keyCode);
          window.engine.updateEvent(char, 'up');
          return false;
        });
      }

      Engine.prototype.reset = function() {
        this.clearColor = '#000';
        this.ctx.fillStyle = this.clearColor;
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.running = true;
        this.lastMillis = this.milliseconds();
        this.keyEvents = {};
        this.delta = 0;
        return this.scene = null;
      };

      Engine.prototype.registerKeyEvent = function(key, callback) {
        return this.keyEvents[key] = {
          callback: callback,
          key: key,
          state: 'idle'
        };
      };

      Engine.prototype.updateEvent = function(key, state) {
        var event;
        event = this.keyEvents[key];
        if (event) event.state = state;
        event = this.keyEvents[''];
        if (event) return event.state = state;
      };

      Engine.prototype.handleEvent = function(event) {
        if (event.callback) event.callback(event.state === 'down');
        if (event.state === 'up') return event.state = 'idle';
      };

      Engine.prototype.keyDown = function(key) {
        var event;
        event = this.keyEvents[key];
        return event && event.state === 'down';
      };

      Engine.prototype.scale = function(factor) {
        this.resolution = factor;
        this.screen.width = this.origw * factor;
        this.screen.height = this.origh * factor;
        this.ctx = this.screen.getContext("2d");
        return this.ctx.scale(factor, factor);
      };

      Engine.prototype.setScene = function(scene) {
        if (this.scene) this.reset();
        return this.scene = scene;
      };

      Engine.prototype.update = function() {
        var event, key, _ref;
        if (!this.running) return;
        _ref = this.keyEvents;
        for (key in _ref) {
          event = _ref[key];
          if (event.state === 'idle') continue;
          this.handleEvent(event);
        }
        this.currentMillis = this.milliseconds();
        this.delta = (this.currentMillis - this.lastMillis) / 1000;
        this.ctx.fillStyle = this.clearColor;
        this.ctx.save();
        if (this.scene) this.scene.update(this.delta);
        this.ctx.fillRect(0, 0, this.w, this.h);
        if (this.scene) this.scene.draw(this);
        this.ctx.restore();
        this.lastMillis = this.currentMillis;
        return this.delta;
      };

      Engine.prototype.pause = function() {
        this.running = !this.running;
        return this.lastMillis = this.milliseconds();
      };

      Engine.prototype.fullscreen = function() {
        if (document.webkitIsFullScreen) {
          return $('#game').get(0).webkitCancelFullScreen();
        } else {
          return $('#game').get(0).webkitRequestFullScreen();
        }
      };

      Engine.prototype.translate = function(offset, rotate, flipH, flipV, caller, callback) {
        var angle;
        angle = rotate * Math.PI / 180;
        this.ctx.save();
        this.ctx.translate(offset.x, offset.y);
        this.ctx.rotate(angle);
        if (flipH) this.ctx.scale(-1, 1);
        callback.apply(caller);
        return this.ctx.restore();
      };

      Engine.prototype.drawImage = function(image, src, dst, rotate, center, flipH, flipV) {
        return this.translate(dst.pos, rotate, flipH, flipV, this, function() {
          return this.ctx.drawImage(image, src.pos.x, src.pos.y, src.size.x, src.size.y, -center.x, -center.y, dst.size.x, dst.size.y);
        });
      };

      Engine.prototype.measureText = function(text, color, font, align) {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        return this.ctx.measureText(text);
      };

      Engine.prototype.drawText = function(text, position, rotate, center, color, font, align) {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        return this.translate(position, rotate, false, false, this, function() {
          return this.ctx.fillText(text, -center.x, -center.y);
        });
      };

      Engine.prototype.milliseconds = function() {
        var d;
        d = new Date;
        return d.getTime();
      };

      return Engine;

    })();
    Rect = (function() {

      function Rect(x, y, w, h) {
        this.pos = new Vector(x, y);
        this.size = new Vector(w, h);
      }

      return Rect;

    })();
    Vector = (function() {

      function Vector(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (!this.z) this.z = 0;
      }

      Vector.prototype.add = function(v) {
        return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
      };

      Vector.prototype.sub = function(v) {
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
      };

      Vector.prototype.mult = function(a) {
        return new Vector(this.x * a, this.y * a, this.z * a);
      };

      Vector.prototype.div = function(a) {
        return new Vector(this.x / a, this.y / a, this.z / a);
      };

      return Vector;

    })();
    Renderable = (function() {

      function Renderable() {
        this.position = new Vector(0, 0, 0);
        this.rotate = 0;
        this.center = new Vector(0, 0);
      }

      return Renderable;

    })();
    Scene = (function() {

      __extends(Scene, Renderable);

      function Scene(callback) {
        Scene.__super__.constructor.call(this);
        this.layers = [];
        this.gameisover = false;
        this.engine = window.engine;
        this.engine.setScene(this);
        callback.apply(this);
      }

      Scene.prototype.addLayer = function(layer) {
        return this.layers.push(layer);
      };

      Scene.prototype.update = function(delta) {
        var layer, _i, _len, _ref, _results;
        if (this.updateCallback) this.updateCallback(delta);
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          if (!layer.static) layer.position = this.position;
          _results.push(layer.update(delta));
        }
        return _results;
      };

      Scene.prototype.draw = function(engine) {
        var layer, _i, _len, _ref, _results;
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          _results.push(layer.draw(engine));
        }
        return _results;
      };

      Scene.prototype.registerKeyEvent = function(key, callback) {
        return this.engine.registerKeyEvent(key, callback.bind(this));
      };

      return Scene;

    })();
    Layer = (function() {

      __extends(Layer, Renderable);

      function Layer() {
        Layer.__super__.constructor.call(this);
        this.objects = [];
        this.static = false;
      }

      Layer.prototype.sort = function() {
        return this.sortedObjects = _.sortBy(this.objects, function(o) {
          return o.position.z;
        });
      };

      Layer.prototype.update = function(delta) {
        var o, _i, _len, _ref, _results;
        this.sort();
        _ref = this.sortedObjects;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          _results.push(o.update(delta));
        }
        return _results;
      };

      Layer.prototype.draw = function(engine) {
        var o, _i, _len, _ref, _results;
        if (!this.sortedObjects) this.sort();
        _ref = this.sortedObjects;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          _results.push(engine.translate(this.position, this.rotate, false, false, this, function() {
            return o.draw(engine);
          }));
        }
        return _results;
      };

      Layer.prototype.add = function(object) {
        return this.objects.push(object);
      };

      return Layer;

    })();
    Text = (function() {

      __extends(Text, Renderable);

      function Text(text) {
        var width;
        this.text = text;
        Text.__super__.constructor.apply(this, arguments);
        this.color = '#fff';
        this.fontName = 'VT323';
        this.size = 30;
        this.setFont(this.size, this.fontName);
        this.align = 'left';
        width = engine.measureText(this.text, this.color, this.font, this.align).width;
        this.center = new Vector(width / 2, 0);
      }

      Text.prototype.update = function(delta) {
        if (this.updateCallback) return this.updateCallback(delta);
      };

      Text.prototype.draw = function(engine) {
        if (this.color === '') return;
        return engine.drawText(this.text, this.position, this.rotate, this.center, this.color, this.font, this.align);
      };

      Text.prototype.setFont = function(size, font) {
        this.size = size;
        if (font) this.fontName = font;
        return this.font = this.size + 'px ' + this.fontName;
      };

      Text.prototype.setAlign = function(horiz, vert) {
        if (horiz === 'left') {
          this.align = 'left';
          this.center.x = 0;
        } else if (horiz === 'center') {
          this.align = 'center';
          this.center.x = 0;
        } else if (horiz === 'right') {
          this.align = 'right';
          this.center.x = 0;
        }
        if (vert === 'top') {
          return this.center.y = -this.size / 2;
        } else if (vert === 'center') {
          return this.center.y = 0;
        }
      };

      return Text;

    })();
    Sprite = (function() {

      __extends(Sprite, Renderable);

      function Sprite(src, attrs) {
        var sprite;
        Sprite.__super__.constructor.apply(this, arguments);
        this.image = new Image;
        this.loaded = false;
        sprite = this;
        this.w = 0;
        this.h = 0;
        this.scale = 2;
        this.image.onload = function() {
          sprite.loaded = true;
          return sprite.setSize(this.width, this.height);
        };
        this.image.src = src;
        if (attrs) {
          this.sprites = new Vector(attrs.sprites[0], attrs.sprites[1]);
        } else {
          this.sprites = new Vector(1, 1);
        }
        this.frame = 0;
        this.setFPS(1);
        this.frameTime = 0;
        this.totalFrames = this.sprites.x * this.sprites.y;
        this.rotate = 0;
        this.animating = false;
        this.flipH = false;
        this.flipV = false;
      }

      Sprite.prototype.setFPS = function(fps) {
        return this.frameRate = 1 / fps;
      };

      Sprite.prototype.setSize = function(w, h) {
        this.w = w / this.sprites.x;
        this.h = h / this.sprites.y;
        if (!(this.center != null)) {
          this.center.x = this.w / 2 * this.scale;
          this.center.y = this.h / 2 * this.scale;
        }
        return this.updatePos();
      };

      Sprite.prototype.update = function(delta) {
        if (this.updateCallback != null) this.updateCallback(delta);
        this.nextFrame(delta);
        return this.updatePos();
      };

      Sprite.prototype.updatePos = function() {
        var frameX, frameY;
        frameX = this.frame % this.sprites.x;
        frameY = Math.floor(this.frame / this.sprites.x);
        this.src = new Rect(frameX * this.w, frameY * this.h, this.w, this.h);
        return this.dst = new Rect(this.position.x, this.position.y, this.w * this.scale, this.h * this.scale);
      };

      Sprite.prototype.draw = function(engine) {
        if (!this.loaded) return;
        return engine.drawImage(this.image, this.src, this.dst, this.rotate, this.center, this.flipH, this.flipV);
      };

      Sprite.prototype.nextFrame = function(delta) {
        if (!this.animating) return;
        this.frameTime += delta;
        if (this.frameTime > this.frameRate) {
          this.frameTime -= this.frameRate;
          this.frame++;
          if (this.frame >= this.totalFrames) return this.frame = 0;
        }
      };

      return Sprite;

    })();
    Character = (function() {

      __extends(Character, Sprite);

      function Character() {
        Character.__super__.constructor.call(this, "character.png", {
          sprites: [8, 2]
        });
        this.frames = {
          'front': [0],
          'left': [1],
          'right': [1]
        };
        this.jumpFrames = {
          'front': [8],
          'left': [9],
          'right': [9]
        };
        this.direction('front');
        this.jumping = false;
        this.center = new Vector(64, 102);
        this.gravity = 0;
        this.grounded = true;
        this.maxgravity = 600;
        this.gravitydecay = 600;
      }

      Character.prototype.jump = function(jumping) {
        if (jumping) {
          if (!this.grounded) return;
          if (!this.jumping) this.gravity += this.maxgravity;
        }
        if (this.gravity > this.maxgravity) this.gravity = this.maxgravity;
        this.jumping = jumping;
        if (this.jumping) return this.grounded = false;
      };

      Character.prototype.direction = function(dir) {
        this.dir = dir;
        this.flipH = this.dir === 'left';
        return this.frame = this.frames[this.dir][0];
      };

      Character.prototype.updateCallback = function(delta) {
        var h;
        if (this.gravity <= 0) {
          if (h = this.tiles.ground(this.position)) {
            if (!this.grounded) {
              this.grounded = true;
              this.direction('front');
              this.gravity = 0;
              engine.scene.setScore((h - 2) * 100);
            }
          } else {
            this.grounded = false;
          }
        }
        if (!this.grounded) {
          this.position.y -= this.gravity * delta;
          this.gravity -= this.gravitydecay * delta;
          return this.frame = this.jumpFrames[this.dir][0];
        } else {
          return this.frame = this.frames[this.dir][0];
        }
      };

      return Character;

    })();
    TilesLayer = (function() {

      __extends(TilesLayer, Layer);

      function TilesLayer() {
        TilesLayer.__super__.constructor.call(this);
        this.tileSize = 32;
        this.rows = {};
        this.offset = new Vector(0, 0);
        this.initialOffset = 13;
      }

      TilesLayer.prototype.addTileRow = function(tiles) {
        var offset, row, sprite, tile, x, y, _i, _len;
        y = 0;
        x = 0;
        offset = this.offset.mult(this.tileSize);
        row = [];
        for (_i = 0, _len = tiles.length; _i < _len; _i++) {
          tile = tiles[_i];
          if (tile >= 0) {
            sprite = this.sprite();
            sprite.tile = tile;
            sprite.frame = tile;
            sprite.scale = 1;
            sprite.position = new Vector(offset.x + x * this.tileSize, 480 - this.tileSize - (offset.y + y * this.tileSize));
            sprite.center = new Vector(0, 0);
            this.add(sprite);
            row.push(sprite);
          } else {
            row.push(null);
          }
          x++;
        }
        this.rows[this.offset.y] = row;
        return this.offset.y++;
      };

      TilesLayer.prototype.sprite = function() {
        var sprite;
        sprite = new Sprite("tiles.png", {
          sprites: [8, 4]
        });
        return sprite;
      };

      TilesLayer.prototype.lastRow = function() {
        return this.offset.y - 1;
      };

      TilesLayer.prototype.toTileCoords = function(position) {
        var local, tile;
        local = position.div(this.tileSize);
        return tile = new Vector(Math.floor(local.x), Math.floor(1 - local.y) + 1 + this.initialOffset);
      };

      TilesLayer.prototype.ground = function(position) {
        var cell, row, tile;
        tile = this.toTileCoords(position);
        if (row = this.rows[tile.y]) {
          if (cell = row[tile.x]) if (cell.tile >= 0) return tile.y + 1;
        }
        return 0;
      };

      return TilesLayer;

    })();
    window.engine = new Engine;
    window.engine.gameisover = false;
    updateRate = 1000 / 60;
    update = function() {
      var delta;
      delta = window.engine.update();
      return window.setTimeout(update, updateRate - (delta * 1000));
    };
    window.setTimeout(update, 1);
    mainScene = function() {
      return new Scene(function() {
        var borderDist, fps, i, n, scene, score, sprite;
        scene = this;
        this.backgroundLayer = new Layer;
        this.addLayer(this.backgroundLayer);
        this.tilesLayer = new TilesLayer;
        this.addLayer(this.tilesLayer);
        this.gameLayer = new Layer;
        this.addLayer(this.gameLayer);
        this.foregroundLayer = new Layer;
        this.foregroundLayer.static = true;
        this.addLayer(this.foregroundLayer);
        this.uiLayer = new Layer;
        this.uiLayer.static = true;
        this.addLayer(this.uiLayer);
        this.score = 0;
        this.scrollspeed = 20;
        this.setScore = function(score) {
          var oldscore;
          oldscore = Math.floor(this.score / 1000);
          this.score = score;
          if (Math.floor(this.score / 1000) > oldscore) {
            return this.scrollspeed += 5;
          }
        };
        this.updateCallback = function(delta) {
          var h, row, tile;
          this.position.y += this.scrollspeed * delta;
          h = this.character.position.y + this.position.y;
          tile = this.tilesLayer.toTileCoords(this.position.mult(-1));
          row = tile.y;
          if (row > this.tilesLayer.lastRow()) {
            this.tilesLayer.addTileRow(this.generateRow(this.tilesLayer.lastRow()));
          }
          if (h < 150) {
            if (h < 0) h = 0;
            this.position.y += (150 - h) * 4 * delta;
          }
          if (h > 490) return this.gameover();
        };
        this.gameover = function() {
          var text;
          if (this.gameisover) return;
          this.gameisover = true;
          text = new Text("GAME OVER!");
          text.setFont(100);
          text.setAlign('center', 'center');
          text.position = new Vector(320, 180);
          this.uiLayer.add(text);
          text.colors = ['#fff', '#f00', '#0f0', '#00f'];
          text.colorIndex = 0;
          text.updateCallback = function(delta) {
            var index;
            this.colorIndex += delta;
            index = Math.floor(this.colorIndex) % this.colors.length;
            return this.color = this.colors[index];
          };
          text = new Text("Your Score: " + this.score);
          text.setFont(60);
          text.setAlign('center', 'center');
          text.position = new Vector(320, 280);
          this.uiLayer.add(text);
          text = new Text("Press any key to retry.");
          text.setFont(40);
          text.setAlign('center', 'center');
          text.position = new Vector(320, 340);
          text.colors = ['#fff', ''];
          text.colorIndex = 0;
          text.updateCallback = function(delta) {
            var index;
            this.colorIndex += delta;
            index = Math.floor(this.colorIndex) % this.colors.length;
            return this.color = this.colors[index];
          };
          this.uiLayer.add(text);
          return this.registerKeyEvent('', function(down) {
            if (!down) return mainScene();
          });
        };
        this.character = new Character;
        this.character.tiles = this.tilesLayer;
        this.character.position = new Vector(340, 480 - 64);
        this.gameLayer.add(this.character);
        for (i = 0; i <= 18; i++) {
          sprite = this.tilesLayer.sprite();
          sprite.frame = 24;
          sprite.position = new Vector(i * this.tilesLayer.tileSize, 480 - 64);
          this.foregroundLayer.add(sprite);
        }
        score = new Text("Score: 0");
        score.setAlign('right', 'top');
        score.updateCallback = function(delta) {
          return score.text = "Score: " + scene.score;
        };
        score.position = new Vector(640 - 5, 0, 100);
        this.uiLayer.add(score);
        fps = new Text("");
        fps.frames = 0;
        fps.elapsed = 0;
        fps.setAlign('left', 'top');
        fps.updateCallback = function(delta) {
          var rate;
          fps.elapsed += delta;
          this.frames++;
          if (fps.elapsed > 1) {
            rate = this.frames / fps.elapsed;
            fps.elapsed -= 1;
            this.frames = 0;
            return this.text = rate.toFixed(0) + " FPS";
          }
        };
        fps.position = new Vector(5, 0, 100);
        this.uiLayer.add(fps);
        this.startRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.platformSize = function(n) {
          return 2 + Math.floor(Math.random() * 4);
        };
        this.hasPlatform = function(n) {
          if (n % 4 === 1) return true;
          return Math.floor(Math.random() * 3) === 1;
        };
        this.generateRow = function(n) {
          var i, pend, ps, pstart, row;
          if (n === 0) {
            return (function() {
              var _results;
              _results = [];
              for (i = 1; i <= 20; i++) {
                _results.push(8);
              }
              return _results;
            })();
          }
          if (n === 1) {
            return (function() {
              var _results;
              _results = [];
              for (i = 1; i <= 20; i++) {
                _results.push(0);
              }
              return _results;
            })();
          }
          if (n < 3) return [];
          row = (function() {
            var _results;
            _results = [];
            for (i = 1; i <= 20; i++) {
              _results.push(-1);
            }
            return _results;
          })();
          if (this.hasPlatform(n)) {
            ps = this.platformSize(n);
            pstart = Math.floor(Math.random() * 18);
            pend = pstart + ps;
            if (pend >= 20) pend = 19;
            for (i = pstart; pstart <= pend ? i <= pend : i >= pend; pstart <= pend ? i++ : i--) {
              row[i] = 0;
            }
          }
          return row;
        };
        n = 0;
        for (i = 1; i <= 15; i++) {
          this.tilesLayer.addTileRow(this.generateRow(n));
          n++;
        }
        borderDist = 10;
        this.movespeed = 200;
        this.registerKeyEvent('D', function(down) {
          if (down) {
            this.character.position.x += this.movespeed * this.engine.delta;
            if (this.character.position.x > 640 - borderDist) {
              this.character.position.x = 640 - borderDist;
            }
            return this.character.direction('right');
          }
        });
        this.registerKeyEvent('A', function(down) {
          if (down) {
            this.character.direction('left');
            this.character.position.x -= this.movespeed * this.engine.delta;
            if (this.character.position.x < borderDist) {
              return this.character.position.x = borderDist;
            }
          }
        });
        return this.registerKeyEvent('W', function(down) {
          if (down) {
            return this.character.jump(true);
          } else {
            return this.character.jump(false);
          }
        });
      });
    };
    mainScene();
    $("#fullscreen").click(function() {
      return window.engine.fullscreen();
    });
    $("#resolution").click(function() {
      if (window.engine.resolution > 1) {
        $(this).html("Double Size");
        return window.engine.scale(1);
      } else {
        $(this).html("Original Size");
        return window.engine.scale(2);
      }
    });
    return $("#pause").click(function() {
      window.engine.pause();
      if (window.engine.running) {
        return $("#pause").html("Pause");
      } else {
        return $("#pause").html("Resume");
      }
    });
  });

}).call(this);
