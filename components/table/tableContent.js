import React, { Component } from 'react'
import Body from './body'
import Header from './header'

export default class TableContent extends Component {
  constructor (props) {
    super(props)
    this.dom = React.createRef()
  }
  render () {
    let {columns, className, style, head = true, body = true, ...rest} = this.props
    rest.columns = columns
    let showColumns = rest.columns.filter(item => !item.hide)
    let showHeaderColumns = rest.headerColumns.filter(item => !item.hide)
    return (
      <table className={className} style={style} ref={this.dom}>
        <colgroup>
          {columns.map((item, index) => {
            let sty = {}
            if (item.width) {
              sty.minWidth = parseInt(item.width) + 'px'
              sty.width = parseInt(item.width) + 'px'
            }

            return (
              <col
                style={sty}
                key={'col-' + index} />
            )
          })}
        </colgroup>
        {head
          ? <Header {...rest} columns={showColumns} showHeaderColumns={showHeaderColumns} /> : null
        }
        {body
          ? <Body {...rest} columns={showColumns} showHeaderColumns={showHeaderColumns} /> : null
        }
      </table>
    )
  }
}
