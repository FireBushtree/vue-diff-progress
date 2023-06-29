import { NODE_HEIGHT, NODE_RADIUS, NODE_WIDTH } from '.'

const NODE_BORDER_COLOR = '#d9d9d9'

export default class Node {
  constructor(ctx, vnode) {
    this.ctx = ctx
    this.vnode = vnode
    this.initSize()
  }

  render({ x, y }) {
    this.createPath(x, y)
    this.renderText(this.getText(this.vnode))
  }

  getText(vnode) {
    const {tag, key} = vnode
    if (tag && key) {
      return `${tag} key:{ ${key} }`
    }

    return key || tag
  }

  initSize() {
    this.width = NODE_WIDTH
    this.height = NODE_HEIGHT
    this.radius = NODE_RADIUS
  }

  createPath(x, y) {
    this.x = x
    this.y = y

    const width = this.width
    const height = this.height
    const radius = this.radius

    this.ctx.beginPath()
    this.ctx.moveTo(x, y + radius)
    this.ctx.lineTo(x, y + height - radius)
    this.ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
    this.ctx.lineTo(x + width - radius, y + height)
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width,
      y + height - radius
    )
    this.ctx.lineTo(x + width, y + radius)
    this.ctx.quadraticCurveTo(x + width, y, x + width - radius, y)
    this.ctx.lineTo(x + radius, y)
    this.ctx.quadraticCurveTo(x, y, x, y + radius)
    this.ctx.strokeStyle = NODE_BORDER_COLOR
    this.ctx.stroke()
    this.ctx.closePath()
  }

  renderText(text) {
    this.text = text

    const xoffset = this.ctx.measureText(this.text).width
    const x = this.x
    const y = this.y

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.font = '14px arial'
    this.ctx.fillStyle = '#333'
    this.ctx.textBaseline = 'middle'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(
      this.text,
      x + this.width / 2,
      y + this.height / 2,
      this.width
    )
    this.ctx.closePath()
    this.ctx.restore()
  }

  clear() {
    this.ctx.clearRect(this.x - 2, this.y - 2, NODE_WIDTH + 4, NODE_HEIGHT + 4)
  }

  move({ x, y }) {
    this.clear()
    this.render({ x, y })
  }
}
