


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