const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const axios = require("axios");
const config = require('./config/config')
const crypto = require('crypto');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/big', (req, res) => {
res.redirect('http://localhost:8080/');
})

app.post('/api/senddonation', (req, res) => {
    const data = req.body
    const hmac = crypto.createHmac('sha256', config.sign_key)
    const sign = hmac.update([data.merchant_id, data.order_id.toString(), data.amount, null, null, null].join('.')).digest('base64')
    axios({
        method: 'POST',
        url: 'https://octopus-unify.digipay.dev/api/v1/redirect/sale',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
          merchant_id: data.merchant_id,
          order_id: data.order_id.toString(),
          amount: data.amount,
          url_redirect: config.url_redirect,
          url_notify: config.url_notify,
          payment_description: '',
          currency: data.currency,
          promotion: data.promotion,
          reference_1: data.reference_1,
          reference_2: data.reference_2,
          reference_3: data.reference_3,
          reference_4: data.reference_4,
          reference_5: data.reference_5,
          payment_type: data.payment_type,
          customer_email: data.customer_email,
          api_id: config.api_id,
          api_key: config.api_key,
          sign_key: config.sign_key,
          sign: sign
        },
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status <= 302
      })
      .then((response) => {
        const redirectUrl = response.headers.location
        const responseData = {
                                "res_code": "0000",
                                "redirectUrl": redirectUrl,
                                }
        res.status(200).json(responseData)
        // window.location.href = redirectUrl
        // Redirect(redirectUrl)
      }).catch(err => res.status(0000).json(err))

})

app.listen(4020, () => {
  console.log('Start server at port 4020.')
})