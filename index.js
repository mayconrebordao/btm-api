// import app from "./src/app";
// import chalk from "chalk";

const app = require("./src/app");
const chalk = require("chalk");


const  http = require("http");
setInterval(() => {
    http.get("https://btm-api.herokuapp.com");
}, 126000000); 

// console.log();

const port = () => process.env.PORT || 3000;

app.listen(port(), () => {
    // console.log(port());
    console.clear();
    // console.log("\x1b[36m%s\x1b[0m", "I am cyan");
    console.log(chalk.red("\t\tWellcome To API resources"));

    console.log(chalk.green("\tServer running in port " + port() + "."));
});


// {
//     errors:[
//         {
//             code: 
//         }
//     ]
// }
