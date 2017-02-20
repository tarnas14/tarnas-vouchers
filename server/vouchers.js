const HttpStatus = require('http-status')
const _ = require('lodash')
const moment = require('moment')

const campaigns = require('./campaigns')

const DISCOUNTS = {
  Percentage: 0,
  Value: 1,
}

const ERRORS = {
  UsingInvalidVoucher: 'Provided voucher is invalid',
  InvalidCount: 'Invalid voucher count specified',
  InvalidDiscountType: 'Discount Type not recognized',
  InvalidDiscountValue: 'Discount Value not valid',
  InvalidUseCount: 'Voucher should be usable at least once',
}

const getModel = mongoose => {
  const voucherSchema = new mongoose.Schema({
    campaign: {
      type: String,
      required: [true],
    },
    usesLeft: {
      default: 1,
      type: Number,
      required: [true],
    },
    discountType: {
      type: Number,
      default: DISCOUNTS.Percentage,
      required: [true],
    },
    discountValue: {
      type: Number,
      default: 10,
      required: [true],
    },
    usableFrom: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  })

  return mongoose.model('Voucher', voucherSchema)
}

const vouchers = mongoose => {
  const Voucher = getModel(mongoose)

  const getId = voucherCode => voucherCode.split('_').slice(-1)
  const getCode = v => `${v.campaign}_${v._id}`
  const getCodes = vs => vs.map(getCode)
  const usableNow = ({usableFrom, expiresAt}) => moment.utc().isBetween(usableFrom, expiresAt, 'days', '[]') 
  const isUsable = voucher => voucher.usesLeft > 0 && usableNow(voucher)
  const prepareVoucherRepresentation = voucher => ({
    campaign: voucher.campaign,
    code: getCode(voucher),
    discountValue: voucher.discountValue,
    discountType: voucher.discountType,
    usable: isUsable(voucher),
  })

  const getVoucherHandler = (req, res, voucherHandler) => {
    const handleKnownErrors = error => {
      if (error.name === 'CastError' && error.kind === 'ObjectId' && error.path === '_id') {
        return {errorStatus: HttpStatus.NOT_FOUND}
      }

      return {}
    }

    Voucher
      .findById(getId(req.params.code))
      .exec((error, retrievedVoucher) => {
        if (error) {
          const {errorStatus} = handleKnownErrors(error);
          if (errorStatus) {
            res.sendStatus(errorStatus)

            return
          }

          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          res.send(error)

          return
        }

        if (!retrievedVoucher) {
          res.sendStatus(HttpStatus.NOT_FOUND)

          return
        }

        voucherHandler(retrievedVoucher)
      })
  }

  const validateCreationPayload = payload => {
    const results = []

    if (!_.isNumber(payload.count) || payload.count < 1 || payload.count > 1000) {
      results.push(ERRORS.InvalidCount)
    }

    if (![DISCOUNTS.Percentage, DISCOUNTS.Value].includes(payload.discountType)) {
      results.push(ERRORS.InvalidDiscountType)
    }

    if (!_.isNumber(payload.discountValue) || payload.discountValue < 0) {
      results.push(ERRORS.InvalidDiscountValue)
    }

    if (!_.isNumber(payload.uses) || payload.uses < 1) {
      results.push(ERRORS.InvalidUseCount)
    }

    return results
  }
  const setDefaultValues = payload => {
    payload.count = payload.count || 1
    payload.uses = payload.uses || 1
  }

  const create = (req, res) => {
    const payload = Object.assign({}, req.body)
    setDefaultValues(payload);

    const validationResults = validateCreationPayload(payload)

    if (validationResults.length) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY)
      res.send({
        message: 'Invalid payload',
        validationErrors: validationResults,
      })

      return
    }

    const vouchersToCreate = _.range(payload.count).map(() => (Object.assign({
      campaign: payload.campaign,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      usesLeft: payload.uses,
    }, campaigns.createVoucherFor(payload.campaign))))

    Voucher.create(vouchersToCreate, (error, createdVouchers) => {
      if (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        res.send({
          message: error.message,
        })

        return
      }

      res.status(HttpStatus.CREATED)
      res.send(getCodes(createdVouchers))
    })
  }


  const getSingle = (req, res) => {
    getVoucherHandler(req, res, retrievedVoucher => {
      res.json(prepareVoucherRepresentation(retrievedVoucher))
    })
  }

  const use = (req, res) => {
    getVoucherHandler(req, res, retrievedVoucher => {
      if (!isUsable(retrievedVoucher)) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY)
        res.send(ERRORS.UsingInvalidVoucher)

        return
      }

      retrievedVoucher.usesLeft -= 1
      retrievedVoucher.save(updateError => {
        if (updateError) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          res.send(updateError.message)
        }

        res.sendStatus(HttpStatus.NO_CONTENT)
      })
    })
  }

  return {
    create,
    getSingle,
    use,
  }
}

module.exports = vouchers
