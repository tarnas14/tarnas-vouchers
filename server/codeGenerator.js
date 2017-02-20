const crypto = require('crypto')

module.exports = () => ({
  forCampaign: campaign => `${campaign.toUpperCase()}_${crypto.randomBytes(8).toString('hex')}`
})
