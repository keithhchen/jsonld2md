const raw = require("./json/src/raw.json")
const Tree = require("./Tree")
const Markdown = require("./Markdown")
const CSV = require("./CSV")
// Convert JSON-LD to JSON.

// const tree = new Tree(raw)
// tree.parse()
//   .then(() => {
//     tree.write("Video Game Composers")
//   })
//   .catch(err => {
//     throw new Error(err)
//   })

// Convert JSON to Markdown.

// const file = "./json/Video Game Composers/Eastern.json"
// const m = new Markdown(file)
// m.write()

// Convert JSON to CSV.

// const file = "./json/Video Game Composers/Sound Designers.json"
// const c = new CSV(file)
// c.write()