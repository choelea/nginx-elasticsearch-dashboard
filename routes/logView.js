var express = require('express');
var router = express.Router();
const es = require('../elasticsearchUtil')

/* GET home page. */
router.get('/topfunctions', function (req, res, next) {
  res.render('index');
});

router.get('/all', async function (req, res, next) {
  const dsl = {
    "query": {"match_all": {}}
  }
  const result  = await es.search(dsl)
  console.log(result)
  res.render('pages/all', result);
});

module.exports = router;
