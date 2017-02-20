import React, { Component } from 'react'
import HttpStatus from 'http-status'
import {Textfield, Button} from 'react-mdl'

import Error from './Error'

import config from './config'
const {vouchersEndpoint, secretKey} = config

const getVoucher = voucherCode => new Promise((resolve, reject) => {
  const handleFetchResolve = resp => {
    if (resp.status === HttpStatus.NOT_FOUND) {
      reject('Provided voucher code was not found')

      return
    }

    if (resp.status !== HttpStatus.OK) {
      reject(resp.statusText)

      return
    }

    return resp.json()
  }

  fetch(`${vouchersEndpoint}${voucherCode}`, {
    method: 'GET',
    headers: {
      'Super-Secret-Authorization-Key': secretKey
    }
  })
    .then(handleFetchResolve, () => reject('Could not communicate with Voucher api, please try again later'))
    .then(jsonResponse => resolve(jsonResponse))
    .catch(() => reject('This is a weird error. This should not happen in a happy path mvp, please contact tarnas (github in the footer)?')) 
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

const getInitialState = () => ({
  code: '',
  error: null,
  activeVoucher: null,
})

class VoucherCodeInput extends Component {
  constructor (props) {
    super(props)
    this.state = getInitialState()

    this.handleCodeChange = this.handleCodeChange.bind(this)
    this.validateVoucher = this.validateVoucher.bind(this)
    this.renderInput = this.renderInput.bind(this)
    this.renderError = this.renderError.bind(this)
    this.renderActiveVoucher = this.renderActiveVoucher.bind(this)
    this.renderLoadingIndicator = this.renderLoadingIndicator.bind(this)
    this.resetState = this.resetState.bind(this)
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
          code: voucher.code
        })
      }, getVoucherError => {
        this.setState({
          loading: false,
          error: getVoucherError
        })
      })
      .catch(e => console.log(e))
  }

  renderInput (code) {
    return (
      <div>
        <Textfield
          onChange={this.handleCodeChange}
          label="use your voucher code"
          floatingLabel
          style={{width: '200px'}}
        />
        <Button type="submit" onClick={this.validateVoucher}>Use voucher</Button>
      </div>
    )
  }

  renderLoadingIndicator () {
    return (<p>loading...</p>)
  }

  resetState () {
    this.setState(getInitialState())
  }

  renderError (error) {
    return (
      <div>
        <Error message={error}></Error>
        <Button onClick={this.resetState}>try again</Button>
      </div>
    )
  }

  renderActiveVoucher (voucher) {
    return (
      <p style={{color: '#00a300'}}>Elligible for <strong>{voucher}</strong> discount!</p>
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
