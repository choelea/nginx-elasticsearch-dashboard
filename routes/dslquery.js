var express = require('express');
var router = express.Router();
const es = require('../elasticsearchUtil')

/* GET home page. */
router.get('/simplequery', function (req, res, next) {
  res.render('pages/dslquery');
});

router.post('/simplequery', async function (req, res, next) {
  const dsl = req.body.dsl
  const result  = await es.search(dsl);
  res.render('pages/dslquery',{hits:result.hits,dsl});
});

module.exports = router;
