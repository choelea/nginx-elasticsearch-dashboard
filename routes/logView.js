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
        "requestCount" : { "terms" : { "field" : "request_url","size":1000 } }
    }
}
  const result  = await es.search(dsl)
  res.render('pages/topAccess', result.aggregations.requestCount);
});

router.get('/topSlowResponse', async function (req, res, next) {
  const dsl = {
    "sort" : [
        { "upstream_response_time" : {"order" : "desc"}}
    ],
    "size":1000,
    "query": { "match_all": {}}    
  }
  const result  = await es.search(dsl)
  // res.render('pages/topSlowResponse', {hits:removeDuplicated(result.hits.hits)});
  res.render('pages/topSlowResponse', result.hits);
});

router.get('/statusquery', async function (req, res, next) {
  const status = req.query.status||200
  const size = req.query.size || 100
  const dsl = {    
      size,
      "query": {  
        "match" : {
                status
            }
      },
  }
  const result  = await es.search(dsl)
  res.render('pages/commonList', {hits:result.hits.hits,status,size});
});

router.get('/requestHits', async function (req, res, next) {  
  res.render('pages/requestHits', {});
});

router.post('/requestHits', async function (req, res, next) {
  const url = req.body.url;
  const size = req.body.size;
  const dsl = {
    "sort" : [
          { "upstream_response_time" : {"order" : "desc"}}
      ],
    "query": {  
      "match" : {
              "request_url": url
          }
    },
    size    
  }
  const result  = await es.search(dsl)
  res.render('pages/requestHits', {list:result.hits,url,size});
});


function removeDuplicated(arr) {
  const map = new Map();
  arr.map(el => {
      if (!map.has(el._source.request_url)) {
          map.set(el._source.request_url, el);
      }
  });
  return [...map.values()];
}
module.exports = router;
