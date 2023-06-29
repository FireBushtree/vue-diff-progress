export default class Line {
  constructor(ctx, { startX, startY, endX, endY, speed }) {
    this.ctx = ctx
    this.speed = speed || 10

    this.startX = startX
    this.startY = startY
    this.endX = endX
    this.endY = endY

    this.dx = endX - startX
    this.dy = endY - startY
    this.middlePointX = (startX + endX) / 2
    this.middlePointY = (startY + endY) / 2
    this.totalDistance = this.calcPointDistance({ startX, startY, endX, endY })

    this.nextPointX = this.startX
    this.nextPointY = this.startY
  }

  draw() {
    const c = this.ctx

    c.save()
    c.beginPath()
    c.moveTo(this.nextPointX, this.nextPointY)
    this.calcNextPoint()
    c.lineTo(this.nextPointX, this.nextPointY)
    c.stroke()
    c.closePath()

    if (this.nextPointX === this.endX && this.nextPointY === this.endY) {
      return
    }

    window.requestAnimationFrame(() => {
      this.draw()
    })
  }

  calcNextPoint() {
    let nextPointX = this.nextPointX
    let nextPointY = this.nextPointY

    if (this.dx === 0) {
      nextPointX = this.startX
      nextPointY += (this.speed * this.dy) / Math.abs(this.dy)
    } else if (this.dy === 0) {
      nextPointX += (this.speed * this.dx) / Math.abs(this.dx)
      nextPointY = this.startY
    } else {
      const slopeRate = this.dy / this.dx
      nextPointX += (this.speed * this.dx) / Math.abs(this.dx)
      nextPointY += (this.speed * slopeRate * this.dx) / Math.abs(this.dx)
    }

    const d = this.calcPointDistance({
      startX: this.startX,
      startY: this.startY,
      endX: nextPointX,
      endY: nextPointY
    })

    if (d >= this.totalDistance) {
      nextPointX = this.endX
      nextPointY = this.endY
    }

    this.nextPointX = nextPointX
    this.nextPointY = nextPointY
  }

  calcPointDistance({ startX, startY, endX, endY }) {
    return Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2))
  }
}
