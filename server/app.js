var express = require('express');
var PouchDB = require('pouchdb');
var cors = require('cors');
var bodyParser = require('body-parser');
var SuperLogin = require('superlogin');
var passport = require('passport');
var AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;

var app = express();
app.use(cors());

// create application/json parser
var jsonParser = bodyParser.json();

var configuration = {
  dbServer: {
    protocol: 'http://',
    host: 'localhost:5984',
    user: '',
    password: '',
    userDB: 'sl-users',
    couchAuthDB: '_users'
  },
  mailer: {
    fromEmail: 'gmail.user@gmail.com',
    options: {
      service: 'Gmail',
        auth: {
          user: 'gmail.user@gmail.com',
          pass: 'userpass'
        }
    }
  },
  security: {
    maxFailedLogins: 3,
    lockoutTime: 600,
    tokenLife: 86400,
    loginOnRegistration: true,
  },
  userDBs: {
    defaultDBs: {
      private: ['todo']
    },
    model: {
      supertest: {
        permissions: ['_reader', '_writer', '_replicator']
      }
    }
  },
  providers: {
    local: true, 
    azure: {
        credentials:{
            clientID: '3473aac8-046f-4e33-9915-414b2e9ed7da',
            clientSecret: 'srE/+YkoZk0p?BPLYTh6Vo56FQI[=5pA',
            callbackURL: 'http://localhost:3000/auth/openid/return',
            tenant: "mariuszdobrowolskistudentli.onmicrosoft.com"
        }
    }
  }
}

// Initialize SuperLogin
var superlogin = new SuperLogin(configuration);
superlogin.registerOAuth2('azure', AzureAdOAuth2Strategy);

// Mount SuperLogin's routes to our app
app.use('/auth', superlogin.router);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
