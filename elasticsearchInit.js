const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
const INDEX_NAME = "nginx-log"

async function init(){
    var result = await client.indices.exists({
        index:INDEX_NAME
    })
    if(result.statusCode == 404){
        console.log(`Started creating index [${INDEX_NAME}]`)
        result = await client.indices.create({
            index:INDEX_NAME,
            body:{
                "settings" : {
                    "number_of_shards" : 3
                },
                "mappings" : { 
                    '_doc' : {
                        "properties" : {
                            "@timestamp": { "type" : "date" },
                            "http_host": { "type" : "keyword" },
                            "remote_addr": { "type" : "keyword" },
                            "request_length": { "type" : "long" },
                            "request_method": { "type" : "keyword" },
                            "request_uri": { "type" : "text" },
                            "request_time": { "type" : "float" },
                            "server_name": { "type" : "keyword" },
                            "status": { "type" : "integer" },
                            "user_agent": { "type" : "text" },
                            "http_referer": { "type" : "keyword" },
                            "upstream_response_time": { "type" : "float" },
                            "upstream_addr": { "type" : "keyword" },
                            "upstream_connect_time": { "type" : "float" }
                        }
                    }
                }
            }
        }) 
        
    }
    initData();
}

function initData(){
    console.log(`Started indexing nginx json log into index [${INDEX_NAME}]`)
        
    var folderPath = path.join(__dirname, 'data/nginx')    
    var fileNames = fs.readdirSync(folderPath)
    fileNames.forEach((file)=>{
        var lineReader = readline.createInterface({
            input: fs.createReadStream(path.join(folderPath,file))
        });
        var documents = [ ]
        lineReader.on('line', function (line) {
            documents.push({ index: { _index: INDEX_NAME, _type: '_doc' } })
            documents.push(JSON.parse(line));
        });
        lineReader.on('close', () => {
            bulk(documents).catch(console.log)
        });        
    })
}

async function bulk(documents) {
    const result = await client.bulk({
        refresh: true,
        body: documents
    })
    if (result.statusCode==200) {
        console.log('-------------Finished one bulk---------------------')
    }else{
        console.log('-----------------bulk response begins------------------')
        console.log(result)
        console.log('-----------------bulk response ends------------------')        
    }
}
  
  
module.exports = init;

