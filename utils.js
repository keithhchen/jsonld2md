const request = require('request-promise-native')

function sortByAlphabet(node) {
  return node.sort((a, b) => {
    if (a.title < b.title) {
      return -1
    }
    if (a.title > b.title) {
      return 1
    }
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

async function isUrl(uri) {
  const options = {
    method: 'GET',
    uri,
    resolveWithFullResponse: true
  }
  try {
    const res = await request(options)
    return res.statusCode !== 404
  } catch (err) {
    return err.statusCode !== 404
  }
}

async function checkUrl(nodes) {
  if (nodes.identifier) {
    const isExists = await isUrl(nodes.identifier)
    if (!isExists) {
      console.log("deleting: " + node.identifier)
      delete nodes.identifier
    }
  }
  if (nodes.length) {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i]
      if (node.identifier) {
        const isExists = await isUrl(node.identifier)
        if (!isExists) {
          console.log(`deleting: ${node.title} ${node.identifier}`)
          nodes.splice(i, 1)
        }
      }
      if (node.nodes) {
        node.nodes = await checkUrl(node.nodes)
      }
    }
  }
  return nodes
}

module.exports = {
  sortByAlphabet,
  sortByTime,
  checkUrl
}