import Arrow from './arrow'
import { BesselLine } from './bessel-line'
import Line from './line'
import Node from './node'
import { delay } from './utils'

export const NODE_WIDTH = 96
export const NODE_HEIGHT = 40
export const NODE_RADIUS = 8
export const NODE_PADDING_TOP = 20

export const CONTENT_EL_Z_INDEX = 10
export const MOVE_LINE_EL_Z_INDEX = 20
export const COMPARE_LINE_DISTANCE = 10

export const PADDING_LEFT = 400
export const PADDING_TOP = 100
export const NODE_GROUP_DISTANCE = 400
export const NEW_NODE_LIST_PADDING_LEFT =
  PADDING_LEFT + NODE_WIDTH + NODE_GROUP_DISTANCE

export default class DiffProgress {
  constructor(sel, { diffNodes, diffQueue }) {
    this.diffNodes = diffNodes
    this.diffQueue = diffQueue

    this.ctx = undefined
    this.queueIdx = 0
    this.oldNodeList = []
    this.oldNodeMap = new Map()

    this.newNodeList = []
    this.newNodeMap = new Map()
    this.initCanvas(sel)
  }

  initCanvas(sel) {
    const el = document.querySelector(sel)
    this.el = el

    this.contentEl = this.createCanvasDom(CONTENT_EL_Z_INDEX)
    this.ctx = this.createCtx(this.contentEl)

    this.moveLineEl = this.createCanvasDom(MOVE_LINE_EL_Z_INDEX)
    this.moveLineCtx = this.createCtx(this.moveLineEl)

    el.addEventListener('click', () => {
      this.renderDiffItem()
    })
  }

  createCtx(canvasDom) {
    const dpr = window.devicePixelRatio
    const ctx = canvasDom.getContext('2d')
    ctx.scale(dpr, dpr)

    return ctx
  }

  createCanvasDom(zIndex) {
    const canvasEl = document.createElement('canvas')
    const dpr = window.devicePixelRatio
    const { el } = this
    canvasEl.style.width = el.clientWidth + 'px'
    canvasEl.style.height = el.clientHeight + 'px'
    canvasEl.style.zIndex = zIndex
    canvasEl.style.position = 'absolute'
    canvasEl.style.left = 0
    canvasEl.style.top = 0

    canvasEl.width = el.clientWidth * dpr
    canvasEl.height = el.clientHeight * dpr
    el.appendChild(canvasEl)
    return canvasEl
  }

  start() {
    const { oldCh, newCh } = this.diffNodes
    this.renderNodes(oldCh, newCh)
    this.renderArrow()
    // this.renderDiffItem()
  }

  renderDiffItem() {
    const diffItem = this.diffQueue[this.queueIdx++]

    if (!diffItem) {
      return
    }

    const handlerMap = {
      COMPARE_NODE: this.renderCompareLine,

      ADD_OLD_START_IDX: () => this.moveOldStartIdx(1),
      MINUS_OLD_START_IDX: () => this.moveOldStartIdx(-1),

      ADD_NEW_START_IDX: () => this.moveNewStartIdx(1),
      MINUS_NEW_START_IDX: () => this.moveNewStartIdx(-1),

      ADD_NEW_END_IDX: () => this.moveNewEndIdx(1),
      MINUS_NEW_END_IDX: () => this.moveNewEndIdx(-1),

      ADD_OLD_END_IDX: () => this.moveOldEndIdx(1),
      MINUS_OLD_END_IDX: () => this.moveOldEndIdx(-1),

      MOVE_NODE: this.moveNode,
      IDX_WHILE_END: this.clearIdxArrow,

      ADD_NEW_NODES: this.addNewNode,
      REMOVE_USELESS_NODES: this.removeUselessNodes
    }
    const handler = handlerMap[diffItem.type]

    if (handler) {
      handler.call(this, diffItem)
    }
  }

  moveOldStartIdx(step) {
    this.oldStartIdx += step
    const target = this.oldNodeList[this.oldStartIdx]
    this.oldStartArrow.move(target, step)
  }

  moveNewStartIdx(step) {
    this.newStartIdx += step
    const target = this.newNodeList[this.newStartIdx]
    this.newStartArrow.move(target, step)
  }

  moveOldEndIdx(step) {
    this.oldEndIdx += step
    const target = this.oldNodeList[this.oldEndIdx]
    this.oldEndArrow.move(target, step)
  }

  moveNewEndIdx(step) {
    this.newEndIdx += step
    const target = this.newNodeList[this.newEndIdx]
    this.newEndArrow.move(target, step)
  }

  clearIdxArrow() {
    this.clearMiddleArea()
    ;[
      this.oldStartArrow,
      this.oldEndArrow,
      this.newStartArrow,
      this.newEndArrow
    ].forEach(item => {
      item.clear()
    })
  }

  renderExtraNodesBorder(startIdx, endIdx, beginX) {
    const borderPadding = 10
    const borderStartX = beginX - borderPadding
    const borderStartY =
      startIdx * (NODE_PADDING_TOP + NODE_HEIGHT) + PADDING_TOP - borderPadding

    const borderWidth = NODE_WIDTH + borderPadding * 2
    const borderHeight =
      (endIdx - startIdx) * (NODE_PADDING_TOP + NODE_HEIGHT) +
      NODE_HEIGHT +
      borderPadding * 2

    const c = this.ctx
    c.beginPath()

    c.lineJoin = 'round'
    c.setLineDash([3, 6])
    c.strokeRect(borderStartX, borderStartY, borderWidth, borderHeight)
    c.closePath()

    return {
      borderStartX,
      borderStartY,
      borderWidth,
      borderHeight
    }
  }

  async addNewNode(diff) {
    const { newStartIdx, newEndIdx, newCh } = diff
    // 1. render dash
    this.renderExtraNodesBorder(newStartIdx, newEndIdx, PADDING_LEFT)

    // 2. render line
    const c = this.ctx
    c.beginPath()
    const borderMiddleY = borderStartY + borderHeight / 2
    const lineStartX = borderStartX
    const lineStartY = borderMiddleY
    const lineEndX =
      this.oldStartArrow.x +
      this.oldStartArrow.length +
      NODE_WIDTH +
      this.oldStartArrow.paddingNode +
      10

    const lineEndY = this.oldStartArrow.y
    const line = new BesselLine(this.ctx, {
      startPoint: { x: lineStartX, y: lineStartY },
      endPoint: { x: lineEndX, y: lineEndY }
    })
    c.setLineDash([])
    line.render()

    // 3. render node
    await delay(1000)

    let count = 0
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const item = newCh[i]
      const node = new Node(this.ctx, item)
      node.render({
        x: PADDING_LEFT,
        y:
          (NODE_PADDING_TOP + NODE_HEIGHT) *
            (this.oldNodeList.length + count++) +
          PADDING_TOP
      })
    }
    c.closePath()
  }

  async removeUselessNodes(diff) {
    const { oldStartIdx, oldEndIdx } = diff
    const { borderStartX, borderStartY, borderWidth, borderHeight } =
      this.renderExtraNodesBorder(oldStartIdx, oldEndIdx, PADDING_LEFT)

    await delay(1000)
    const extraClearPadding = 2
    this.ctx.clearRect(
      borderStartX - extraClearPadding,
      borderStartY - extraClearPadding,
      borderWidth + extraClearPadding * 2,
      borderHeight + extraClearPadding * 2
    )
  }

  moveNode(diff) {
    const { newNode, referenceNode } = diff
    const node2move = this.oldNodeMap.get(newNode)
    const flagNode = this.oldNodeMap.get(referenceNode)
    const afterArray = []
    let curr = flagNode.next
    while (curr) {
      afterArray.unshift(curr)
      curr = curr.next
    }

    if (afterArray.length > 0) {
      afterArray.forEach(item => item.moveNext())
    }

    if (flagNode.next) {
      const next = flagNode.next
      node2move.next = next
    }
    flagNode.next = node2move

    const c = this.moveLineCtx
    c.save()
    c.beginPath()
    const startX = node2move.x - 10
    const startY = node2move.y + NODE_HEIGHT / 2
    c.moveTo(startX, startY)
    const middleY = (node2move.y + flagNode.y) / 2
    const leftLength = 100
    const leftX = node2move.x - leftLength
    const endX = node2move.x + NODE_WIDTH / 2
    const endY = flagNode.y + NODE_HEIGHT + 10
    c.quadraticCurveTo(leftX, middleY, endX, endY)
    const besselLine = new BesselLine(c, {
      startPoint: { x: startX, y: startY },
      middlePoint: { x: leftX, y: middleY },
      endPoint: { x: endX, y: endY }
    })
    besselLine.render()

    setTimeout(() => {
      c.clearRect(
        0,
        0,
        parseInt(this.moveLineEl.style.width),
        parseInt(this.moveLineEl.style.height)
      )

      node2move.move({ x: node2move.x, y: flagNode.y + NODE_HEIGHT + 20 })
    }, 1000)
  }

  renderNodes(oldCh, newCH) {
    const renderGroup = (map, list, x) => {
      const nodeList = []
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const node = new Node(this.ctx, item)
        map.set(item, node)
        node.render({
          x,
          y: (NODE_PADDING_TOP + NODE_HEIGHT) * i + PADDING_TOP
        })
        nodeList.push(node)
      }
      return nodeList
    }

    this.oldNodeList = renderGroup(this.oldNodeMap, oldCh, PADDING_LEFT)
    this.newNodeList = renderGroup(
      this.newNodeMap,
      newCH,
      NEW_NODE_LIST_PADDING_LEFT
    )
  }

  renderArrow() {
    this.oldStartIdx = 0
    this.oldEndIdx = this.oldNodeList.length - 1
    this.newStartIdx = 0
    this.newEndIdx = this.newNodeList.length - 1
    const oldStartVnode = this.oldNodeList[this.oldStartIdx]
    const oldEndVnode = this.oldNodeList[this.oldEndIdx]
    const newStartVnode = this.newNodeList[this.newStartIdx]
    const newEndVnode = this.newNodeList[this.newEndIdx]

    this.oldStartArrow = new Arrow(this.ctx, {
      text: 'oldStartIdx',
      node: oldStartVnode,
      direction: 'right'
    })
    this.oldEndArrow = new Arrow(this.ctx, {
      text: 'oldEndIdx',
      node: oldEndVnode,
      direction: 'right'
    })
    this.newStartArrow = new Arrow(this.ctx, {
      text: 'newStartIdx',
      node: newStartVnode,
      direction: 'left'
    })
    this.newEndArrow = new Arrow(this.ctx, {
      text: 'newEnd',
      node: newEndVnode,
      direction: 'left'
    })
    this.oldStartArrow.setConnectArrow(this.oldEndArrow)
    this.oldEndArrow.setConnectArrow(this.oldStartArrow)
    this.newStartArrow.setConnectArrow(this.newEndArrow)
    this.newEndArrow.setConnectArrow(this.newStartArrow)
    ;[
      this.oldStartArrow,
      this.oldEndArrow,
      this.newStartArrow,
      this.newEndArrow
    ].forEach(item => {
      item.draw()
    })
  }

  clearMiddleArea() {
    const firstNode = this.oldNodeList[0]
    const longerList =
      this.oldNodeList.length > this.newNodeList.length
        ? this.oldNodeList
        : this.newNodeList
    const lastNode = longerList[longerList.length - 1]
    this.ctx.clearRect(
      firstNode.x + NODE_WIDTH + COMPARE_LINE_DISTANCE,
      firstNode.y,
      NODE_GROUP_DISTANCE - COMPARE_LINE_DISTANCE,
      lastNode.y + NODE_HEIGHT
    )
  }

  renderCompareLine({ oldVnode, newVnode, isSame }) {
    // 1. clear old line
    this.clearMiddleArea()

    // 2. render new line
    const oldNode = this.oldNodeMap.get(oldVnode)
    const newNode = this.newNodeMap.get(newVnode)
    const startPoint = {
      x: oldNode.x + NODE_WIDTH + COMPARE_LINE_DISTANCE,
      y: oldNode.y + NODE_HEIGHT / 2
    }
    const endPoint = {
      x: newNode.x - COMPARE_LINE_DISTANCE,
      y: newNode.y + NODE_HEIGHT / 2
    }
    const line = new Line(this.ctx, {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y
    })
    line.draw()

    this.renderCompareResult(line, isSame)
  }

  renderCompareResult(line, isSame) {
    const image = new Image()
    image.src = isSame
      ? './public/images/success.svg'
      : './public/images/fail.svg'
    const imageLength = 16
    const halfImageLength = imageLength / 2
    image.onload = () => {
      this.ctx.drawImage(
        image,
        line.middlePointX - halfImageLength,
        line.middlePointY - imageLength - 4,
        imageLength,
        imageLength
      )
    }
  }
}
