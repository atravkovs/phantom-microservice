# Phantom Microservice

To start PhantomJS server run following command:
> `npm start`

It will start PhantomJS server on port 8090 and will accept the only GET parametr - `url` with url of website that should be analyzed. `url` should be already encoded (for this purpose you can use urlencoder.org for example).

To convert data from generated JSON to XML run following command:
> `npm run converter -- [json file path] [xml output path]`

Example results are in `/screenshots`, `/xml` and `/json` folders.
