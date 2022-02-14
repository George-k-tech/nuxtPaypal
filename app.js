const express = require('express');
const ejs = require('ejs')
const paypal = require('paypal-rest-sdk');
const res = require('express/lib/response');

paypal.configure({
'mode': 'sandbox', //sandbox or live
'client_id': 'ATjBFhL7WxnTGZSjINg4gcyutKn19fKuLWSRLCzeaZrgH0XTV_AIz6ccEJhwn5tC5Ri0TdyPKjQxOthz',
'client_secret': 'EL9uuhjTrvHfa_qquRLBevRlHtNP8T6LwvLOoZ8Ua_I9s3mMDYZPA8lrCI1xot1N7ZudSNW0IENv0m22',

});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "phones",
                    "sku": "item",
                    "price": "100.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "100.00"
            },
            "description": "This is payment for a phone purchased."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
           for(let i = 0;i <payment.links.length; i++){
            if(payment.links[i].rel == 'approval_url'){
                res.redirect(payment.links[i].href);
            }
           }
        }
    });

});

app.get('/success', (req, res)=> {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {

        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency":"USD",
                "total": "100.00"
            }
        }]
    };

    paypal.payment.execute(paymentId,execute_payment_json,function(error, payment) {
        if(error){
            console.log(error.response);
            throw error;
        }else {
            console.log(JSON.stringify(payment));
            res.send('success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('cancelled'));



app.listen(3000, () => console.log('Server started'))