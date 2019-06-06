var express = require('express');
var router = express.Router();
const es = require('../elasticsearchUtil')

/* GET home page. */
router.get('/simplequery', function (req, res, next) {
  res.render('pages/dslquery');
});

router.post('/simplequery', async function (req, res, next) {
  const dsl = req.body.dsl
  try{
    const result  =  await es.search(dsl);
    res.render('pages/dslquery',{hits:result.hits,dsl});
  }catch(error){
    next(error)
  }
});

router.get('/aggquery', function (req, res, next) {
  res.render('pages/aggquery');
});
router.post('/aggquery', async function (req, res, next) {
  const dsl = req.body.dsl
  const result  = await es.search(dsl);
  res.render('pages/aggquery',{hits:result.hits,agg:JSON.stringify(result.aggregations),dsl});
});

module.exports = router;
