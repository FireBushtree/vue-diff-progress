export class BesselLine {
  constructor(ctx, { startPoint, middlePoint, endPoint }) {
    this.ctx = ctx
    this.startPoint = startPoint
    this.endPoint = endPoint

    if (middlePoint) {
      this.middlePoint = middlePoint
    } else {
      this.middlePoint = {
        x: (this.startPoint.x + this.endPoint.x) / 2,
        y: (this.startPoint.y + this.endPoint.y) / 2
      }
    }
  }

  render() {
    this.drawLine()
    this.drawArrow()
  }

  drawLine() {
    const c = this.ctx
    c.save()
    c.beginPath()
    const { x: startX, y: startY } = this.startPoint
    const { x: endX, y: endY } = this.endPoint
    const { x: middlePointX, y: middlePointY } = this.middlePoint
    c.moveTo(startX, startY)
    c.quadraticCurveTo(middlePointX, middlePointY, endX, endY)
    c.stroke()
  }

  calArrowHeadCoords(pointX, pointY, h = 10) {
    const x = h * Math.sqrt(3)
    return [
      [pointX + x, pointY + h],
      [pointX + x, pointY - h]
    ]
  }

  calAngleControlAndEnd(startX, startY, endX, endY) {
    const distanceX = endX - startX
    const distanceY = endY - startY
    const baseAngle = Math.atan2(distanceY, distanceX)
    return baseAngle
  }

  calculateCoords(startX, startY, endX, endY, angle) {
    const x = startX
    const y = startY
    const x1 = endX
    const y1 = endY

    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    const x2 = x + (x1 - x) * cos - (y1 - y) * sin
    const y2 = y + (y1 - y) * cos + (x1 - x) * sin
    return { x: x2, y: y2 }
  }

  drawArrow() {
    const c = this.ctx
    c.save()
    c.beginPath()

    const angle = this.calAngleControlAndEnd(
      this.endPoint.x,
      this.endPoint.y,
      this.middlePoint.x,
      this.middlePoint.y
    )
    const endX = this.endPoint.x
    const endY = this.endPoint.y
    const coords = this.calArrowHeadCoords(endX, endY)
    const points = coords.map(item => {
      return this.calculateCoords(endX, endY, item[0], item[1], angle)
    })

    const [p1, p2] = points

    c.moveTo(endX, endY)
    c.lineTo(p1.x, p1.y)
    c.moveTo(endX, endY)
    c.lineTo(p2.x, p2.y)

    c.stroke()
  }
}
