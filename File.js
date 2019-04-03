const fs = require("fs")
const path = require("path")

class File {
  constructor(json, dir) {
    this.json = require(json)
    this.filename = path.basename(json, path.extname(json))
    this.dir = dir
    this.export = ""
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir)
    }
  }

  write(name) {
    fs.writeFileSync(`${this.dir}/${name}`, this.export)
  }
}

module.exports = File