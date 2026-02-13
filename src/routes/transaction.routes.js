const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateTransaction } = require('../middlewares/validateTransaction.middleware');
const {
  create,
  list,
  getOne,
  update,
  remove
} = require('../controllers/transaction.controller');

const router = express.Router();

// All /transactions routes require auth
router.use(authMiddleware);

router
  .route('/')
  .post(validateTransaction, create)
  .get(list);

router
  .route('/:id')
  .get(getOne)
  .patch(validateTransaction, update)
  .delete(remove);

module.exports = router;


