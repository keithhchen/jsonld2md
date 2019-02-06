const jsonld = require('jsonld')
const fs = require("fs")
const contextSchema = require("./schema/context.json")
const typeSchema = require("./schema/types.json")
const { sortByAlphabet, sortByTime } = require("./utils")

/**
 *
 *
 * @class TreeNode
 */
class TreeNode {
  /**
   * Creates an instance of TreeNode.
   * @constructor
   * @param {string} json - Raw JSON-LD data to be parsed. 
   * @memberof TreeNode
   */
  constructor(json) {
    this.jsonDir = "./json"
    if (!fs.existsSync(this.jsonDir)) {
      fs.mkdirSync(this.jsonDir)
    }
    this.jsonld = json
    this.node = ""
    this.dir = ""
  }

  /**
   *
   * Parses raw JSON-LD as readable, nested JSON. 
   * @memberof TreeNode
   */
  async parseNode() {
    const compacted = await jsonld.compact(this.jsonld, contextSchema)
    const json = JSON.stringify(compacted, null, 2)
    this.node = JSON.parse(json)["@graph"]
    this.node.forEach(item => {
      item.type = typeSchema[item["@type"]]
    })
  }

  /**
   * Extracts a topic as JSON and writes to file. 
   * @param {string} title - Title of topic to be extracted as JSON and name of directory. 
   * @memberof TreeNode
   */
  writeNode(title) {
    const nodes = this.getNodes(this.getNode(title, "RootPearl"), false)
    nodes.forEach(node => {
      this.parseChildNodes(title, node.title)
    })
  }

  /**
   * @param {string} dir - Subdirectory name.
   * @param {string} title - JSON file title.
   * @memberof TreeNode
   */
  parseChildNodes(dir, title) {
    this.dir = "/" + dir
    const fileName = `${title}.json`
    console.log(`Writing to "${fileName}"...`)
    const rootNode = this.getNode(title, "RootPearl")
    let childNodes = this.getNodes(rootNode)
    childNodes = sortByAlphabet(childNodes)
    childNodes.forEach(child => sortByTime(child))
    this.writeFile(fileName, childNodes)
  }

  /**
   * Writes JSON to file. 
   * @param {string} fileName
   * @param {object} json
   * @memberof TreeNode
   */
  writeFile(fileName, json) {
    const dirName = this.jsonDir + this.dir
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName)
    }
    const content = JSON.stringify(json, null, 2)
    fs.writeFile(`${dirName}/${fileName}`, content, "utf8", (err) => {
      if (err) throw err
      console.log(`"${fileName}" completed`)
    })
  }

  /**
   * Searches for a specific node with title and type.
   * @param {string} title
   * @param {string} type
   * @returns {object} - Search result. 
   * @memberof TreeNode
   */
  getNode(title, type) {
    return this.node.filter(node => node.title === title && node.type === type)[0]
  }

  /**
   * Retrieves an array of child nodes of a parent. 
   * @param {object} parent - Parent node.
   * @param {boolean} [isDeepSearch=true] - Option to recurse for all child nodes. 
   * @returns {array} - Array of child nodes.
   * @memberof TreeNode
   */
  getNodes(parent, isDeepSearch = true) {
    const childNodes = this.node.filter(node => node.parent === parent.parent && this.isValidChild(node.type))
    if (isDeepSearch) {
      childNodes.forEach(node => {
        if (node.type === "RefPearl") {
          const childNodeAsRoot = this.getNode(node.title, "RootPearl")
          node.nodes = this.getNodes(childNodeAsRoot)
        }
      })
    }
    return childNodes
  }

  /**
   * Checks if a node is a valid child type. 
   * @param {string} type
   * @returns {boolean}
   * @memberof TreeNode
   */
  isValidChild(type) {
    const notAllowed = ["RootPearl", "SectionPearl", "UserAccount", "Note", "Tree", "Person"]
    return notAllowed.indexOf(type) === -1
  }
}

module.exports = TreeNode