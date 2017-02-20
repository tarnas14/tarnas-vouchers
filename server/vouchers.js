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

  const acceptableCount = count => count >= 1 && count <= 1000
  const getCodes = vs => vs.map(v => v.code)

  const create = (req, res) => { 
    const {discountType, discountValue, uses, campaign, count = 1} = req.body

    if (!acceptableCount(count)) {
      res.sendStatus(HttpStatus.UNPROCESSABLE_ENTITY)

      return
    }

    const vouchersToCreate = _.range(count).map(() => ({
      campaign,
      code: codeGenerator.forCampaign(campaign),
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

  const isValid = voucher => voucher.usesLeft > 0

  const prepareVoucherRepresentation = voucher => ({
    campaign: voucher.campaign,
    code: voucher.code,
    discountValue: voucher.discountValue,
    discountType: voucher.discountType,
    valid: isValid(voucher),
  })

  const getSingle = (req, res) => {
    Voucher
      .find({code: req.params.code})
      .exec((error, retrievedVouchers) => {
        if (error) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          res.send(error.message)

          return
        }

        if (!retrievedVouchers.length) {
          res.sendStatus(HttpStatus.NOT_FOUND)

          return
        }

        res.json(prepareVoucherRepresentation(retrievedVouchers[0]))
      })
  }

  const use = (req, res) => {
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

        if (!isValid(retrievedVoucher)) {
          res.status(HttpStatus.UNPROCESSABLE_ENTITY)
          res.send(ERRORS.UsingInvalidVoucher)

          return
        }

        retrievedVoucher.usesLeft -= 1
        retrievedVoucher.save(updateError => {
          if (updateError) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            res.send(error.message)
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
