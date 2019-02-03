const jsonld = require('jsonld')
const raw = require("./raw.json")
const fs = require("fs")
const context = require("./schema/context.json")
const typeSchema = require("./schema/types.json")

const jsonDir = "./json"
if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir)
}

// const typeCounts = [
//   { name: 'Note', count: 7 },
//   { name: 'Tree', count: 462 },
//   { name: 'Person', count: 1 },
//   { name: 'RootPearl', count: 461 },
//   { name: 'UserAccount', count: 1 },
//   { name: 'PagePearl', count: 3449 },
//   { name: 'SectionPearl', count: 13 },
//   { name: 'RefPearl', count: 460 }
// ]

let tree
main()

async function main() {
  tree = fs.existsSync("./json/parsed.json") ? require("./json/parsed.json") : await parseTree()
}
async function parseTree() {
  const compacted = await jsonld.compact(raw, context)
  const json = JSON.stringify(compacted, null, 2)
  const parsed = JSON.parse(json)
  const parsedTree = parsed["@graph"]
  parsedTree.forEach(item => {
    item.type = typeSchema[item["@type"]]
  })
  const content = JSON.stringify(parsedTree, null, 2)
  fs.writeFileSync("./json/parsed.json", content, "utf8", null)
  return parsedTree
}

function writeRootPearl(title) {
  const rootObj = getNode(title, "RootPearl")
  let children = getChildren(rootObj)
  console.log(children)
  children = sortByAlphabet(children)
  children.forEach(child => sortByTime(child))
  const fileName = `${title.toLowerCase().split(" ").join("-")}.json`
  const content = JSON.stringify(children, null, 2);
  fs.writeFileSync(`${jsonDir}/${fileName}`, content, "utf8")
}

function sortByAlphabet(node) {
  return node.sort((a, b) => {
    const aTitle = a.title.substring(0, 1)
    const bTitle = b.title.substring(0, 1)
    if (aTitle < bTitle) { return -1 }
    if (aTitle > bTitle) { return 1 }
    return 0
  })
}
function sortByTime(node) {
  if (node.pages) {
    node.pages.sort((a, b) => {
      return a.createTime > b.createTime ? 1 : -1
    })
    node.pages.forEach(childNode => {
      if (childNode.pages) childNode = sortByTime(childNode)
    })
  }
  return node
}
function getChildren(parent) {
  const children = tree.filter(node => node.parent === parent.parent && isAllowedChild(node.type))
  children.forEach(child => {
    if (child.type === "RefPearl") {
      const childRootObj = getNode(child.title, "RootPearl")
      child.pages = getChildren(childRootObj)
    }
  })
  return children
}

function getNode(title, type) {
  return tree.filter(node => node.title === title && node.type === type)[0]
}

function isAllowedChild(type) {
  const notAllowed = ["RootPearl", "SectionPearl", "UserAccount", "Note", "Tree", "Person"]
  return notAllowed.indexOf(type) === -1
}

function getType(type) {
  return tree.filter(node => node.type === type)
}