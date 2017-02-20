const HttpStatus = require('http-status')
const _ = require('lodash')

const codeGeneratorFactory = require('./codeGenerator')
const codeGenerator = codeGeneratorFactory()

const DISCOUNTS = {
  Percentage: 0,
  Value: 1,
}

const ERRORS = {
  UsingInvalidVoucher: 'Provided voucher is invalid',
}

const getModel = mongoose => {
  const voucherSchema = new mongoose.Schema({
    campaign: {
      type: String,
      required: [true],
    },
    code: {
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
  })

  return mongoose.model('Voucher', voucherSchema)
}

const vouchers = mongoose => {
  const Voucher = getModel(mongoose)

  const getCodes = vs => vs.map(v => v.code)
  const isValid = voucher => voucher.usesLeft > 0
  const prepareVoucherRepresentation = voucher => ({
    campaign: voucher.campaign,
    code: voucher.code,
    discountValue: voucher.discountValue,
    discountType: voucher.discountType,
    valid: isValid(voucher),
  })

  const getVoucherHandler = (req, res, voucherHandler) => {
    Voucher
      .findOne({code: req.params.code})
      .exec((error, retrievedVoucher) => {
        if (error) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          res.send(error.message)

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

    const errors = {
      invalidCount: 'Invalid voucher count specified',
      invalidDiscountType: 'Discount Type not recognized',
      invalidDiscountValue: 'Discount Value not valid',
      invalidUseCount: 'Voucher should be usable at least once',
    }

    if (!_.isNumber(payload.count) || payload.count < 1 || payload.count > 1000) {
      results.push(errors.invalidCount)
    }

    if (![0, 1].includes(payload.discountType)) {
      results.push(errors.invalidDiscountType)
    }

    if (!_.isNumber(payload.discountValue) || payload.discountValue < 0) {
      results.push(errors.invalidDiscountValue)
    }

    if (!_.isNumber(payload.uses) || payload.uses < 1) {
      results.push(errors.invalidUseCount)
    }

    return results
  }

  const create = (req, res) => {
    const payload = Object.assign({}, req.body)
    payload.count = payload.count || 1

    const validationResults = validateCreationPayload(payload)

    if (validationResults.length) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY)
      res.send({
        message: 'Invalid payload',
        validationErrors: validationResults,
      })

      return
    }

    const vouchersToCreate = _.range(payload.count).map(() => ({
      campaign: payload.campaign,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      code: codeGenerator.forCampaign(payload.campaign),
      usesLeft: payload.uses,
    }))

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
      if (!isValid(retrievedVoucher)) {
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
