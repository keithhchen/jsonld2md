const raw = require("./raw.json")
const Tree = require("./Tree")
const Markdown = require("./Markdown")

// const tree = new Tree(raw)
// tree.parse()
//   .then(() => {
//     // Do things here.
//     tree.write("Video Game Composers")
//   })
//   .catch(err => {
//     throw new Error(err)
//   })

const file = "./json/Video Game Composers/Western.json"
const m = new Markdown(file)
m.convert()
m.writeFile()