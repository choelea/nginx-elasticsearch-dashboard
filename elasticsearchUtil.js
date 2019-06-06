const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
const INDEX_NAME = "nginx-log"

async function search(query) {
    const {body} = await client.search({
        index: INDEX_NAME,
        type:'_doc',
        body:query
    })        
    return body
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
  
  
module.exports = {bulk, search};

