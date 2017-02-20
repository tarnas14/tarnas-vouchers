const moment = require('moment')

const campaignTemplates = {
  XMAS: {
    from: moment.utc([2017, 10, 12]),
    to: moment.utc([2017, 11, 25]),
  },
  SNOWBOARD_SALE: {
    from: moment.utc([2017, 5, 1]),
    to: moment.utc([2017, 7, 31]),
  },
  HALLOWEEN: {
    from: moment.utc([2017, 1, 14]),
    to: moment.utc([2017, 10, 1]),
  }
}

module.exports = {
  createVoucherFor: campaignName => Object.keys(campaignTemplates).includes(campaignName) 
    ? {
      usableFrom: campaignTemplates[campaignName].from,
      expiresAt: campaignTemplates[campaignName].to,
    }
    : {}
}
