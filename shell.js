import { run } from "./Lexer.js";

process.stdin.setEncoding("utf-8");

process.stdout.write("jayraj>>");

process.stdin.on("data", (data) => {
  const input = data.toString().trim();
  const [result, error] = run("<stdin>", input);

  if (input === "\u0003") {
    console.log("Goodbye!");
    process.exit();
  } else {
    if (error) {
      console.log(error.toString());
      process.exit();
    } else if (result) {
      console.log(result);
    }

    process.stdout.write("jayraj>>");
  }
});
