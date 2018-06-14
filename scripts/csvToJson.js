const fs = require('fs')
const d3 = require('d3')

const filename = 'fasttext-wiki-300d-100k'
const paths = {
  input: `./input/${filename}.csv`,
  output: `./output/${filename}.json`
}

const data = d3.csvParseRows(
  fs.readFileSync(paths.input, 'utf8'),
  ([ label, x, y, z ]) => ({
    text: label,
    x: +x,
    y: +y,
    z: +z
  })
)

fs.writeFileSync(paths.output, JSON.stringify(data))
console.log(data)
