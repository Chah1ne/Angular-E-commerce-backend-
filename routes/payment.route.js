const express = require('express');
const router = express.Router();

const Stripe = require('stripe')('sk_test_51OHjGlL3dacZucodyDAsOWNQD64L7yA1AZBnK44vvqd9KfhCUY7sDXWrc9irRVoZPqMeMcY7qAhPyqFhfHk8CzPw00TDk0l1uw');

router.post('/', async (req, res) => { console.log(req.body)
    let status, error;
    const { token, amount } = req.body;
    try {
      await Stripe.charges.create({
        source: token.id,
        amount,
        currency: 'usd',
      });
      status = 'success';
    } catch (error) {
      console.log(error);
      status = 'Failure';
    }
    res.json({ error, status });
  });

module.exports = router;

