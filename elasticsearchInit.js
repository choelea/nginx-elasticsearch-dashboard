const fs = require('fs');
const readline = require('readline');
const path = require('path');
const replaceall = require("replaceall");
const UrlPattern = require('url-pattern');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
const INDEX_NAME = "nginx-log"

const pdpPattern = new UrlPattern('/product(/:code).html');
async function init(){
    try{
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
                                "requestOn":{"type":"date"},
                                "http_host": { "type" : "keyword" },
                                "remote_addr": { "type" : "keyword" },
                                "request_length": { "type" : "long" },
                                "request_method": { "type" : "keyword" },
                                "request_uri": { "type" : "keyword" },
                                "request_url": { "type" : "keyword" },
                                "request_function": { "type" : "keyword" },
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
            
            initData();
        }
    } catch(error){
        console.error(error);
    };
}

function initData(){
    console.log(`Started indexing nginx json log into index [${INDEX_NAME}]`)
        
    var folderPath = path.join(__dirname, 'data/nginx')    
    var fileNames = fs.readdirSync(folderPath)
    fileNames.forEach((file)=>{
        console.log(`Started indexing nginx json log [${file}] into index [${INDEX_NAME}]`)
        var lineReader = readline.createInterface({
            input: fs.createReadStream(path.join(folderPath,file))
        });
        var documents = [ ]
        lineReader.on('line', function (line) {
            try{
                var doc =JSON.parse(replaceall('\\','\\\\', line))
                if(!doc.request_uri.startsWith("/resources") && !doc.request_uri.startsWith("/Autodiscover/Autodiscover.xml")){
                    if(pdpPattern.match(doc.request_uri)){
                        doc.request_function='pdp'
                    } else {
                        doc.request_function='other'
                    }
                    doc.requestOn=doc['@timestamp']
                    doc.request_url=doc.server_name + doc.request_uri
                    documents.push({ index: { _index: INDEX_NAME, _type: '_doc' } })
                    documents.push(doc);
                }
            } catch (error){
                console.error(`Failed to parse line json: ${line}` )
            }
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
        console.log('-------------Finished one bulk successfully---------------------')
    }else{
        console.log('-----------------bulk response begins------------------')
        console.log(result)
        console.log('-----------------bulk response ends------------------')        
    }
}
  
  
module.exports = init;

