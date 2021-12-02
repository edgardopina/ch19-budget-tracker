const router = require('express').Router(); //* import express router
const Transaction = require('../models/transaction.js'); //* import model

//* CREATE one transaction
router.post('/api/transaction', ({ body }, res) => {
   Transaction.create(body)
      .then(dbTransaction => {
         res.json(dbTransaction);
      })
      .catch(err => {
         res.status(404).json(err);
      });
});

//* CREATE many transactions at once
router.post('/api/transaction/bulk', ({ body }, res) => {
   Transaction.insertMany(body)
      .then(dbTransaction => {
         res.json(dbTransaction);
      })
      .catch(err => {
         res.status(404).json(err);
      });
});

//* READ all transactions
router.get('/api/transaction', (req, res) => {
   Transaction.find({})
      .sort({ date: -1 }) //* sorts records by date desc
      .then(dbTransaction => {
         res.json(dbTransaction);
      })
      .catch(err => {
         res.status(404).json(err);
      });
});

module.exports = router;
