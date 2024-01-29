const path = require("path");

module.exports = {
    entry: "./src/p5.RayCaster.js",
    output:{
        filename: "p5.RayCaster.min.js",
        library: {
            name:"RayCaster",
            type: "umd"
        },
        path: path.resolve(__dirname, "dist"),
    }
}