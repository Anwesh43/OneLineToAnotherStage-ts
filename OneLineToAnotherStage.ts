const w : number = window.innerWidth, h = window.innerHeight, nodes : number = 5
class OneLineToAnotherStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    lott : LinkedOTT = new LinkedOTT()

    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lott.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lott.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lott.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage = new OneLineToAnotherStage()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0

    prevScale : number = 0

    dir : number = 0

    update(cb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class OTTNode {

    prev : OTTNode

    next : OTTNode

    state : State =  new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new OTTNode(this.i + 1)
            this.next.prev = this
        }
    }
    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    drawFirstHorizontalLine(context : CanvasRenderingContext2D, size : number, sc1 : number) {
        const w : number = size/2 * (1 - sc1)
        context.beginPath()
        context.moveTo(-w, 0)
        context.lineTo(w, 0)
        context.stroke()
    }

    drawSecondHorizontalLine(context : CanvasRenderingContext2D, size : number, y : number, sc2 : number) {
        const w : number = size/2 * sc2
        context.beginPath()
        context.moveTo(-w, 0)
        context.lineTo(w , 0)
        context.stroke()
    }

    drawVerticalLine(context : CanvasRenderingContext2D, size : number, sc1 : number, sc2 : number) {
        context.beginPath()
        context.moveTo(0, size * sc2)
        context.lineTo(0, size * sc1)
        context.stroke()
    }

    draw(context : CanvasRenderingContext2D) {
        context.strokeStyle = '#388E3C'
        context.lineWidth = Math.min(w, h) / 50
        context.lineCap = 'round'
        const gap : number = h / nodes
        const wSize : number = (w / 3)
        const sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(0, this.state.scale)) * 2
        context.save()
        context.translate(w/2, gap * this.i + gap/2)
        this.drawFirstHorizontalLine(context, wSize, sc1)
        this.drawVerticalLine(context, wSize, sc1, sc2)
        this.drawSecondHorizontalLine(context, wSize, gap, sc2)
        context.restore()
    }

    getNext(dir : number, cb : Function) {
        var curr : OTTNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedOTT {

    curr : OTTNode = new OTTNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
