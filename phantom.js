const server = require('webserver').create(),
      fs = require('fs'),
      port = 8090,
      curDate = Date.now();

function getQueryParams(qs) {
    qs = qs.substring(2).split('+').join(' ');

    const params = {},
          re = /[?&]?([^=]+)=([^&]*)/g;
    let tokens;

    while (tokens = re.exec(qs))
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);

    return params;
}

server.listen(port, (req, res) => {
    const params = getQueryParams(req.url);

    requestPage(decodeURIComponent(params.url), (element) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(element));
        res.close();
    });
});

function requestPage(url, callback) {
    const page = new WebPage();

    page.onConsoleMessage = function (msg) {
        console.log(msg);
    };
    page.viewportSize = { width: 1920, height: 1080 };

    page.open(url, (status) => {
        if (status !== 'success') console.log(':(');
        page.render(`screenshots/${curDate}.jpeg`, {format: 'jpeg', quality: '100'});
        const data = page.evaluate(getElemInfo, null);

        saveAsJSON(data);
        callback(data);
    });
}

function saveAsJSON(data) {
    fs.write(`./json/${curDate}.json`, JSON.stringify(data), 'w');
}

function getElemInfo(el) {
    if (!el) el = document.querySelector('BODY');

    let text = '';
    if (el.firstChild && el.firstChild.nodeType == 3) text = el.firstChild.nodeValue;

    const attributes = {};
    for (let i = 0; i < el.attributes.length; i++) {
        attributes[el.attributes[i].nodeName] = el.attributes[i].nodeValue;
    }

    const childrens = [];
    for (let i = 0; i < el.children.length; i++) {
        const child = el.children.item(i);
        const result = getElemInfo(child);

        if (result)
            childrens.push(result);
    }

    const data = {
        tag: el.nodeName,
        boundaries: el.getBoundingClientRect(),
        text,
        attributes,
        childrens,
    };

    return data;
}
