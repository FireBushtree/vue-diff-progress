import { NODE_WIDTH } from "."

export default class Arrow {
  constructor(ctx, { text, node, length, direction = 'right' }) {
    this.ctx = ctx
    this.text = text
    this.length = length || 100
    this.direction = direction
    this.calcLocation(node)
  }

  calcLocation(node) {
    this.node = node
    if (this.direction === 'right') {
      this.x = node.x - this.length - 40
    } else {
      this.x = node.x + NODE_WIDTH + 40
    }

    this.y = node.y + node.height / 2
  }

  draw() {
    const lineLength = 10
    const deg = (30 / 180) * Math.PI
    const c = this.ctx
    const { x, y, length, direction, text } = this
    c.beginPath()
    c.moveTo(x, y)

    if (direction === 'right') {
      const endPointX = x + length
      c.lineTo(endPointX, y)
      const topPointX = endPointX - lineLength * Math.cos(deg)
      const topPointY = y + lineLength * Math.sin(deg)
      const bottomPointY = y - lineLength * Math.sin(deg)
      c.moveTo(topPointX, topPointY)
      c.lineTo(endPointX, y)
      c.moveTo(topPointX, bottomPointY)
      c.lineTo(endPointX, y)
      c.font = '16px arial'
      c.fillText(text, x, y - 4)
    } else {
      const endPointX = x + length
      c.lineTo(endPointX, y)
      const topPointX = x + lineLength * Math.cos(deg)
      const topPointY = y + lineLength * Math.sin(deg)
      const bottomPointY = y - lineLength * Math.sin(deg)
      c.moveTo(topPointX, topPointY)
      c.lineTo(x, y)
      c.moveTo(topPointX, bottomPointY)
      c.lineTo(x, y)
      c.font = '16px arial'
      c.fillText(text, x + length - c.measureText(text).width, y - 4)
    }

    c.strokeStyle = '#333'
    c.stroke()
    c.closePath()
  }

  move(node) {
    // 1. clear old arrow
    this.ctx.clearRect(this.x, this.y - 20, this.length, 30)
    // 2. render new arrow
    this.calcLocation(node)
    this.draw()
  }
}
