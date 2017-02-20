const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const vouchersFactory = require('./vouchers')

const config = require('./config')
const PORT = config.PORT || 3000

mongoose.Promise = global.Promise
mongoose.connect(config.mongoAddress)
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const vouchers = vouchersFactory(mongoose)
app.post('/api/vouchers/create', vouchers.create)
app.get('/api/vouchers/:code', vouchers.getSingle)

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
