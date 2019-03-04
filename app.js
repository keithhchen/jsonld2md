const raw = require("./raw.json")
const TreeNode = require("./TreeNode")

const tree = new TreeNode()
tree.jsonld = raw
tree.parse()
  .then(() => {
    // Do things here.
    // tree.write("Video Game Composers")
  })
  .catch(err => {
    throw new Error(err)
  })