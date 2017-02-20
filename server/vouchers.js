const HttpStatus = require('http-status')
const _ = require('lodash')

const codeGeneratorFactory = require('./codeGenerator')
const codeGenerator = codeGeneratorFactory()

const DISCOUNTS = {
  Percentage: 0,
  Value: 1,
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

const acceptableCount = count => count >= 1 && count <= 1000

const vouchers = mongoose => {
  const Voucher = getModel(mongoose)

  const create = (req, res) => { 
    const {discountType, discountValue, uses, campaign, count = 1} = req.body

    if (!acceptableCount(count)) {
      res.sendStatus(HttpStatus.UNPROCESSABLE_ENTITY)

      return
    }

    const vouchersToCreate = _.range(count).map(_ => ({
      campaign,
      code: codeGenerator.forCampaign(campaign)
    }))

    Voucher.create(vouchersToCreate, error => {
      if (error) {
        res.status(HttpStatus.BAD_REQUEST)
        res.send({
          message: error.message,
          validationErrors: error.errors
        })

        return
      }

      res.sendStatus(HttpStatus.CREATED)
    })
  }

  return {
    create
  }
}

module.exports = vouchers
