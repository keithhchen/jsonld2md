const raw = require("./raw.json")
const TreeNode = require("./TreeNode")

const tree = new TreeNode(raw)
tree.parseNode().then(() => {
  // Do things here.
  tree.writeNode("Video Game Composers")
})