var express = require('express');
var router = express.Router();
const es = require('../elasticsearchUtil')

/* GET home page. */
router.get('/topfunctions', function (req, res, next) {
  res.render('index');
});

router.get('/topRequest', async function (req, res, next) {
  const dsl = {
    "size": 0,
    "aggs" : {
        "requestCount" : { "terms" : { "field" : "request_url","size":100 } }
    }
}
  const result  = await es.search(dsl)
  console.log(result.aggregations.requestCount)
  res.render('pages/topAccess', result.aggregations.requestCount);
});

router.get('/topSlowResponse', async function (req, res, next) {
  const dsl = {
    "sort" : [
          { "upstream_response_time" : {"order" : "desc"}}
      ],
      "size":200,
    "query": { "match_all": {}}
    
  }
  const result  = await es.search(dsl)
  res.render('pages/topSlowResponse', result.hits);
});

module.exports = router;
