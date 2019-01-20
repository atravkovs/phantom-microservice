const fs = require('fs'),
      convert = require('xml-js');

if (!process.argv[2] || !process.argv[3]) throw new Error('No args found!');

const [,,input, output] = process.argv;

fs.readFile(input, 'utf8', (err, json) => {
    if (err) throw err;

    const data = JSON.parse(json);
    
    const elements = [ parseElement(data) ];
    const js = {
        declaration: {
            attributes: {
                version: '1.0',
                encoding: 'utf-8',
            },
        },
        elements,
    };
    
    const options = { spaces: 4 };

    // console.log(convert.js2xml(js, options));

    fs.writeFile('./test.json', JSON.stringify(js), (err) => {
        if (err) throw err;
    });

    fs.writeFile(output, convert.js2xml(js, options), (err) => {
        if (err) throw err;
    });

});

function parseElement(el) {
    const elements = [];

    if (el.text) elements.push({
        type: 'text',
        text: el.text,
    });

    for (let children of el.childrens)
        elements.push(parseElement(children));

    const attributes = Object.assign({}, el.attributes, el.boundaries);

    const element = {
        type: 'element',
        name: el.tag,
    };

    if (attributes != {}) element.attributes = attributes;
    if (elements != null) element.elements = elements;

    return element;
}