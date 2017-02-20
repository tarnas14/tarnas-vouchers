import React, { Component } from 'react'

const getVoucher = voucherCode => new Promise((resolve, reject) => {
  resolve({
    usable: true,
    discountType: 0,
    discountValue: 10
  })
})

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
  }

  handleCodeChange (event) {
    this.setState({code: event.target.value})
  }

  validateVoucher () {
    getVoucher(this.state.code)
      .then(voucher => {
        if (!voucher.usable) {
          this.setState({
            error: 'Provided voucher is not usable at this time, we are sorry!'
          })

          return
        }

        this.setState({
          activeVoucher: 'some%'
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
    const {code, error, activeVoucher} = this.state

    const showInput = !error && !activeVoucher
    const showError = error
    const showVoucher = !error && activeVoucher

    return (
      <div>
        {showError ? this.renderError(error) : null}
        {showVoucher ? this.renderActiveVoucher(activeVoucher) : null}
        {showInput ? this.renderInput(code) : null}
      </div>
    )
  }
}

export default VoucherCodeInput
