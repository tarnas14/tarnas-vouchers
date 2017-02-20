import React, { Component } from 'react'

class Buy extends Component {
  render () {
    return (
      <div>
        <p>buying product {this.props.product.id}</p>
        <button onClick={this.props.finalize}>BUY</button>
      </div>
    )
  }
}

export default Buy
