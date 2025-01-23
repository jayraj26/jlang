import { run } from "./Lexer.js";

process.stdin.setEncoding("utf-8");

process.stdout.write("jayraj>>");

process.stdin.on("data", (data) => {
  const input = data.toString().trim();
  if (input.trim() === "" || input.trim() === " ") {
    process.stdout.write("jayraj>>");
    return;
  }
  if (input === "\u0003") {
    console.log("Goodbye!");
    process.exit();
  } else {
    const [result, error] = run("<stdin>", input);
    if (error) {
      console.log(error.toString());
      process.exit();
    } else if (result !== null) {
      if (result.length == 1) {
        console.log(result[0]);
      } else {
        console.log(result);
      }
    }

    process.stdout.write("jayraj>>");
  }
});
