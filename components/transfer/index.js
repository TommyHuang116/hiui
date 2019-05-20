import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '../button'
import Checkbox from '../checkbox'
import Icon from '../icon'
import Input from '../input'
import classNames from 'classnames'
import withDragDropContext from '../lib/withDragDropContext'
import Item from './Item'
import Provider from '../context'
import './style/index'

class Transfer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sourceList: [],
      targetList: [],
      sourceSelectedKeys: [],
      targetSelectedKeys: [],
      leftFilter: '',
      rightFilter: '',
      limited: false,
      targetNode: null,
      sourceNode: null,
      positionX: null,
      positionY: null
    }
  }
  componentDidMount () {
    this.parseDatas(this.props)
  }
  setPosition = (x, y) => {
    const { positionX, positionY } = this.state
    if (!(x === positionX && y === positionY)) {
      this.setState({
        positionX: x,
        positionY: y
      })
    }
  }
  parseDatas (props) {
    const { data, targetKeys } = props
    const sourceList = []
    const targetList = new Array(targetKeys.length)
    data.forEach((item, index) => {
      const targetIndexKey = targetKeys.indexOf(item.id)
      if (targetIndexKey > -1) {
        targetList[targetIndexKey] = item
      } else {
        sourceList.push(item)
      }
    })

    this.setState({
      sourceList,
      targetList
    })
  }
  componentWillReceiveProps (props) {
    this.parseDatas(props)
  }

  getSelectedKeysByDir (dir) {
    return dir === 'left' ? 'sourceSelectedKeys' : 'targetSelectedKeys'
  }
  clickItemEvent (item, index, dir) {
    const { mode } = this.props
    if (item.disabled) {
      return
    }
    if (mode === 'basic') {
      this.parseSelectedKeys(dir, item.id, () => {
        this.moveTo(dir)
      })
    }
  }
  parseSelectedKeys (dir, key, callback) {
    const { sourceSelectedKeys, targetSelectedKeys } = this.state
    const selectedItem = dir === 'left' ? [...sourceSelectedKeys] : [...targetSelectedKeys]
    const selectedIndex = selectedItem.indexOf(key)
    if (selectedIndex > -1) {
      selectedItem.splice(selectedIndex, 1)
    } else {
      selectedItem.push(key)
    }
    this.setState(
      {
        [this.getSelectedKeysByDir(dir)]: selectedItem
      },
      () => {
        callback && callback()
        this.isLimited(dir)
      }
    )
  }
  checkboxEvent (dir, value, isChecked) {
    this.parseSelectedKeys(dir, value, null)
  }
  moveTo (dir) {
    const { targetKeys } = this.props
    const { sourceSelectedKeys, targetSelectedKeys } = this.state
    const selectedItem = dir === 'left' ? [...sourceSelectedKeys] : [...targetSelectedKeys]
    const newTargetKeys =
      dir === 'left'
        ? selectedItem.concat(targetKeys)
        : targetKeys.filter(tk => selectedItem.indexOf(tk) === -1)
    this.setState(
      {
        [this.getSelectedKeysByDir(dir)]: newTargetKeys
      },
      () => {
        this.props.onChange(newTargetKeys)
        this.setState({
          [this.getSelectedKeysByDir(dir)]: [],
          [dir + 'Filter']: '',
          limited: false
        })
      }
    )
  }
  allCheckboxEvent (dir, value, isChecked) {
    const { sourceList, targetList, leftFilter, rightFilter } = this.state
    const arr = []
    const originDatas = dir === 'left' ? sourceList : targetList
    const filterText = dir === 'left' ? leftFilter : rightFilter
    if (isChecked) {
      originDatas.forEach(data => {
        data.content.includes(filterText) && !data.disabled && arr.push(data.id)
      })
    }
    this.setState(
      {
        [this.getSelectedKeysByDir(dir)]: arr
      },
      () => {
        this.isLimited(dir)
      }
    )
  }
  isLimited (dir) {
    const { targetList, sourceSelectedKeys } = this.state
    const { targetLimit } = this.props
    this.setState({
      limited:
        sourceSelectedKeys.length > targetLimit ||
        sourceSelectedKeys.length + targetList.length > targetLimit
    })
  }
  searchEvent (dir, e) {
    this.setState({
      [dir + 'Filter']: e.target.value
    })
  }
  move (targetItem, sourceItem) {
    const { targetList } = this.state
    let tempItem
    let fIndex
    let tIndex
    targetList.forEach((item, index) => {
      if (item.id === targetItem.id) {
        tempItem = item
        fIndex = index
      }
      if (item.id === sourceItem.id) {
        tIndex = index
      }
    })
    targetList.splice(fIndex, 1)
    targetList.splice(tIndex, 0, tempItem)
    this.setState({ targetList })
  }
  setTargetNode (id) {
    this.setState({ targetNode: id })
  }
  removeTargetNode () {
    this.setState({ targetNode: null })
  }
  setSourceNode (id) {
    this.setState({ sourceNode: id })
  }
  removeSourceNode () {
    this.setState({ sourceNode: null })
  }
  renderContainer (dir, datas) {
    const { mode, showAllSelect, searchable, draggable, emptyContent, title, disabled, localeDatas } = this.props
    const {
      sourceSelectedKeys,
      targetSelectedKeys,
      leftFilter,
      rightFilter,
      limited,
      targetNode,
      sourceNode,
      positionX,
      positionY
    } = this.state
    const selectedKeys = dir === 'left' ? sourceSelectedKeys : targetSelectedKeys
    const filterText = dir === 'left' ? leftFilter : rightFilter
    const filterResult = datas.filter(item => item.content.includes(filterText))
    const footerCls = classNames(
      'hi-transfer__footer',
      selectedKeys.length !== filterResult.length &&
        selectedKeys.length !== 0 &&
        'hi-transfer__footer--checkbox-part'
    )
    const _title = dir === 'left' ? title[0] : title[1] || title[0]
    return (
      <div className='hi-transfer__container'>
        {disabled && <div className='hi-transfer__mask' />}
        {
          _title && <div className='hi-transfer__title'>{_title}</div>
        }
        {searchable && (
          <div className='hi-transfer__searchbar'>
            <Icon name='search' />
            <Input
              placeholder={localeDatas.transfer.search}
              onChange={this.searchEvent.bind(this, dir)}
              value={filterText}
            />
          </div>
        )}
        <div
          className={`hi-transfer__body ${filterResult.length === 0 ? 'hi-transfer__body--empty' : ''}`}
        >
          {filterResult.length > 0 ? (
            <ul className='hi-transfer__list'>
              {dir === 'left' && limited && (
                <li key='limit-tips' className='hi-transfer__item hi-transfer__item--limit'>
                  <div className='hi-transfer__warning' />
                  <span>{localeDatas.transfer.limited}</span>
                </li>
              )}
              {filterResult.map((item, index) => {
                return (
                  <Item
                    dir={dir}
                    draggable={draggable}
                    key={index}
                    onClick={this.clickItemEvent.bind(this, item, index, dir)}
                    mode={mode}
                    item={item}
                    checked={selectedKeys.includes(item.id)}
                    checkboxOnChange={this.checkboxEvent.bind(this, dir)}
                    move={this.move.bind(this)}
                    setTargetNode={this.setTargetNode.bind(this)}
                    removeTargetNode={this.removeTargetNode.bind(this)}
                    targetNode={targetNode}
                    setSourceNode={this.setSourceNode.bind(this)}
                    removeSourceNode={this.removeSourceNode.bind(this)}
                    sourceNode={sourceNode}
                    setPosition={this.setPosition}
                    positionX={positionX}
                    positionY={positionY}
                  />
                )
              })}
            </ul>
          ) : dir === 'left' ? (
            emptyContent[0]
          ) : (
            emptyContent[1] || emptyContent[0]
          )}
        </div>
        {mode !== 'basic' && showAllSelect && (
          <div className={footerCls}>
            <Checkbox
              text={localeDatas.transfer.allSelect}
              checked={
                selectedKeys.length !== 0 &&
                selectedKeys.length === filterResult.length &&
                filterResult.length !== 0
              }
              onChange={this.allCheckboxEvent.bind(this, dir)}
            />
            <span>{localeDatas.transfer.selected}：{selectedKeys.length}</span>
          </div>
        )}
      </div>
    )
  }

  render () {
    const { mode } = this.props
    const { sourceList, targetList, sourceSelectedKeys, targetSelectedKeys, limited } = this.state
    const operCls = classNames(
      'hi-transfer__operation',
      mode === 'basic' && 'hi-transfer__operation--basic'
    )
    return (
      <div className='hi-transfer'>
        {this.renderContainer('left', sourceList)}
        <div className={operCls}>
          {mode !== 'basic' && (
            <React.Fragment>
              <Button
                type={sourceSelectedKeys.length === 0 || limited ? 'default' : 'primary'}
                icon='right'
                onClick={this.moveTo.bind(this, 'left')}
                disabled={sourceSelectedKeys.length === 0 || limited}
              />
              <span className='hi-transfer__split' />
              <Button
                type={targetSelectedKeys.length === 0 ? 'default' : 'primary'}
                icon='left'
                onClick={this.moveTo.bind(this, 'right')}
                disabled={targetSelectedKeys.length === 0}
              />
            </React.Fragment>
          )}
        </div>
        {this.renderContainer('right', targetList)}
      </div>
    )
  }
}
Transfer.defaultProps = {
  mode: 'basic',
  targetKeys: [],
  showAllSelect: false,
  searchable: false,
  draggable: false,
  emptyContent: ['No Datas', 'No Datas'],
  title: ['', ''],
  disabled: false
}
Transfer.propTypes = {
  mode: PropTypes.oneOf(['basic', 'multiple']),
  showAllSelect: PropTypes.bool,
  searchable: PropTypes.bool,
  draggable: PropTypes.bool,
  disabled: PropTypes.bool,
  targetLimit: PropTypes.number
}
export default withDragDropContext(Provider(Transfer))
