<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a></br>
  <b>Example of mc app using secrets in service proxy</b>
</p>

## Install dependencies

For merchant-center-custom-application use `yarn install --frozen-lockfile`
For proxy use `npm ci`

## Instructions for local development

1.  Start the service application (in `proxy` directory of this repository) with `npm run start:dev`
2.  Use `localtunnel` with the following command: `npx localtunnel --port 8080 --print-requests`, you will get a url you will need later.  
    **NOTE** You can use ngrok as well but not the free version as you are not allowed to use the free version for commercial use.  
    the free version of ngrok also requires you to set an http request header.
3.  If you are using `localtunnel` you need to provide a `bypass-tunnel-reminder` header in the request, CORS enforcement will not allow you to do this in the browser and using a CORS plugin can break the mc app running locally.  
    See [Set up mitmproxy](#set-up-mitmproxy) to allow a local proxy to add these request headers.  
    start mitmproxy with the following command in the root of this repository: `mitmproxy -s addHeader.py -p 8800`.
4.  Set the `PROXY_URI` from step 2 in `merchant-center-custom-application/.env`
5.  Set the `initialProjectKey` in `merchant-center-custom-application/custom-application-config.mjs` to a project you have access to.  
    **IMPORTANT** Do not start the merchant center custom app unless you have set `initialProjectKey` correctly, starting the app with a project you don't have access to results in failing to log in  
    If this happened to you then first fix `custom-application-config.mjs`, re run the mc-app and log in (it will fail)  
    open dev tools (focus dev tools window by clicking on it) => press (cmd or ctrl) + shift + p => type `cookie` => choose `clear site data (including third-party cookies)` =>  
    type `javascript` => disable javascript => open http://localhost:3001 in the same tab =>  
    press (cmd or ctrl) + shift + p in dev tools => type `cookie` => choose `clear site data (including third-party cookies)` => (cmd or ctrl) + shift + p => type `javascript` =>  
    enable javascript => refresh page
6.  Start the merchant-center-custom-application with `yarn run start` in the `merchant-center-custom-application` directory
7.  If you are using `localtunnel` then use oxylabs extension in chrome to connect to your running mitmproxy to add the `bypass-tunnel-reminder` request header to your request (step 3)  
     **IMPORTANT** Do not forget to disconnect from the proxy when you shut down mitmproxy or chrome will report you are offline.

## Set up mitmproxy

1.  Install mitmproxy: https://docs.mitmproxy.org/stable/overview-installation/
2.  Start mitmproxy from the root of the proxy repo with: `mitmproxy -p 8800`
3.  For Chrome install oxylabs proxy extension then add and use proxy 127.0.0.1 port 8800  
    **IMPORTANT** If you use the proxy in chrome and mitmproxy isn't running chrome will say you are offline
4.  In Chrome open http://mitm.it/ while using the proxy to download the pem file (other platforms pem)
5.  In Chrome open settings -> privacy and security -> security -> manage certificates and import pem file  
    If you have trouble finding how to import the certificate you can google `mitmproxy import certificate chrome`
6.  Do not forget to disconnect to the proxy in Chrome using the oxylabs extension or Chrome will report you are offline.

## Instructions for deployment

1. In merchant center create a [custom merchant center application](https://docs.commercetools.com/merchant-center/managing-custom-applications)  
   You will not have the `Application URL` yet, you can fill out a dummy value (`https://not-yet` for example)  
   You can fill out `secure` in `Application entry point URI path`, it needs to be the same as `ENTRY_POINT_URI_PATH`in step 2.
2. In merchant center deploy the connector
   - merchant-center-custom-application configuration
     1. `CLOUD_IDENTIFIER` defaults to `gcp-eu`
     2. `CUSTOM_APPLICATION_ID` is the `Application ID` you got from step 1 (under `Configure Custom Applications`)
     3. `ENTRY_POINT_URI_PATH` you can put `secure` as an example value or what you provided as `Application entry point URI path` when you created the custom application in step 1.
     4. `PROXY_URI` you do not have this yet, you will get this after deploying, you can fill out `https://not-yet`
   - proxy configuration
     1. `CLOUD_IDENTIFIER` defaults to `gcp-eu` has to be the same as `CLOUD_IDENTIFIER` in `merchant-center-custom-application`
     2. `SECURE` any value, this will be in the response from the service application but would be kept secure in a production application.
3. After the connector has been deployed look for it in the merchant center (`connect` => `Manage connectors` => `Installations`)  
   or use the following url: https://mc.europe-west1.gcp.commercetools.com/account/organizations/ _your organization id_ /connect/manage/installations
4. Under `proxy` you see a value for `URL`, copy this value
5. Under `merchant-center-custom-application` set the `PROXY_URI` with the value you copied in 4 and redeploy
6. Copy the value for `URL` in `merchant-center-custom-application`
7. Go back to `Configure Custom Applications` (when you created the custom application in step 1) and set the `Application URL` with the value you copied in step 6 and click save.
