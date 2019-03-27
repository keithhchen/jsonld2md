const raw = require("./raw.json")
const Tree = require("./Tree")
const Markdown = require("./Markdown")

// 1. Parse JSON-LD to JSON.

// const tree = new Tree(raw)
// tree.parse()
//   .then(() => {
//     tree.write("Video Game Composers")
//   })
//   .catch(err => {
//     throw new Error(err)
//   })

// 2. Convert JSON to Markdown.

// const file = "./json/Video Game Composers/Western.json"
// const m = new Markdown(file)
// m.write()