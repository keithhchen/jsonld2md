const json2md = require("json2md")
const fs = require("fs")

module.exports = class Markdown {
  constructor(json) {
    this.json = json
    this.md = ""
  }
  parse() {
    const obj = this.json.map(node => {
      const parsed = []
      parsed.push({
        h2: node.title,
      })
      parsed.push({
        link: {
          title: node.title,
          source: decodeURIComponent(node.identifier) || ""
        }
      })
      return parsed
    })
    this.md = json2md(obj)
  }
  writeFile() {
    fs.writeFileSync("./test.md", this.md)
  }
}

module.exports = Markdown