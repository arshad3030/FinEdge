const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateBudget } = require('../middlewares/validateBudget.middleware');
const {
  create,
  list,
  getOne,
  update,
  remove
} = require('../controllers/budget.controller');

const router = express.Router();

router.use(authMiddleware);

router
  .route('/')
  .post(validateBudget, create)
  .get(list);

router
  .route('/:id')
  .get(getOne)
  .patch(validateBudget, update)
  .delete(remove);

module.exports = router;

