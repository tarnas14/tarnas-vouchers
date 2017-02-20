import React, { Component } from 'react'

const getVoucher = voucherCode => new Promise((resolve, reject) => {
  setTimeout(() => resolve({
    usable: true,
    discountType: 0,
    discountValue: 10
  }), 1000)
})

const DISCOUNTS = {
  Percentage: 0,
  Value: 1,
}

const buildDiscount = voucher => {
  if (voucher.discountType === DISCOUNTS.Percentage) {
    return price => (1 - (voucher.discountValue / 100)) * price
  }

  return price => price - voucher.discountValue
}

const buildDiscountRepresentation = voucher => {
  if (voucher.discountType === DISCOUNTS.Percentage) {
    return `${voucher.discountValue}%`
  }

  return `$${voucher.discountValue}`
}

class VoucherCodeInput extends Component {
  constructor (props) {
    super(props)
    this.state = {
      code: '',
      error: null,
      activeVoucher: null,
    }

    this.handleCodeChange = this.handleCodeChange.bind(this)
    this.validateVoucher = this.validateVoucher.bind(this)
    this.renderInput = this.renderInput.bind(this)
    this.renderError = this.renderError.bind(this)
    this.renderActiveVoucher = this.renderActiveVoucher.bind(this)
    this.renderLoadingIndicator = this.renderLoadingIndicator.bind(this)
  }

  handleCodeChange (event) {
    this.setState({code: event.target.value})
  }

  validateVoucher () {
    this.setState({
      loading: true
    })
    getVoucher(this.state.code)
      .then(voucher => {
        if (!voucher.usable) {
          this.setState({
            loading: false,
            error: 'Provided voucher is not usable at this time, we are sorry!',
          })

          return
        }

        this.setState({
          loading: false,
          activeVoucher: buildDiscountRepresentation(voucher),
        })

        this.props.applyVoucher({
          discount: buildDiscount(voucher),
          voucherCode: voucher.code
        })
      })
      .catch(e => console.log(e))
  }

  renderInput (code) {
    return (
      <div>
        use your voucher code:
        <input type="text" value={code} onChange={this.handleCodeChange} />
        <button type="submit" onClick={this.validateVoucher}>Use it</button>
      </div>
    )
  }

  renderLoadingIndicator () {
    return (<p>loading...</p>)
  }

  renderError (error) {
    return (
      <p>ERROR: {error}</p>
    )
  }

  renderActiveVoucher (voucher) {
    return (
      <p>Elligible for <strong>{voucher}</strong> discount!</p>
    )
  }

  render () {
    const {code, error, activeVoucher, loading} = this.state

    const showInput = !loading && !error && !activeVoucher
    const showError = !loading && error
    const showVoucher = !loading && !error && activeVoucher

    return (
      <div>
        {loading ? this.renderLoadingIndicator() : null}
        {showError ? this.renderError(error) : null}
        {showVoucher ? this.renderActiveVoucher(activeVoucher) : null}
        {showInput ? this.renderInput(code) : null}
      </div>
    )
  }
}

export default VoucherCodeInput
