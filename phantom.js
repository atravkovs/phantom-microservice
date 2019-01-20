const server = require('webserver').create(),
      port = 8090;

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
        page.render(`screenshots/${Date.now()}.jpeg`, {format: 'jpeg', quality: '100'});
        const element = page.evaluate(getElemInfo, null);

        callback(element);
    });
}

function getElemInfo(el) {
    if (!el) el = document.querySelector('BODY');

    
    const data = {
        tag: el.nodeName,
        boundaries: el.getBoundingClientRect(),
        id: el.getAttribute('id'),
    };
    
    const textTags = ['P', 'TD'];

    if (textTags.includes(el.nodeName)) data.text = el.textContent;

    let childrens = [];
    for (let i = 0; i < el.children.length; i++) {
        const child = el.children.item(i);
        const result = getElemInfo(child);

        if (result)
            childrens = childrens.concat(result);
    }

    return [data, ...childrens];
}
