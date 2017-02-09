const etl = require('etl');
const S3Stream = require('s3-upload-stream');
const AWS = require('aws-sdk');

module.exports = function(stream,argv) {
  argv = Object.assign({},argv);
  argv.accessKeyId = argv.target_accessKeyId;
  argv.secretAccessKey = argv.target_secretAccessKey;

  argv.target_bucket = argv.target_bucket ||  argv.target_collection;
  argv.target_key = argv.target_key ||  argv.target_indextype;

  const s3Stream = S3Stream(new AWS.S3(argv));

  const upload = s3Stream.upload({
    Bucket : argv.target_bucket,
    Key: argv.target_key
  });

  const out = etl.map();
  
  stream
    .pipe(etl.stringify(0,null,true))
    .pipe(upload)
    .on('error', e=> out.emit('error',e))
    .on('uploaded',() =>  out.end());

  return out;
};