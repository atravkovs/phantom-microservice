const fs = require('fs');

const indexColors = false;

fs.readFile('./unity3D.json', 'utf8', (err, data) => {
    if (err) console.error(err);

    const json = JSON.parse(data);
    createPage(json);
});

const BlockFactory = function() {
    this.buffer = [];
    this.index = 0;
};

const indexes = {};

BlockFactory.prototype = {
    append: function({ height, width, top, left, tag, zindex, id, text}) {
        if (!(zindex in indexes))
            indexes[zindex] = getRandomColor();

        this.buffer[this.index] = `<div data-tag-name="${tag}" id="${id}" class='p-absolute' style='z-index: ${zindex};height: ${height}px;width: ${width}px;top: ${top}px;left: ${left}px;background-color: ${indexColors ? indexes[zindex] : getRandomColor()};'>${text ? text : ''}</div>`;
        this.index++;
        return this;
    },
    toString: function() { return this.buffer.join('\n'); },
};

const getRandomColorNumber = () => Math.floor(Math.random() * 256);
const getRandomColor = () => `rgb(${getRandomColorNumber()}, ${getRandomColorNumber()}, ${getRandomColorNumber()})`;


const divs = new BlockFactory();
const rows = new BlockFactory();
function createPage(json) {
    let html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Experiment page</title>
            <style type="text/css">
                .p-absolute {
                    position: absolute;
                }
                body {
                    font-size: 0.875em;
                }
            </style>
        </head>
        <body>
    `;
    parseJsonToHtml(json, 0);
    html += rows.toString();
    html += '</body></html>';

    fs.writeFile('./ouptputRows.html', html, (err) => err ? console.error(err) : null);
}

const isInRow = (childrens) => {
    const { top, height } = childrens[0].boundaries;

    for (let i = 1; i < childrens.length; i++)
        if (childrens[i].boundaries.top !== top || childrens[i].boundaries.height !== height)
            return false;
    return true;
};

function parseJsonToHtml({ boundaries, tag, id, text, childrens }, zindex) {
    divs.append({ tag, zindex, id, text, ...boundaries });
    
    if (!childrens) return;
    if (childrens.length >= 2 && isInRow(childrens)) rows.append({ tag, zindex, id, text, ...boundaries });

    for (let i = 0; i < childrens.length; i++)
        parseJsonToHtml(childrens[i], zindex + 1);
}
