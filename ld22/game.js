(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.engine = null;

  $(document).ready(function() {
    var Engine, Rect, Renderable, Sprite, Text, Vector, fps, sprite, sprite2, update, updateRate;
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
        this.objects = [];
        this.lastMillis = this.milliseconds();
        this.resolution = 1;
        this.keyEvents = {};
        window.document.addEventListener('keydown', function(event) {
          var char, e;
          char = String.fromCharCode(event.keyCode);
          window.console.log(char);
          e = window.engine.keyEvents[char];
          if (e) e.state = 'down';
          return false;
        });
        window.document.addEventListener('keyup', function(event) {
          var char, e;
          char = String.fromCharCode(event.keyCode);
          window.console.log(char);
          e = window.engine.keyEvents[char];
          if (e) e.state = 'up';
          return false;
        });
      }

      Engine.prototype.keyEvent = function(key, callback) {
        return this.keyEvents[key] = {
          callback: callback,
          key: key,
          state: 'idle'
        };
      };

      Engine.prototype.scale = function(factor) {
        this.resolution = factor;
        this.screen.width = this.origw * factor;
        this.screen.height = this.origh * factor;
        this.ctx = this.screen.getContext("2d");
        return this.ctx.scale(factor, factor);
      };

      Engine.prototype.add = function(object) {
        return this.objects.push(object);
      };

      Engine.prototype.update = function() {
        var delta, key, o, sortedObjects, _i, _j, _k, _len, _len2, _len3, _ref;
        if (!this.running) return;
        _ref = this.keyEvents;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          if (key.state === 'idle') continue;
          window.console.log(key);
          if (key.callback) event.callback(key.state === 'down');
          key.state = 'idle';
        }
        this.currentMillis = this.milliseconds();
        delta = (this.currentMillis - this.lastMillis) / 1000;
        sortedObjects = _.sortBy(this.objects, function(o) {
          return o.position.z;
        });
        for (_j = 0, _len2 = sortedObjects.length; _j < _len2; _j++) {
          o = sortedObjects[_j];
          o.update(delta);
        }
        this.ctx.fillStyle = this.clearColor;
        this.ctx.fillRect(0, 0, this.w, this.h);
        for (_k = 0, _len3 = sortedObjects.length; _k < _len3; _k++) {
          o = sortedObjects[_k];
          o.draw(this);
        }
        delta = (this.milliseconds() - this.lastMillis) / 1000;
        this.lastMillis = this.currentMillis;
        return delta;
      };

      Engine.prototype.pause = function() {
        this.running = !this.running;
        return this.lastMillis = this.milliseconds();
      };

      Engine.prototype.translate = function(offset, rotate, callback) {
        var angle;
        angle = rotate * Math.PI / 180;
        this.ctx.translate(offset.x, offset.y);
        this.ctx.rotate(angle);
        callback.apply(this);
        this.ctx.rotate(-angle);
        return this.ctx.translate(-offset.x, -offset.y);
      };

      Engine.prototype.drawImage = function(image, src, dst, rotate, center) {
        return this.translate(dst.pos, rotate, function() {
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
        return this.translate(position, rotate, function() {
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
        }
        if (vert === 'top') return this.center.y = -this.size / 2;
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
          this.sprites = [1, 1];
        }
        this.frame = 0;
        this.setFPS(1);
        this.frameTime = 0;
        this.totalFrames = this.sprites.x * this.sprites.y;
        this.rotate = 0;
      }

      Sprite.prototype.setFPS = function(fps) {
        return this.frameRate = 1 / fps;
      };

      Sprite.prototype.setSize = function(w, h) {
        this.w = w / this.sprites.x;
        this.h = h / this.sprites.y;
        this.center.x = this.w / 2 * this.scale;
        this.center.y = this.h / 2 * this.scale;
        return this.updatePos();
      };

      Sprite.prototype.update = function(delta) {
        if (this.updateCallback) this.updateCallback(delta);
        this.nextFrame(delta);
        return this.updatePos();
      };

      Sprite.prototype.updatePos = function() {
        this.src = new Rect(this.frame * this.w, 0, this.w, this.h);
        return this.dst = new Rect(this.position.x, this.position.y, this.w * this.scale, this.h * this.scale);
      };

      Sprite.prototype.draw = function(engine) {
        if (!this.loaded) return;
        return engine.drawImage(this.image, this.src, this.dst, this.rotate, this.center);
      };

      Sprite.prototype.nextFrame = function(delta) {
        this.frameTime += delta;
        if (this.frameTime > this.frameRate) {
          this.frameTime -= this.frameRate;
          this.frame++;
          if (this.frame >= this.totalFrames) return this.frame = 0;
        }
      };

      return Sprite;

    })();
    window.engine = new Engine;
    updateRate = 1000 / 60;
    update = function() {
      var delta;
      delta = window.engine.update();
      return window.setTimeout(update, updateRate - (delta * 1000));
    };
    window.setTimeout(update, 1);
    sprite = new Sprite("anim.png", {
      sprites: [3, 1]
    });
    sprite.position = new Vector(100, 100, 10);
    sprite.updateCallback = function(delta) {
      return this.rotate += 5;
    };
    sprite2 = new Sprite("anim.png", {
      sprites: [3, 1]
    });
    sprite2.position = new Vector(200, 100, 8);
    sprite2.setFPS(0.5);
    sprite2.updateCallback = function(delta) {
      return this.rotate += 1;
    };
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
    fps.position = new Vector(0, 0, 100);
    window.engine.keyEvent('D', function(down) {
      window.console.log('d');
      if (down) return sprite.position.x += 10;
    });
    window.engine.add(sprite);
    window.engine.add(sprite2);
    window.engine.add(fps);
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
