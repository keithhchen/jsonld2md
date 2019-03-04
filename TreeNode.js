const cluster = require("cluster")
const os = require("os")
const fs = require("fs")
const jsonld = require("jsonld")
const contextSchema = require("./schema/context.json")
const typeSchema = require("./schema/types.json")
const {
  sortByAlphabet,
  sortByTime,
  checkUrl
} = require("./utils")
const debug = process.env.NODE_ENV === "dev"

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
  constructor() {
    this.jsonDir = "./json"
    if (!fs.existsSync(this.jsonDir)) {
      fs.mkdirSync(this.jsonDir)
    }

    this.node = ""
    this.dir = ""
    this.fileCount = 0
    this.jsonld = ""

    if (cluster.isMaster) {

      function forkIterator(workers) {
        this.current = -1
        this.forks = workers
        this.next = function () {
          if (this.current === this.forks.length - 1) {
            this.current = -1
          }
          this.current++
          return this.forks[this.current]
        }
      }

      // Fork as many clusters as CPUs available.
      let workers = []
      os.cpus().forEach(i => workers.push(cluster.fork()))
      this.forks = new forkIterator(workers)
    }
  }

  /**
   *
   * Parses raw JSON-LD as readable, nested JSON. 
   * @memberof TreeNode
   */
  async parse() {
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
  write(title) {
    this.dir = "/" + title
    const nodes = this.getNodes(this.getNode(title, "Tree"), false)
    if (cluster.isWorker) {
      process.on("message", async (node) => {
        if (debug) {
          console.log(`[${process.pid}] writing to "${node.title}.json"...`)
        }
        let parsed = await this.parseNodes(node)
        parsed = await checkUrl(parsed)
        const fileName = `${node.title}.json`
        this.writeFile(fileName, parsed)
      })
    }
    if (cluster.isMaster) {
      nodes.forEach(async node => {
        this.forks.next().send(node)
      })
    }
  }

  /**
   * @param {string} dir - Subdirectory name.
   * @param {string} title - JSON file title.
   * @memberof TreeNode
   */
  async parseNodes(node) {

    const rootNode = this.getNode(node.title, "Tree")
    if (!rootNode) {
      return node
    }
    let childNodes = this.getNodes(rootNode)
    childNodes = sortByAlphabet(childNodes)
    childNodes.forEach(child => sortByTime(child))
    return childNodes
  }


  /**
   * Writes JSON to file. 
   * @param {string} fileName
   * @param {object} obj
   * @memberof TreeNode
   */
  writeFile(fileName, obj) {
    const dirName = this.jsonDir + this.dir
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName)
    }
    const content = JSON.stringify(obj, null, 2)
    fs.writeFile(`${dirName}/${fileName}`, content, "utf8", (err) => {
      if (err) throw err
      this.fileCount++

      console.log(`[${process.pid}] "${fileName}" completed`)
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
   * @param {boolean} - Option to recurse for all child nodes. 
   * @returns {array} - Array of child nodes.
   * @memberof TreeNode
   */
  getNodes(parent, isDeepSearch = true) {
    let pid = parent["@id"]
    const childNodes = this.node.filter(item => item.parent === pid && this.isChild(item.type))
    if (isDeepSearch) {
      childNodes.forEach(node => {
        if (node.type === "RefPearl") {
          const childNodeAsRoot = this.getNode(node.title, "Tree")
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
  isChild(type) {
    const notAllowed = ["RootPearl", "SectionPearl", "UserAccount", "Note", "Tree", "Person"]
    return notAllowed.indexOf(type) === -1
  }
}

module.exports = TreeNode