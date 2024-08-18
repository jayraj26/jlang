// TOKEN TYPES ****************

// *****************
const TokenType = {
  INTEGER: "INT",
  FLOAT: "FLOAT",
  KEYWORD: "KEYWORD",
  IDENTIFIER: "IDENTIFIER",
  PLUS: "PLUS",
  MINUS: "MINUS",
  POWER: "POWER",
  MULTIPLY: "MULTIPLY",
  DIVIDE: "DIVIDE",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  EQUALS: "EQUALS",
  DE: "DE",
  NE: "NE",
  GT: "GT",
  LT: "LT",
  GTE: "GTE",
  LTE: "LTE",
  EOF: "EOF", // End of input
};

const keywords = ["var", "AND", "OR", "NOT"];
// HELPER CODE ***********************************

// ***********************************

class Error {
  constructor(pos_start, pos_end, error_msg, details) {
    this.pos_start = pos_start;
    this.pos_end = pos_end;
    this.error_msg = error_msg;
    this.details = details;
  }

  toString() {
    let result = `${this.error_msg}: ${this.details}\n`;
    result += `File ${this.pos_start.fn}, Line ${this.pos_start.ln + 1}: ${
      this.pos_start.col
    }`;
    return result;
  }
}

class IllegalSyntaxError extends Error {
  constructor(pos_start, pos_end, message) {
    super(pos_start, pos_end, "Illegal Syntax", message);
  }
}

class RTError extends Error {
  constructor(pos_start, pos_end, details = " ", context) {
    super(pos_start, pos_end, "Runtime error:", details);
  }
}

class IllegalCharectorError extends Error {
  constructor(pos_start, pos_end, message) {
    super(pos_start, pos_end, "Illegal Character", message);
    // Error.captureStackTrace(this, this.constructor);
  }
}

class ExpectedCharError extends Error {
  constructor(pos_start, pos_end, details) {
    super(pos_start, pos_end, "Expected Charector", details);
  }
}

class Position {
  constructor(idx, ln, col, fn, ftxt) {
    this.idx = Number(idx);
    this.ln = Number(ln);
    this.col = Number(col);
    this.fn = fn;
    this.ftxt = ftxt;
  }

  advance(current_char = null) {
    this.idx += 1;
    this.col += 1;
    if (current_char == `\n`) {
      this.ln += 1;
      this.col = 0;
    }
  }
  copy() {
    return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt);
  }
}

// TOKENS *******************************

// *********************************
class Token {
  constructor(type, value, pos_start = null, pos_end = null) {
    this.type = type;
    this.value = value;
    if (pos_start) {
      this.pos_start = pos_start.copy();
      this.pos_end = pos_start.copy();
      this.pos_end.advance();
    }
    if (pos_end) {
      this.pos_end = pos_end;
    }
  }

  matches(type_, value) {
    return this.type == type_ && value == this.value;
  }

  toString() {
    return {
      ["type"]: this.type,
      ["value"]: this.value,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
      ["matches"]: this.matches,
      ["toString"]: this.toString,
    };
  }
}

class NumberNode {
  constructor(token) {
    this.type = token.type;
    this.value = token.value;
    this.pos_start = token.pos_start;
    this.pos_end = token.pos_end;
    this.toString = token.toString;
    this.matches = token.matches;
  }
  toString() {
    return {
      ["type"]: this.type,
      ["value"]: this.value,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
      ["matches"]: this.matches,
    };
  }
}

class BinOpNode {
  constructor(left_node, op_token, right_node) {
    this.left_node = left_node;
    this.op_token = op_token;
    this.right_node = right_node;
    this.pos_start = left_node.pos_start;
    this.pos_end = right_node.pos_end;
  }
  toString() {
    return {
      ["left"]: this.left_node,
      ["op_token"]: this.op_token,
      ["right_node"]: this.right_node,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
    };
  }
}

class UnaryNode {
  constructor(op_token, node) {
    this.op_token = op_token;
    this.node = node;
    this.pos_start = op_token.pos_start;
    this.pos_end = node.pos_end;
  }
  toString() {
    return {
      ["op_token"]: this.op_token,
      ["node"]: this.node,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
    };
  }
}

class VarAssignNode {
  constructor(var_name_tok, value_node) {
    this.var_name_tok = var_name_tok;
    this.value_node = value_node;
    this.pos_start = this.var_name_tok.pos_start;
    this.pos_end = this.var_name_tok.pos_end;
  }
}

class VarAccessNode {
  constructor(var_name_tok) {
    this.var_name_tok = var_name_tok;
    this.pos_start = this.var_name_tok.pos_start;
    this.pos_end = this.var_name_tok.pos_end;
  }
}

// LEXER ******************************

// *******************************
class Lexer {
  constructor(fn, input) {
    this.input = input;
    this.pos = new Position(-1, 0, -1, fn, input);
    this.currentChar = null;

    this.advance();
  }

  advance() {
    this.pos.advance();
    this.currentChar =
      this.pos.idx < this.input.length ? this.input[this.pos.idx] : null;
  }

  make_number() {
    let number = "";
    let dot_count = 0;
    let start_pos = this.pos.copy();
    while (
      (this.currentChar !== null && /\d/.test(this.currentChar)) ||
      this.currentChar == "."
    ) {
      if (this.currentChar == ".") {
        if (dot_count == 1) break;
        dot_count += 1;
        number += ".";
        this.advance();
      }
      number += this.currentChar;
      this.advance();
    }
    if (dot_count) {
      return new Token(TokenType.FLOAT, number, start_pos, this.pos).toString();
    }
    return new Token(TokenType.INTEGER, number, start_pos, this.pos).toString();
  }

  make_identifier(tok) {
    let str = "";
    let pos_start = this.pos.copy();

    while (
      this.currentChar !== null &&
      /^[A-Za-z0-9_]+$/.test(this.currentChar)
    ) {
      str += this.currentChar;
      this.advance();
    }

    let token_type = keywords.includes(str) ? "KEYWORD" : "IDENTIFIER";

    return new Token(token_type, str, pos_start, this.pos);
  }

  make_not_equals() {
    let pos_start = this.pos.copy();
    this.advance();

    if (this.currentChar === "=") {
      return [new Token(TokenType.NE, "!=", pos_start, this.pos), null];
    }
    this.advance();
    return [null, new ExpectedCharError(pos_start, pos_start, " '='")];
  }
  make_equals() {
    let start_pos = this.pos.copy();

    if (this.currentChar === "=") {
      this.advance();
      if (this.currentChar === "=") {
        return [
          new Token(TokenType.DE, "==", start_pos, this.currentChar.pos),
          null,
        ];
      }
      return [new Token(TokenType.EQUALS, "=", start_pos, start_pos), null];
    }
    this.advance();
  }

  make_greater_than() {
    let start_pos = this.pos.copy();

    if (this.currentChar === ">") {
      this.advance();
      if (this.currentChar === "=") {
        return [
          new Token(TokenType.GTE, ">=", start_pos, this.currentChar.pos),
          null,
        ];
      }
      return [new Token(TokenType.GT, ">", start_pos, start_pos), null];
    }
    this.advance();
  }

  make_less_than() {
    let start_pos = this.pos.copy();

    if (this.currentChar === "<") {
      this.advance();
      if (this.currentChar === "=") {
        return [
          new Token(TokenType.LTE, "<=", start_pos, this.currentChar.pos),
          null,
        ];
      }
      return [new Token(TokenType.LT, "<", start_pos, start_pos), null];
    }
    this.advance();
  }

  tokanize() {
    const tokens = [];

    while (this.currentChar !== null) {
      if (this.currentChar == " ") {
        this.advance();
      } else if (this.currentChar === "+") {
        tokens.push(
          new Token(TokenType.PLUS, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "^") {
        tokens.push(
          new Token(TokenType.POWER, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "-") {
        tokens.push(
          new Token(TokenType.MINUS, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "*") {
        tokens.push(
          new Token(TokenType.MULTIPLY, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "/") {
        tokens.push(
          new Token(TokenType.DIVIDE, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "(") {
        tokens.push(
          new Token(TokenType.LPAREN, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === ")") {
        tokens.push(
          new Token(TokenType.RPAREN, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "!") {
        const [tok, err] = this.make_not_equals();
        if (err) return [[], err];
        tokens.push(tok);
        this.advance();
      } else if (this.currentChar === "=") {
        const [tok, err] = this.make_equals();
        if (err) return [[], err];
        tokens.push(tok);
      } else if (this.currentChar === "<") {
        const [tok, err] = this.make_less_than();
        if (err) return [[], err];
        tokens.push(tok);
        this.advance();
      } else if (this.currentChar === ">") {
        const [tok, err] = this.make_greater_than();
        if (err) return [[], err];
        tokens.push(tok);
        this.advance();
      } else if (/\d/.test(this.currentChar)) {
        tokens.push(this.make_number());
      } else if (/[a-zA-Z]/.test(this.currentChar)) {
        tokens.push(this.make_identifier());
      } else {
        let pos_start = this.pos.copy();
        let char = this.currentChar;
        this.advance();
        return [[], new IllegalCharectorError(pos_start, this.pos, char)];
      }
    }
    tokens.push(new Token(TokenType.EOF, "EOF", this.pos));
    return [tokens, null];
  }
}

// ************** PARSER **********************

// ***********************************

class ParseResult {
  constructor() {
    this.error = null;
    this.node = null;
    this.advance_count = 0;
  }

  register_advance() {
    this.advance_count++;
  }

  register(res) {
    if (res.error) {
      this.error = res.error;
    }
    this.advance_count += res.advance_count;
    return res.node;
  }
  success(node) {
    this.node = node;
    return this;
  }
  failure(err) {
    this.error = err;
    return this;
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.token_idx = -1;
    this.cur_token = null;
    this.test = [];

    this.advance();
  }

  advance() {
    this.token_idx += 1;
    this.cur_token =
      this.token_idx < this.tokens.length ? this.tokens[this.token_idx] : null;
    // console.log("current node", this.cur_token);
    return this.cur_token;
  }

  parse() {
    let res = this.expr();
    if (res.error && this.cur_token.type != "EOF") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_end,
          "Expected  + - * /"
        )
      );
    }
    return res;
  }

  bin_op(func, ops, funcb = null) {
    if (funcb === null) {
      funcb = func;
    }
    let res = new ParseResult();
    var left = res.register(func());
    if (res.error) {
      return res;
    }

    while (this.cur_token && ops.includes(this.cur_token.type)) {
      let op_token = this.cur_token;
      res.register_advance();
      this.advance();
      let right = res.register(funcb());
      if (res.err) {
        return res;
      }
      left = new BinOpNode(left, op_token, right);
    }

    return res.success(left);
  }

  atom() {
    let res = new ParseResult();
    let chk = this.cur_token;

    if (chk && ["INT", "FLOAT"].includes(chk.type)) {
      res.register_advance();
      this.advance();
      return res.success(new NumberNode(chk));
    } else if (chk && ["IDENTIFIER"].includes(chk.type)) {
      res.register_advance();
      this.advance();
      return res.success(new VarAccessNode(chk));
    } else if (chk.type == "LPAREN") {
      res.register_advance();
      this.advance();
      let expr = res.register(this.expr());
      if (res.error) {
        return res;
      }
      if (this.cur_token.type == "RPAREN") {
        res.register_advance();
        this.advance();
        return res.success(expr);
      } else {
        return res.failure(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_end,
            "expected )"
          )
        );
      }
    }

    return res.failure(
      new IllegalSyntaxError(
        chk.pos_start,
        chk.pos_end,
        "Expected INT,FLOAT,identifier, + , - or )"
      )
    );
  }

  power() {
    let res = new ParseResult();
    var left = res.register(this.atom());

    if (res.error) {
      return res;
    }

    while (this.cur_token && ["POWER"].includes(this.cur_token.type)) {
      let op_token = this.cur_token;
      res.register_advance();
      this.advance();
      let right = res.register(this.factor());

      if (res.err) {
        return res;
      }
      left = new BinOpNode(left, op_token, right);
    }

    return res.success(left);
  }

  factor() {
    let res = new ParseResult();
    let chk = this.cur_token;

    if (chk && ["PLUS", "MINUS"].includes(chk.type)) {
      res.register_advance();
      this.advance();
      let factor = res.register(this.factor());

      if (res.error) {
        return res;
      }
      return res.success(new UnaryNode(chk, factor));
    }

    return this.power();
  }

  term() {
    let res = new ParseResult();
    var left = res.register(this.factor());

    if (res.error) {
      return res;
    }

    while (
      this.cur_token &&
      ["MULTIPLY", "DIVIDE"].includes(this.cur_token.type)
    ) {
      let op_token = this.cur_token;
      res.register_advance();
      this.advance();
      let right = res.register(this.factor());

      if (res.err) {
        return res;
      }

      left = new BinOpNode(left, op_token, right);
    }
    return res.success(left);
    // return this.bin_op(this.factor, ["MULTIPLY", "DIVIDE"]);
  }

  expr() {
    if (this.cur_token.matches("KEYWORD", "var")) {
      let result = new ParseResult();
      result.register_advance();
      this.advance();

      if (this.cur_token.type !== "IDENTIFIER") {
        return result.failure(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_end,
            "Identifier expected"
          )
        );
      }

      let var_name = this.cur_token;
      result.register_advance();
      this.advance();

      if (this.cur_token.type !== "EQUALS") {
        console.log("missing equals");
        return result.failure(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_end,
            "Expected '='"
          )
        );
      }

      result.register_advance();
      this.advance();
      let expression = result.register(this.expr());
      if (result.error) return result;
      return result.success(new VarAssignNode(var_name, expression));
    }

    let res = new ParseResult();
    var left = res.register(this.term());
    if (res.err) {
      return res;
    }

    while (this.cur_token && ["PLUS", "MINUS"].includes(this.cur_token.type)) {
      let op_token = this.cur_token;
      res.register_advance();
      this.advance();
      let right = res.register(this.term());
      if (res.err) {
        return res;
      }
      left = new BinOpNode(left, op_token, right);
    }

    if (res.err) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_end,
          "Expected VAR , ) or a number"
        )
      );
    }

    return res.success(left);

    // return this.bin_op(this.factor, ["PLUS", "MINUS"], this.term);
  }
}

// *******************HELPER INTERPRETOR***************
// *******************HELPER INTERPRETOR***************

class Numbers {
  constructor(value) {
    this.value = value;
    this.set_pos();
    this.set_context();
  }

  set_context(context = null) {
    this.context = context;
  }
  set_pos(pos_start = null, pos_end = null) {
    this.pos_start = pos_start;
    this.pos_end = pos_end;
    return this;
  }

  added_to(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) + Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }
  subtracted_by(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) - Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }
  multiplied_by(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) * Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  powered_by(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) ** Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }
  divided_by(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      if (Number(other.value) == 0) {
        return [
          null,
          new RTError(
            other.pos_start,
            other.pos_end,
            "Divide by 0 error",
            this.context
          ),
        ];
      }
      let res = new Numbers(Number(this.value) / Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }
  toString() {
    return this.value;
  }
}

class SymbolTable {
  constructor() {
    this.symbols = {};
    this.parent = null;
  }
  get(name) {
    let value = this.symbols[`${name}`];
    if (!value && this.parent) {
      return this.parent.name;
    }
    return value;
  }

  set(name, value) {
    this.symbols[name] = value;
  }

  remove(name) {
    delete this.symbols[name];
  }
}

class RTResult {
  constructor() {
    this.value = null;
    this.error = null;
  }

  register(res) {
    if (res.error) {
      this.error = res.error;
    }
    return res.value;
  }
  success(value) {
    this.value = value;
    return this;
  }
  failure(err) {
    this.error = err;
    return this;
  }
}

class Context {
  constructor(display_name, parent = null, parent_entry_pos = null) {
    this.display_name = display_name;
    this.parent = parent;
    this.parent_entry_pos = parent_entry_pos;
    this.symbol_table = null;
  }
}

// *******************HELPER INTERPRETOR ENDS***************

// ***************** INTERPRETOR ********************
// ***************** INTERPRETOR ********************

class Interpretor {
  visit(node, context) {
    const methodName = "visit_" + node.constructor.name;
    const method = this[methodName] || this.noVisitMethod;

    return method.apply(this, [node, context]);
  }
  novisit(node, context) {
    throw new Error("No visit method defined for " + node.constructor.name);
  }

  visit_VarAccessNode(node, context) {
    let res = new RTResult();
    let var_name = node.var_name_tok.value;

    let value = context.symbol_table.get(var_name);

    if (!value) {
      return res.failure(
        new RTError(
          node.pos_start,
          node.pos_end,
          `${var_name} is not defined`,
          context
        )
      );
    }
    return res.success(value);
  }

  visit_VarAssignNode(node, context) {
    let res = new RTResult();
    let var_name = node.var_name_tok.value;
    let value = res.register(this.visit(node.value_node, context));
    if (res.err) {
      return res;
    }
    context.symbol_table.set(var_name, value);
    return res.success(value);
  }

  visit_NumberNode(node, context) {
    let rtresult = new RTResult();

    let res = new Numbers(node.value);
    res.set_pos(node.pos_start, node.pos_end);
    res.set_context(context);

    return node && rtresult.success(res);
  }

  visit_BinOpNode(node, context) {
    let result;
    let error;
    let rtresult = new RTResult();
    let left = rtresult.register(this.visit(node.left_node, context));
    if (rtresult.error) {
      return rtresult;
    }

    let right = rtresult.register(this.visit(node.right_node, context));
    if (rtresult.error) {
      return rtresult;
    }

    if (left && node.op_token.type == "PLUS") {
      [result, error] = left.added_to(right);
    } else if (node.op_token && right && node.op_token.type == "MINUS") {
      [result, error] = left.subtracted_by(right);
    } else if (node.op_token && node.op_token.type == "MULTIPLY") {
      [result, error] = left.multiplied_by(right);
    } else if (node.op_token && node.op_token.type == "DIVIDE") {
      [result, error] = left.divided_by(right);
    } else if (node.op_token && node.op_token.type == "POWER") {
      [result, error] = left.powered_by(right);
    }

    if (error) {
      return rtresult.failure(error);
    }

    return rtresult.success(result.set_pos(node.pos_start, node.pos_end));
  }

  visit_UnaryNode(node, context) {
    let rtresult = new RTResult();
    let result;
    let error;
    let number = rtresult.register(this.visit(node.node, context));

    if (rtresult.error) {
      return rtresult;
    }
    if (node.op_token && node.op_token.type == "MINUS") {
      [result, error] = number.multiplied_by(new Numbers(-1));
    }

    if (error) {
      return rtresult.failure(error);
    }

    return rtresult.success(number.set_pos(node.start_pos, node.end_pos));
  }
}

// ***************** INTERPRETOR ENDS ********************

// ************** RUN *************************

// *********************************************

let global_symbol_table = new SymbolTable();
global_symbol_table.set("null", Number(0));

export const run = (fn, input) => {
  const lexer = new Lexer(fn, input);
  let [tokens, error] = lexer.tokanize();
  if (error) {
    return [null, error];
  }

  const parser = new Parser(tokens);
  let AST = parser.parse();
  if (AST.error) {
    return [null, AST.error];
  }

  const interpretor = new Interpretor();
  const context = new Context("<program>");
  context.symbol_table = global_symbol_table;
  let result = interpretor.visit(AST.node, context);
  return [result.value.value, result.error];
  // return [AST.node, null];
  // return [tokens, null];
};
