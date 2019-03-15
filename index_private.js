const rs = require('jsrsasign');
const util = require('util');
const crypto = require('crypto');
const conf = require('./config/config');

let oauth_nonce = null;
let oauth_timestamp = null;
// let CONSUMER_KEY = null;
let CONSUMER_KEY = conf.CONSUMER_KEY;

let oauth_signature = null;

//Create signature
// let URL = conf.URL;
let URL = null;

//create private app
function createPrivateApp() {

}

//get consumer key
function getConsumerKey() {

}


//Create nonce
function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16)
    });
} 

//Create signature(private app)
function createSignature(method, endpoint) {
    oauth_nonce = createGuid();
    oauth_timestamp = Math.floor(Date.now() / 1000);

    let signatureBase = method + "&"
    + encodeURIComponent(endpoint) + "&"
    + encodeURIComponent("oauth_consumer_key=" + CONSUMER_KEY + 
                         "&oauth_nonce=" + oauth_nonce + "&oauth_signature_method=RSA-SHA1&oauth_timestamp=" + 
                         oauth_timestamp + "&oauth_token=" + CONSUMER_KEY + "&oauth_version=1.0");

    //Sign signature
    let rsa_key = require('fs').readFileSync(conf.privateKeyPath);
    let signer = crypto.createSign("RSA-SHA1");
    signer.update(signatureBase);
    oauth_signature = encodeURIComponent(signer.sign(rsa_key, output_format = "base64"));
}

exports.getAccountingHeader = ((req, context, events, next) => {  
    // console.log("Start request....");
    URL = context.vars['target'];
    createSignature(req.method, URL+"/api.xro/2.0/"+context.vars['$loopElement']);

    //Prep the Authorization header
    authHeader = "OAuth oauth_consumer_key=\"" + CONSUMER_KEY + "\",oauth_token=\"" + CONSUMER_KEY + "\",oauth_signature_method=\"RSA-SHA1\",oauth_signature=\"" + oauth_signature + "\",oauth_timestamp=\"" + oauth_timestamp + "\",oauth_nonce=\"" + oauth_nonce + "\",oauth_version=\"1.0\"";
    req.headers['accept'] = 'application/json';
    req.headers['Authorization'] = authHeader;

    return next();
});

exports.getPayrollHeader = ((req, context, events, next) => {  
    // console.log("Start request....");
    URL = context.vars['target'];
    createSignature(req.method, URL+"/payroll.xro/2.0/"+context.vars['$loopElement']);

    //Prep the Authorization header
    authHeader = "OAuth oauth_consumer_key=\"" + CONSUMER_KEY + "\",oauth_token=\"" + CONSUMER_KEY + "\",oauth_signature_method=\"RSA-SHA1\",oauth_signature=\"" + oauth_signature + "\",oauth_timestamp=\"" + oauth_timestamp + "\",oauth_nonce=\"" + oauth_nonce + "\",oauth_version=\"1.0\"";
    req.headers['accept'] = 'application/json';
    req.headers['Authorization'] = authHeader;

    return next();
});

exports.generateErrors = ((req, context, events, next) => {
    URL = context.vars['target'];
    createSignature(req.method, URL+"/api.xro/2.0/organisation");

    //Prep the Authorization header
    authHeader = "OAuth oauth_consumer_key=\"" + CONSUMER_KEY + "\",oauth_token=\"" + CONSUMER_KEY + "\",oauth_signature_method=\"RSA-SHA1\",oauth_signature=\"" + oauth_signature + "\",oauth_timestamp=\"" + oauth_timestamp + "\",oauth_nonce=\"" + oauth_nonce + "\",oauth_version=\"1.0\"";
    req.headers['accept'] = 'application/json';
    req.headers['Authorization'] = authHeader;

    return next();
})

exports.logResponseHeaders = ((req, res, context, events, next) => {
    // console.log("Start response....");
    if([200, 300].indexOf(res.statusCode) < 0) {
        logObject({
            url: req.url,
            statusCode: res.statusCode,
            headers: res.headers,
            responseBody: res.body
        });
    }
    if (!(res.headers['x-response-time'])) {
        return next();
    }

    let responseTime = Number(res.headers['x-response-time'].split('ms')[0]);
    events.emit('customStat', { stat: 'response_time', value: responseTime });

    console.log('responseTime....', responseTime);    
    return next();
});

const logObject = (obj) => {
    console.log(util.inspect(obj, {showHidden: false, depth: null}))
}
