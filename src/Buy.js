import React, { Component } from 'react'
import HttpStatus from 'http-status'

import VoucherCodeInput from './VoucherCodeInput'

const vouchersEndpoint = 'http://localhost:3001/api/vouchers/'
const secretKey = 'mellon'

const useVoucher = voucherCode => new Promise((resolve, reject) => {
  const handleFetchResolve = response => {
    if (response.status === HttpStatus.NO_CONTENT) {
      resolve()

      return
    }

    reject(response.statusText)
  }

  fetch(`${vouchersEndpoint}${voucherCode}`, {
    method: 'POST',
    headers: {
      'Super-Secret-Authorization-Key': secretKey
    }
  })
    .then(handleFetchResolve, () => reject('Could not communicate with Voucher api, please try again later'))
    .catch(() => reject('This is a weird error. This should not happen in a happy path mvp, please contact tarnas (github in the footer)?')) 
})

class Buy extends Component {
  constructor (props) {
    super(props)

    this.state = {
      voucher: null,
      error: null
    }

    this.applyVoucher = this.applyVoucher.bind(this)
    this.buyItem = this.buyItem.bind(this)
  }

  applyVoucher (voucher) {
    this.setState({voucher})
  }

  buyItem () {
    // some logic that buys the item
    if (!this.state.voucher) {
      this.props.productBought(this.props.product.id)

      return
    }

    useVoucher(this.state.voucher.code)
      .then(
        () => this.props.productBought(this.props.product.id),
        error => this.setState({error})
      )
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
        <button onClick={this.props.cancel}>cancel</button>
        <button onClick={this.buyItem}>BUY{voucher ? '' : ' without redeeming a voucher'}</button>
      </div>
    )
  }
}

export default Buy
