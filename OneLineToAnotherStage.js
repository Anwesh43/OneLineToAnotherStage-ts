var w = window.innerWidth, h = window.innerHeight, nodes = 5;
var OneLineToAnotherStage = (function () {
    function OneLineToAnotherStage() {
        this.canvas = document.createElement('canvas');
        this.lott = new LinkedOTT();
        this.animator = new Animator();
        this.initCanvas();
    }
    OneLineToAnotherStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    OneLineToAnotherStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.lott.draw(this.context);
    };
    OneLineToAnotherStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.lott.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.lott.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    OneLineToAnotherStage.init = function () {
        var stage = new OneLineToAnotherStage();
        stage.render();
        stage.handleTap();
    };
    return OneLineToAnotherStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.1 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 75);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var OTTNode = (function () {
    function OTTNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    OTTNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new OTTNode(this.i + 1);
            this.next.prev = this;
        }
    };
    OTTNode.prototype.update = function (stopcb) {
        this.state.update(stopcb);
    };
    OTTNode.prototype.startUpdating = function (startcb) {
        this.state.startUpdating(startcb);
    };
    OTTNode.prototype.drawFirstHorizontalLine = function (context, size, sc1) {
        var w = size / 2 * (1 - sc1);
        context.beginPath();
        context.moveTo(-w, 0);
        context.lineTo(w, 0);
        context.stroke();
    };
    OTTNode.prototype.drawSecondHorizontalLine = function (context, size, y, sc2) {
        var w = size / 2 * sc2;
        context.beginPath();
        context.moveTo(-w, y);
        context.lineTo(w, y);
        context.stroke();
    };
    OTTNode.prototype.drawVerticalLine = function (context, size, sc1, sc2) {
        context.beginPath();
        context.moveTo(0, size * sc2);
        context.lineTo(0, size * sc1);
        context.stroke();
    };
    OTTNode.prototype.draw = function (context) {
        context.strokeStyle = '#388E3C';
        context.lineWidth = Math.min(w, h) / 50;
        context.lineCap = 'round';
        var gap = h / (nodes + 2);
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2;
        context.save();
        context.translate(w / 2, gap * this.i + gap / 2);
        if (sc1 < 1) {
            this.drawFirstHorizontalLine(context, gap, sc1);
        }
        if (sc2 < 1) {
            this.drawVerticalLine(context, gap, sc1, sc2);
        }
        if (sc2 != 0) {
            this.drawSecondHorizontalLine(context, gap, gap, sc2);
        }
        context.restore();
    };
    OTTNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return OTTNode;
})();
var LinkedOTT = (function () {
    function LinkedOTT() {
        this.curr = new OTTNode(0);
        this.dir = 1;
    }
    LinkedOTT.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedOTT.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedOTT.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedOTT;
})();
