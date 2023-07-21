import VNode from './vnode'

export enum DiffItemType {
  MOVE_NODE = 'MOVE_NODE',
  COMPARE_NODE = 'COMPARE_NODE',
  REMOVE_USELESS_NODES = 'REMOVE_USELESS_NODES',
  ADD_NEW_NODES = 'ADD_NEW_NODES',
  IDX_WHILE_END = 'IDX_WHILE_END',

  ADD_NEW_START_IDX = 'ADD_NEW_START_IDX',
  ADD_NEW_END_IDX = 'ADD_NEW_END_IDX',
  ADD_OLD_START_IDX = 'ADD_OLD_START_IDX',
  ADD_OLD_END_IDX = 'ADD_OLD_END_IDX',

  MINUS_NEW_START_IDX = 'MINUS_NEW_START_IDX',
  MINUS_NEW_END_IDX = 'MINUS_NEW_END_IDX',
  MINUS_OLD_START_IDX = 'MINUS_OLD_START_IDX',
  MINUS_OLD_END_IDX = 'MINUS_OLD_END_IDX'
}

export interface DiffItem {
  type: DiffItemType

  // for ['COMPARE_NODE']
  oldVnode?: VNode
  newVnode?: VNode
  isSame?: boolean

  // for ['MOVE_NODE']
  newNode?: Node
  referenceNode?: Node
  position?: 'before' | 'after'

  // for ['ADD_NEW_NODES']
  newStartIdx?: number
  newEndIdx?: number
  newCh?: Array<VNode>

  // for ['REMOVE_USELESS_NODES']
  oldStartIdx?: number
  oldEndIdx?: number
  oldCh?: Array<VNode>
}

export type DiffQueue = Array<DiffItem>
