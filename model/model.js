const mongoose=require('mongoose');
mongoose.Promise=global.Promise;

mongoose.connect('mongodb://localhost:27017/mongobase',(err,out)=>{
  if(err)
  {
    console.log('error occurs'+err);
  }
  else{
    console.log('connected to database');
  }
}, { useMongoClient: true });
/* GET home page. */
var schema=mongoose.Schema ;
var myschema=new schema({
  name : String,
  email:String,
  password:String,
  address:String,
  etherBal: Number
});
var model= mongoose.model('register',myschema);

module.exports=model;
