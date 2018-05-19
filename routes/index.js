var express = require('express');
var router = express.Router();
var path = require('path');
var model=require('../model/model');
var web3 =require('web3');
var dialog = require('dialog');
const Joi = require('joi');

var myweb=new web3(new web3.providers.HttpProvider('http://localhost:8545'));

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next){
  var data = {
    username: req.body.name,
    password: req.body.password,
   email : req.body.email
  };
  const schema1= Joi.object().keys({
      username: Joi.string().required(),
     password: Joi.string().required(),
      email: Joi.string().required()
  }).with('username', ['password', 'email']);

    Joi.validate( data , schema1,{ abortEarly: false }, function (err, value){
     console.log(value);
      if (err) {

            console.log(err);
            dialog.info('All fields are required!!');

          }
       else {

    model.findOne({name:req.body.name},(err,out)=>{
     console.log(out);
       if(err)
        {
      console.log(err);
       res.redirect('/register');
        }

      else if(out==null){


            var coinbase=myweb.personal.newAccount(req.body.password);
            var mywallet = new model({
           name : req.body.name ,
           email:req.body.email,
           password:req.body.password,
           address:coinbase,
           etherBal:myweb.eth.getBalance(coinbase)/1000000000000000000
           });
            console.log(mywallet);
            mywallet.save((err,out)=>{
               if(err)
                {
                 console.log('error');
                 }
                else
                {
                    console.log('saved'+out);
                    dialog.info('Account created successfully');
                    res.render('index');
                  }

           });

         }
         else
          {
         console.log('username already exists');
         dialog.info('Username already exists');
         res.redirect('/register');
       }
     })
  }
  });
  });
router.post('/login',function(req,res,next){
 model.findOne({name:req.body.username,password:req.body.password},(err,out)=>{

  //console.log(out);
    if(err)
    {
      console.log('error!!!!!!'+err);

    }
    else if(out==null){
      console.log('invalid login')
       dialog.info('invalid login');
      res.render('../views/login');
    }
    else {
      model.updateOne({address:out.address},{$set: {etherBal: myweb.eth.getBalance(out.address)/1000000000000000000 }}, (err,out1) =>{
        console.log(out1);
        if(err)
        {
          console.log('error!!!!!!'+err);

        }
        else {console.log('EtherBalance updated');}
      });
      var details={
        addr : out.address,
        value :out.etherBal,
        name: out.name
      };
      console.log(details);
      res.render('details',{det :details});
    }

});
});
router.post('/welcome/:add/',(req,res,next)=>{

    model.findOne({address:req.params.add}, (err, outp)=>{
      console.log(outp);
      model.findOne({name:req.body.to},(err,output)=>{
      console.log(output);
      if(err)
      {
      console.log(err);
      }
    else if(output==null)
      {
      console.log('username not exists');
      dialog.info('Username Does not exists');
      var details = {
       addr: outp.address,
       value: outp.etherBal,
       name: outp.name

      }
      res.render('details',{det :details});
      }
    else
      {
        if(outp.etherBal>= req.body.ether && outp.name != req.body.to )
        {
        myweb.personal.unlockAccount(req.params.add,outp.password);
        myweb.personal.unlockAccount(output.address,output.password);

        myweb.eth.sendTransaction({
          from:req.params.add,
          to: output.address,
          value:myweb.toWei(req.body.ether,"ether"),

        });

        console.log("Done");
        var info ={
        addr:  req.params.add,
        name: outp.name,
        value: myweb.eth.getBalance(req.params.add)

      };
      var info1={
        name: req.body.to,
        value: req.body.ether
      };
      model.updateOne({address:req.params.add},{$set: {etherBal: myweb.eth.getBalance(req.params.add)/1000000000000000000 }});
      model.updateOne({address:output.address},{$set: {etherBal: myweb.eth.getBalance(output.address)/1000000000000000000 }});
      res.render('account',{ myinfo:info,yourinfo:info1});
     }
    else if(outp.etherBal<req.body.ether)
     {
      console.log('Low Ether Balance');
      dialog.info('Low Ether Balance');
      var details = {
       addr: outp.address,
       value: outp.etherBal,
       name: outp.name

      }
      res.render('details',{det :details});
    }
    else if (outp.name === req.body.to) {
      console.log('Transaction cannot be done to same account');
      dialog.info('Transaction cannot be done to same account');
      var details = {
       addr: outp.address,
       value: outp.etherBal,
       name: outp.name

      }
      res.render('details',{det :details});
    }
    router.get('/details',(req,res,next)=>{
      var details = {
       addr: outp.address,
       value: outp.etherBal,
       name: outp.name

      }
      res.render('details',{det :details});
    })
  }

  })
});
});
   router.get('/welcome/:add',(req,res,next)=>{
     res.render('welcome');
   });

module.exports = router
