// Last Name | First Name | Gender | Primary Role | Link

const fs = require("fs")
const path = require("path")
const File = require("./File")

module.exports = class CSV extends File {
  constructor(json) {
    super(json, "./csv")
    this.export = "Last Name,First Name,Gender,Primary Role,Link"
    this.lineBreak()
  }


  write() {
    this.parse(this.json)
    super.write(`${this.filename}.csv`)
  }

  parse(nodes, composer = "") {
    nodes.forEach(node => {
      const name = composer || node.title
      if (node.identifier) {
        this.lastName(name)
        this.firstName(name)
        this.gender()
        this.primaryRole()
        this.link(node.identifier)
      }
      this.backspace()
      this.lineBreak()

      if (node.nodes && node.nodes.length) {
        this.parse(node.nodes, name)
      }
    })
  }
  lastName(title) {
    this.export += '"' + title.split(" ").slice(1).join(" ") + '"'
    this.comma()
  }

  lineBreak() {
    this.export += "\n"
  }

  firstName(title) {
    this.export += '"' + title.split(" ")[0] + '"'
    this.comma()
  }

  comma() {
    this.export += ","
  }

  backspace() {
    this.export = this.export.substring(0, this.export.length - 1)
  }

  gender() {
    this.export += this.filename.toLowerCase().includes("female") ? "Female" : "Male"
    this.comma()
  }

  primaryRole() {
    this.export += this.filename.toLowerCase().includes("sound designer") ? "Sound Designer" : "Composer"
    this.comma()
  }

  link(url) {
    this.export += url
    this.comma()
  }
}