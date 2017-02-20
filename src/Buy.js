import React, { Component } from 'react'
import HttpStatus from 'http-status'
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from 'react-mdl'

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

    this.setState({
      loading: true
    });

    useVoucher(this.state.voucher.code)
      .then(
        () => this.props.productBought(this.props.product.id),
        error => this.setState({loading: false, error})
      )
  }

  render () {
    const {voucher} = this.state
    const {price, name} = this.props.product

    return (
      <div>
        <Dialog open={true} onCancel={this.props.cancel}>
          <DialogTitle>Buy at <span style={{textDecoration: voucher ? 'line-through' : '' }}>${price}</span> {voucher ? <strong>${voucher.discount(price)}</strong> : null}
</DialogTitle>
          <DialogContent>
            <strong>Buying {name}</strong>
            <VoucherCodeInput
              applyVoucher={this.applyVoucher}
            ></VoucherCodeInput>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={this.props.cancel}>Cancel</Button>
            <Button type="button" colored raised ripple onClick={this.buyItem}>Buy</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default Buy
