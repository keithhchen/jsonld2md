const json2md = require("json2md")
const json = require("./json/research.json")
const fs = require("fs")

const obj = json.map(node => {
  const parsed = []
  parsed.push({
    h12: node.title,
  })
  return parsed
})

const md = json2md(obj)