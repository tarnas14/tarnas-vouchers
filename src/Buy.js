import React, { Component } from 'react'

import VoucherCodeInput from './VoucherCodeInput'

class Buy extends Component {
  render () {
    return (
      <div>
        <p>buying product {this.props.product.id}</p>
        <VoucherCodeInput></VoucherCodeInput>
        <button onClick={this.props.finalize}>BUY</button>
      </div>
    )
  }
}

export default Buy
