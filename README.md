


### 日期区间查询+排序
```
{
    "size":1000,
    "sort" : [
        { "@timestamp": {"order" : "asc"}}
    ],
    "query": {
        "range" : {
            "@timestamp" : {
                 "gte": "2019-06-03T21:20:00+08:00",
                 "lte": "2019-06-03T21:37:00+08:00",
                 "time_zone": "+08:00"
            }
        }
    }
}
```

## 前缀搜索
以`/admin`开头的log
```
{ "query": {
    "prefix" : { "request_uri": "/admin" }
  }
}
```

## 通配符
agent包含bot的log
```
{
    "query": {
        "wildcard": {
            "user_agent": {
                "value": "*bot*"
            }
        }
    }
}
```

## Boolean Query
```
{
  "query": {
    "bool" : {
      "must" : [
        {"match":  {"http_host" : "wcdn.okchem.com"}},
        {"match":{"request_uri":"/favicon.ico"}}
      ],
      "should": [
        {
          "wildcard": {
            "user_agent": {
                "value": "*bot*"
            }
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}
```

## 聚合
首页请求的平均响应时间
```
{
  
  "query": {  
    "match" : {
            "request_url": "GET-www.okchem.com/"
        }
  },
  "aggs" : {
        "avg_response" : {  
          "avg": {
              "field" : "upstream_response_time"
          }
        }
    },
  "size":0
}
```

## 聚合加排序
根据平均响应时间排倒序

```
{
  "size": 0,
  "aggs": {
    "per_url" : {
      "terms": {
        "field": "request_url"
      },
      "aggs": {
        "avg_reponse": {
          "avg": {
            "field": "upstream_response_time"
          }
        },
        "avg_reponse_sort": {
            "bucket_sort": {
                "sort": [
                  {"avg_reponse": {"order": "desc"}}
                ]
            }
        }
      }
    }
  }
}
```