const json2md = require("json2md")
const fs = require("fs")
const path = require("path")
class Markdown {
  constructor(json) {
    this.json = require(json)
    this.filename = path.basename(json, path.extname(json))
    this.md = ""
    this.dir = "./md"
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir)
    }
  }
  convert() {
    this.md = json2md(this.parse(this.json))
  }
  parse(nodes, heading = 0) {
    const obj = nodes.map(node => {
      const parsed = []
      if (node.identifier) {
        parsed.push(Markdown.toLink(node.title, node.identifier))
      }
      if (!node.identifier) {
        parsed.push(Markdown.toHeading(node.title, heading))
      }
      if (node.nodes && node.nodes.length) {
        parsed.push((this.parse(node.nodes, heading + 1)))
      }
      return parsed
    })
    return obj
  }

  static toHeading(title, heading) {
    const headings = ["h1", "h2", "h3", "h4", "h5", "h6"]
    if (heading >= headings.length) heading = headings.length - 1
    const obj = {}
    Object.defineProperty(obj, headings[heading], {
      value: title,
      writable: true,
      enumerable: true
    })
    return obj
  }
  static toLink(title, source) {
    return {
      link: {
        title,
        source
      }
    }
  }

  write() {
    this.convert()
    fs.writeFileSync(`${this.dir}/${this.filename}.md`, this.md)
  }
}

module.exports = Markdown