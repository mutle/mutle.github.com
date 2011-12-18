if (!Function.prototype.bind) {
    // from MDC
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    Function.prototype.bind = function (obj) {
        var slice = [].slice;
        var args = slice.call(arguments, 1);
        var self = this;
        var nop = function () {};

        // optimize common case
        if (arguments.length == 1) {
          var bound = function() {
              var useThis = self.prototype === undefined ?
                                this instanceof arguments.callee :
                                this instanceof nop;
              return self.apply(useThis ? this : obj, arguments);
          };
        }
        else {
          var bound = function () {
              var useThis = self.prototype === undefined ?
                                this instanceof arguments.callee :
                                this instanceof nop;
              return self.apply(
                  useThis ? this : ( obj || {} ),
                  args.concat( slice.call(arguments) )
              );
          };
        }

        nop.prototype = self.prototype;
        bound.prototype = new nop();

        // From Narwhal
        bound.name = this.name;
        bound.displayName = this.displayName;
        bound.length = this.length;
        bound.unbound = self;

        return bound;
    };
}

