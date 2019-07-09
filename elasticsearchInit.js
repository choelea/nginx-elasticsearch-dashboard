const fs = require('fs');
const readline = require('readline');
const path = require('path');
const replaceall = require("replaceall");
const UrlPattern = require('url-pattern');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
const INDEX_NAME = "nginx-log"
const pdpPattern = new UrlPattern('/product(/:code).html');

var docCount = 0;
var fileSuccessCount = 0;
var fileFailedCount = 0;
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
                        "number_of_shards" : 1,
                        "number_of_replicas":0
                    },
                    "mappings" : { 
                        '_doc' : {
                            "properties" : {
                                "@timestamp": { "type" : "date"},
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
            
        }
        initData();
    } catch(error){
        console.error(error);
    };
}

async function initData(){
    console.log(`Started init data into [${INDEX_NAME}]`)
        
    var folderPath = path.join(__dirname, 'data/nginx/access')    
    var fileNames = fs.readdirSync(folderPath)

    for(i=0;i<fileNames.length;i++){
        var file= fileNames[i];
        var lines = fs.readFileSync(path.join(folderPath,file), 'utf-8').split('\n').filter(Boolean);
        var documents = [ ];
        console.log(`starting................${file}`)
        lines.forEach(line=>{
            if(line.length>3){
                try{
                    var doc =JSON.parse(replaceall('\\','\\\\', line))
                    if(!doc.request_uri.startsWith("/resources") && !doc.request_uri.startsWith("/Autodiscover/Autodiscover.xml")
                       && !doc.request_uri.startsWith("/group-buying") && !doc.server_name.startsWith("overseas-offices")){
                        if(pdpPattern.match(doc.request_uri)){
                            doc.request_function='pdp'
                        } else {
                            doc.request_function='other'
                        }
                        doc.requestOn=doc['@timestamp']
                        doc.upstream_response_time=getCorrectFloat(doc.upstream_response_time) 
                        doc.upstream_connect_time=getCorrectFloat(doc.upstream_connect_time)
                        //doc.request_time = getCorrectFloat(doc.request_time)
                        doc.request_url=doc.request_method+'-'+doc.server_name + doc.request_uri
                        documents.push({ index: { _index: INDEX_NAME, _type: '_doc' } })
                        documents.push(doc)
                        if(Number.isNaN(parseFloat(doc.request_time))){
                            console.log(doc.request_time)
                        }
                        docCount++;
                    }
                } catch (error){
                    console.error(error) 
                }
            }
        })
        console.log(`starting................${file}....having ${documents.length} documents`)
        await bulk(documents,file); 
    }
}

async function bulk(documents,file) {
    try{
        const result = await client.bulk({
            body: documents
        })
        if (result.statusCode==200) {
            fileSuccessCount ++
            console.log(`-------------Finished bulk ${file} successfully: total documents: ${docCount}  total finished files: ${fileSuccessCount}---------------------`)
            fs.unlinkSync(path.join(__dirname, 'data/nginx/access',file))
        }else{
            console.log('-----------------bulk response begins------------------')
            console.log(result)
            console.log('-----------------bulk response ends------------------')        
        }
    }catch(error){
        fileFailedCount++
        console.error(`Failed to bulk bulk ${file} with error:-----------${error}`)
    }
}
  
function getCorrectFloat(str){//https://docs.nginx.com/nginx/admin-guide/monitoring/logging/
    if(str.split(',').length>1){
        str = str.split(',').reduce(getSum,0.0)            
    }else if(str.split(';').length>1){
        str = str.split(';').reduce(getSum,0.0)
    }else if(str.split(' ').length>1){
        str = str.split(' ').reduce(getSum,0.0)
    }
    return parseFloat(str)
}
function getSum(total,current){
    return parseFloat(current.trim())+total
}

module.exports = init;

