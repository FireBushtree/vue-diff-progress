import VNode from './vnode'

export enum DiffItemType {
  MOVE_NODE = 'MOVE_NODE',
  COMPARE_NODE = 'COMPARE_NODE',
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
  oldVnode?: VNode
  newVnode?: VNode
  isSame?: boolean

  newNode?: Node
  referenceNode?: Node
  position?: 'before' | 'after'
}

export type DiffQueue = Array<DiffItem>
