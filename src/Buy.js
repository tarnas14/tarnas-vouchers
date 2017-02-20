import React, { Component } from 'react'

import VoucherCodeInput from './VoucherCodeInput'

class Buy extends Component {
  constructor (props) {
    super(props)

    this.state = {
      voucher: null
    }

    this.applyVoucher = this.applyVoucher.bind(this)
  }

  applyVoucher (voucher) {
    this.setState({voucher})
  }

  render () {
    const {voucher} = this.state
    const {price} = this.props.product

    return (
      <div>
        <p>buying product {this.props.product.id}</p>
        <p>
          Price: <span style={{textDecoration: voucher ? 'line-through' : '' }}>${price}</span> {voucher ? <strong>${voucher.discount(price)}</strong> : null}
        </p>
        <VoucherCodeInput
          applyVoucher={this.applyVoucher}
        ></VoucherCodeInput>
        <button onClick={this.props.finalize}>BUY</button>
      </div>
    )
  }
}

export default Buy
