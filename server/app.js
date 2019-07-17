var express = require('express');
var PouchDB = require('pouchdb');
var cors = require('cors');
var bodyParser = require('body-parser');
var SuperLogin = require('superlogin');
var passport = require('passport');
var http = require('http');
var AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create application/json parser
var jsonParser = bodyParser.json();

var configuration = {
  dbServer: {
    protocol: 'http://',
    host: 'localhost:5984',
    user: 'admin',
    password: 'admin',
    userDB: 'sl-users',
    couchAuthDB: '_users'
  },
  mailer: {
    fromEmail: 'example@gmail.com',
    options: {
      service: 'Gmail',
        auth: {
          user: '',
          pass: ''
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
    }
  },
  providers: {
    azure: {
        credentials:{
            clientID: '',
            clientSecret: '',
            callbackURL: 'http://localhost:3000/auth/openid/return',
            tenant: ''
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
