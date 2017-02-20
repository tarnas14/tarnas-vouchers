const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')

const {authorizedHandler} = require('./authorization')
const vouchersFactory = require('./vouchers')

const config = require('./config')
const PORT = config.PORT || 3000

mongoose.Promise = global.Promise
mongoose.connect(config.mongoAddress)
const app = express()
app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const vouchers = vouchersFactory(mongoose)
app.post('/api/vouchers/', authorizedHandler(vouchers.create))
app.get('/api/vouchers/:code', authorizedHandler(vouchers.getSingle))
app.post('/api/vouchers/:code', authorizedHandler(vouchers.use))

const CLIENT_BUILD_PATH = path.resolve(__dirname, '../build')
app.use('/', express.static(CLIENT_BUILD_PATH))
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../build', 'index.html')))

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
