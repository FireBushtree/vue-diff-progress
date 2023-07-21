import { NODE_HEIGHT, NODE_PADDING_TOP, NODE_WIDTH } from '.'

export default class Arrow {
  constructor(ctx, { text, node, length, direction = 'right' }) {
    this.ctx = ctx
    this.text = text
    this.paddingNode = 40
    this.length = length || 100
    this.direction = direction
    this.calcLocation(node)
  }

  calcLocation(node, step) {
    if (!node) {
      node = {
        ...this.node,
        x: this.node.x,
        y: this.node.y + (NODE_PADDING_TOP + NODE_HEIGHT) * step
      }
    }

    let xSkew = 0
    // prevent arrow from overlapping
    if (this.connectArrow?.node === node) {
      const xSkewMap = {
        left: 100 + 10,
        right: -100 - 10
      }

      xSkew = xSkewMap[this.direction]
    }

    this.node = node
    if (this.direction === 'right') {
      this.x = node.x - this.length - this.paddingNode
    } else {
      this.x = node.x + NODE_WIDTH + this.paddingNode
    }

    this.x += xSkew
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

  setConnectArrow(arrow) {
    this.connectArrow = arrow
  }

  move(node, step) {
    if (!node && !step) {
      return
    }

    // 1. clear old arrow
    this.ctx.clearRect(this.x, this.y - 20, this.length, 30)
    // 2. render new arrow
    this.calcLocation(node, step)
    this.draw()
  }
}
