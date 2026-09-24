/*
 MIT License

Copyright contributors to the IBM Verify Developer Portal Sample App for Resource Owner Password Credentials (ROPC) Grant Type project

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute,
 sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial
 portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const express = require("express");
const { Issuer } = require("openid-client");
const rls = require("readline-sync");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

console.log(`=========================================`);
console.log(`Dev portal sample app for Resource Owner \nPassword Credentials (ROPC) grant type.\n`);
console.log(`Tenant: ${process.env.TENANT_URL}`);
console.log(`client ID: ${process.env.CLIENT_ID}`);
const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scope: process.env.SCOPE,
};
console.log(`\n`);
// When TEST_USERNAME / TEST_PASSWORD are set (CI / automated testing),
// skip the interactive prompts so readline-sync does not try to open /dev/tty.
const username = process.env.TEST_USERNAME || rls.question("Username: ");
const password = process.env.TEST_PASSWORD || rls.question("Password: ", { hideEchoBack: true });
console.log(`\nAuthenticating...\n`);

let tenantURL = process.env.TENANT_URL;
if(tenantURL.endsWith('/')) {
  tenantURL = `${tenantURL}oauth2/.well-known/openid-configuration`
} else {
  tenantURL = `${tenantURL}/oauth2/.well-known/openid-configuration`
}

Issuer.discover(tenantURL)
  .then((issuer) => {
    const client = new issuer.Client({
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    client
      .grant({
        grant_type: "password",
        username: username,
        password: password,
        scope: "read:sample",
      })
      .then((response) => {
        client.userinfo(response.access_token).then((userinfo) => {
          console.log(`Successfully retrieved user information\n`);
          console.table(userinfo);
          console.log(`\n\n=========================================\n\n`);
        });
      })
      .catch((error) => {
        console.log('Error description: ', error.error_description || 'Unknown Error');
      });
  })
  .catch((error) => {
    console.error("Failed to discover issuer:", error);
  });