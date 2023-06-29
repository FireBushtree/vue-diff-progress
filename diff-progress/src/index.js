import Arrow from './arrow'
import Line from './line'
import Node from './node'

export const PADDING_LEFT = 400
export const PADDING_TOP = 100
export const NODE_GROUP_DISTANCE = 400

export const NODE_WIDTH = 96
export const NODE_HEIGHT = 40
export const NODE_RADIUS = 8

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
    this.ctx = el.getContext('2d')
    const dpr = window.devicePixelRatio

    el.width = el.clientWidth * dpr
    el.height = el.clientHeight * dpr
    this.ctx.scale(dpr, dpr)

    el.addEventListener('click', () => {
      this.renderDiffItem()
    })
  }

  start() {
    const { oldCh, newCh } = this.diffNodes
    this.renderNodes(oldCh, newCh)
    this.renderArrow()
    this.renderDiffItem()
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

      MOVE_NODE: this.moveNode
    }
    const handler = handlerMap[diffItem.type]

    if (handler) {
      handler.call(this, diffItem)
    }
  }

  moveOldStartIdx(step) {
    this.oldStartIdx += step
    const target = this.oldNodeList[this.oldStartIdx]
    this.oldStartArrow.move(target)
  }

  moveNewStartIdx(step) {
    this.newStartIdx += step
    const target = this.newNodeList[this.newStartIdx]
    this.newStartArrow.move(target)
  }

  moveOldEndIdx(step) {
    this.oldEndIdx += step
    const target = this.oldNodeList[this.oldEndIdx]
    this.oldEndArrow.move(target)
  }

  moveNewEndIdx(step) {
    this.newEndIdx += step
    const target = this.newNodeList[this.newEndIdx]
    this.newEndArrow.move(target)
  }

  moveNode(diff) {
    const { newNode, referenceNode } = diff
    const node2move = this.oldNodeMap.get(newNode)
    const flagNode = this.oldNodeMap.get(referenceNode)
    const c = this.ctx
    c.save()
    c.beginPath()
    c.moveTo(node2move.x - 10, node2move.y + NODE_HEIGHT / 2)
    const middleY = (node2move.y + flagNode.y) / 2
    c.quadraticCurveTo(
      node2move.x - 100,
      middleY,
      node2move.x + NODE_WIDTH / 2,
      flagNode.y + NODE_HEIGHT + 10
    )
    c.globalCompositeOperation = 'destination-out'
    c.stroke()
  }

  renderNodes(oldCh, newCH) {
    const renderGroup = (map, list, x) => {
      const nodeList = []
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const node = new Node(this.ctx)
        map.set(item, node)
        node.render({
          x,
          y: 60 * i + PADDING_TOP,
          vnode: item
        })
        nodeList.push(node)
      }
      return nodeList
    }

    this.oldNodeList = renderGroup(this.oldNodeMap, oldCh, PADDING_LEFT)
    this.newNodeList = renderGroup(
      this.newNodeMap,
      newCH,
      PADDING_LEFT + NODE_WIDTH + NODE_GROUP_DISTANCE
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
    ;[
      this.oldStartArrow,
      this.oldEndArrow,
      this.newStartArrow,
      this.newEndArrow
    ].forEach(item => {
      item.draw()
    })
  }

  renderCompareLine({ oldVnode, newVnode, isSame }) {
    const compareLineDistance = 10

    const firstNode = this.oldNodeList[0]
    const longerList =
      this.oldNodeList.length > this.newNodeList.length
        ? this.oldNodeList
        : this.newNodeList
    const lastNode = longerList[longerList.length - 1]
    // 1. clear old line
    this.ctx.clearRect(
      firstNode.x + NODE_WIDTH + compareLineDistance,
      firstNode.y,
      NODE_GROUP_DISTANCE - compareLineDistance,
      lastNode.y + NODE_HEIGHT
    )

    // 2. render new line
    const oldNode = this.oldNodeMap.get(oldVnode)
    const newNode = this.newNodeMap.get(newVnode)
    const startPoint = {
      x: oldNode.x + NODE_WIDTH + compareLineDistance,
      y: oldNode.y + NODE_HEIGHT / 2
    }
    const endPoint = {
      x: newNode.x - compareLineDistance,
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
