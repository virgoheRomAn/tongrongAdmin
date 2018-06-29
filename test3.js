

var str = 'http://test.api.fabigbig.com:8888/api/extsign.api?app_id=401257&amp;v=&amp;timestamp=20180619160237&amp;transaction_id=449e70ba4dd94dce8bd1d358b2c07c10&amp;customer_id=DDD127AAE980DA8E&amp;contract_id=d2209be4fd5a486faeb28f99365cdc6d&amp;doc_title=%E6%B5%8B%E8%AF%95%E6%96%87%E6%A1%A3&amp;sign_keyword=test&amp;return_url=http://localhost:8080//fadada/returnExtSign&amp;notify_url=http://localhost:8080//fadada/returnExtSignNotify&amp;msg_digest=NTZEMTcwNjdCRkM5ODA4MTQzMjEwQUNGQTUzNUUyM0MyNDU0Q0I2Mg==';
var str2 = decodeURI(str);
console.log(str2);