function sortByAlphabet(node) {
  return node.sort((a, b) => {
    if (a.title < b.title) { return -1 }
    if (a.title > b.title) { return 1 }
    return 0
  })
}

function sortByTime(node) {
  if (node.nodes) {
    node.nodes.sort((a, b) => {
      return a.createTime > b.createTime ? 1 : -1
    })
    node.nodes.forEach(childNode => {
      if (childNode.nodes) childNode = sortByTime(childNode)
    })
  }
  return node
}

module.exports = { sortByAlphabet, sortByTime }