// TOKEN TYPES ****************

// *****************
const TokenType = {
  INTEGER: "INT",
  FLOAT: "FLOAT",
  STRING: "STRING",
  KEYWORD: "KEYWORD",
  IDENTIFIER: "IDENTIFIER",
  PLUS: "PLUS",
  MINUS: "MINUS",
  POWER: "POWER",
  MULTIPLY: "MULTIPLY",
  DIVIDE: "DIVIDE",
  SLPAREN: "SLPAREN",
  SRPAREN: "SRPAREN",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  EQUALS: "EQUALS",
  DE: "DE",
  NE: "NE",
  GT: "GT",
  LT: "LT",
  GTE: "GTE",
  LTE: "LTE",
  COMMA: "COMMA",
  ARROW: "ARROW",
  NEWLINE: "NEWLINE",
  EOF: "EOF", // End of input
};

const keywords = [
  "var",
  "AND",
  "OR",
  "NOT",
  "IF",
  "ELIF",
  "THEN",
  "ELSE",
  "FOR",
  "TO",
  "STEP",
  "WHILE",
  "FUNC",
  "END",
];
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

class StringNode {
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

  toString() {
    return {
      ["var_name_tok"]: this.var_name_tok,
      ["value_node"]: this.value_node,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
    };
  }
}

class VarAccessNode {
  constructor(var_name_tok) {
    this.var_name_tok = var_name_tok;
    this.pos_start = this.var_name_tok.pos_start;
    this.pos_end = this.var_name_tok.pos_end;
  }

  toString() {
    return {
      ["var_name_tok"]: this.var_name_tok,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
    };
  }
}

class ListNode {
  constructor(element_nodes, pos_start, pos_end) {
    this.element_nodes = element_nodes;
    this.pos_start = pos_start;
    this.pos_end = pos_end;
  }
}

class IfNode {
  constructor(cases, else_case) {
    this.cases = cases;
    this.else_case = else_case;
    this.pos_start = cases[0][0].pos_start;
    this.pos_end =
      this.else_case?.pos_end || cases[cases.length - 1][0].pos_end;
  }
}

class ForNode {
  constructor(
    var_name_tok,
    start_value_node,
    end_value_node,
    step_value_node,
    body_node
  ) {
    this.var_name_tok = var_name_tok;
    this.start_value_node = start_value_node;
    this.end_value_node = end_value_node;
    this.step_value_node = step_value_node;
    this.body_node = body_node;

    this.pos_start = this.var_name_tok.pos_start;
    this.pos_end = this.body_node.pos_end;
  }
}

class WhileNode {
  constructor(condition_node, body_node) {
    this.condition_node = condition_node;
    this.body_node = body_node;

    this.pos_start = this.condition_node.pos_start;
    this.pos_end = this.body_node.pos_end;
  }
}

class FuncDefNode {
  constructor(var_name_tok, arg_name_toks, body_node) {
    this.var_name_tok = var_name_tok;
    this.arg_name_toks = arg_name_toks;
    this.body_node = body_node;

    if (this.var_name_tok) {
      this.pos_start = this.var_name_tok.pos_start;
    } else if (this.arg_name_toks.length > 0) {
      this.pos_start = this.arg_name_toks[0].pos_start;
    } else {
      this.pos_start = this.body_node.pos_start;
    }

    this.pos_end = this.body_node.pos_end;
  }

  toString() {
    return {
      ["var_name_tok"]: this.var_name_tok,
      ["arg_name_toks"]: this.arg_name_toks,
      ["body_node"]: this.body_node,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
    };
  }
}

class CallNode {
  constructor(node_to_call, arg_nodes) {
    this.node_to_call = node_to_call;
    this.arg_nodes = arg_nodes;

    this.pos_start = this.node_to_call.pos_start;

    if (arg_nodes.length > 0) {
      this.pos_end = arg_nodes[arg_nodes.length - 1].pos_end;
    } else {
      this.pos_end = this.node_to_call.pos_end;
    }
  }

  toString() {
    return {
      ["node_to_call"]: this.node_to_call,
      ["arg_nodes"]: this.arg_nodes,
      ["pos_start"]: this.pos_start,
      ["pos_end"]: this.pos_end,
    };
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

  make_minus_or_arrow() {
    let token_type = TokenType.MINUS;
    let start_pos = this.pos.copy();
    this.advance();

    if (this.currentChar == ">") {
      this.advance();
      token_type = TokenType.ARROW;
    }

    return new Token(
      token_type,
      `${token_type == "MINUS" ? "-" : "->"}`,
      start_pos,
      this.pos
    );
  }

  make_string() {
    let str = "";
    let pos_start = this.pos.copy();
    let escape_character = false;
    this.advance();

    let escape_characters = {
      n: "\n",
      t: "\t",
    };

    while (
      this.currentChar != null &&
      (this.currentChar != '"' || escape_character)
    ) {
      if (escape_character) {
        str += escape_characters[this.currentChar];
      } else {
        if (this.currentChar == "\\") {
          escape_character = true;
        } else {
          str += this.currentChar;
        }
      }

      this.advance();
      escape_character = false;
    }

    this.advance();
    return new Token(TokenType.STRING, str, pos_start, this.pos);
  }

  tokanize() {
    const tokens = [];

    while (this.currentChar !== null) {
      if (this.currentChar == " ") {
        this.advance();
      } else if (["\n", ";"].includes(this.currentChar)) {
        tokens.push(new Token(TokenType.NEWLINE, this.pos));
        this.advance();
      } else if (this.currentChar === '"') {
        tokens.push(this.make_string());
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
        tokens.push(this.make_minus_or_arrow());
        // this.advance();
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
      } else if (this.currentChar === "[") {
        tokens.push(
          new Token(TokenType.SLPAREN, this.currentChar, this.pos).toString()
        );
        this.advance();
      } else if (this.currentChar === "]") {
        tokens.push(
          new Token(TokenType.SRPAREN, this.currentChar, this.pos).toString()
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
      } else if (this.currentChar === ",") {
        tokens.push(
          new Token(TokenType.COMMA, this.currentChar, this.pos).toString()
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
        this.advance();
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
    this.last_registered_advance_count = 0;
    this.advance_count = 0;
    this.to_reverse_count = 0;
  }

  register_advance() {
    this.last_registered_advance_count = 1;
    this.advance_count++;
  }

  register(res) {
    if (res.error) {
      this.error = res.error;
    }
    this.last_registered_advance_count = res.advance_count;
    this.advance_count += res.advance_count;
    return res.node;
  }

  try_register(res) {
    if (res.error) {
      this.to_reverse_count = res.advance_count;
      return null;
    }
    return res.register(res);
  }

  success(node) {
    this.node = node;
    return this;
  }

  failure(err) {
    if (!this.error || this.last_registered_advance_count == 0) {
      this.error = err;
    }
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

  reverse(amount = 1) {
    this.token_idx -= amount;
    this.update_current_tok();
    return this.cur_token;
  }

  update_current_tok() {
    if (this.token_idx >= 0 && this.token_idx < this.tokens.length) {
      this.cur_token = this.tokens[this.token_idx];
    }
  }

  parse() {
    let res = this.statements();
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

  if_expr = () => {
    // console.log("if_expr");
    let res = new ParseResult();
    let cases = [];
    let else_case = null;

    if (!this.cur_token.matches("KEYWORD", "IF")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected IF statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let condition = res.register(this.expr());
    if (res.error) return res;

    if (!this.cur_token.matches("KEYWORD", "THEN")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected THEN statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let expr = res.register(this.expr());
    if (res.error) return res;
    cases.push([condition, expr]);

    while (this.cur_token.matches("KEYWORD", "ELIF")) {
      res.register_advance();
      this.advance();

      let condition = res.register(this.expr());
      if (res.error) return res;

      if (!this.cur_token.matches("KEYWORD", "THEN")) {
        return res.error(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_start,
            "Expected THEN statement"
          )
        );
      }

      res.register_advance();
      this.advance();

      let expr = res.register(this.expr());
      if (res.error) return res;
      cases.push([condition, expr]);
    }

    if (this.cur_token.matches("KEYWORD", "ELSE")) {
      res.register_advance();
      this.advance();

      else_case = res.register(this.expr());
      if (res.error) return res;
    }

    return res.success(new IfNode(cases, else_case));
  };

  for_expr() {
    // console.log("for_expr");
    let res = new ParseResult();

    if (!this.cur_token.matches("KEYWORD", "FOR")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected FOR statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    if (!this.cur_token.type == "IDENTIFIER") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected IDENTIFIER statement"
        )
      );
    }

    let var_name = this.cur_token;
    res.register_advance();
    this.advance();

    if (!this.cur_token.type == "EQUALS") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected EQUALS statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let start_value = res.register(this.expr());
    if (res.error) return res;

    if (!this.cur_token.matches("KEYWORD", "TO")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected TO statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let end_value = res.register(this.expr());
    if (res.error) return res;

    let step_value;
    if (this.cur_token.matches("KEYWORD", "STEP")) {
      res.register_advance();
      this.advance();

      step_value = res.register(this.expr());
      if (res.error) return res;
    } else {
      step_value = null;
    }

    if (!this.cur_token.matches("KEYWORD", "THEN")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected THEN statement"
        )
      );
    }

    res.register_advance();
    this.advance();
    let body = res.register(this.expr());
    if (res.error) return res;

    return res.success(
      new ForNode(var_name, start_value, end_value, step_value, body)
    );
  }

  while_expr() {
    // console.log("while_expr");
    let res = new ParseResult();

    if (!this.cur_token.matches("KEYWORD", "WHILE")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected WHILE statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let condition = res.register(this.expr());
    if (res.error) return res;

    if (!this.cur_token.matches("KEYWORD", "THEN")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected THEN statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let body = res.register(this.expr());
    if (res.error) return res;

    return res.success(new WhileNode(condition, body));
  }

  func_def() {
    // console.log("func_def");
    let res = new ParseResult();

    if (!this.cur_token.matches("KEYWORD", "FUNC")) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected FUNC statement"
        )
      );
    }

    res.register_advance();
    this.advance();

    let var_name_tok;

    if (this.cur_token.type != "IDENTIFIER") {
      var_name_tok = null;

      if (!this.cur_token.type == "LPAREN") {
        return res.failure(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_start,
            "Expected ( "
          )
        );
      }

      res.register_advance();
      this.advance();
    } else {
      var_name_tok = this.cur_token;
      res.register_advance();
      this.advance();
    }

    if (!this.cur_token.type == "LPAREN") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected ( "
        )
      );
    }

    res.register_advance();
    this.advance();

    let arg_name_toks = [];
    if (this.cur_token.type == "IDENTIFIER") {
      arg_name_toks.push(this.cur_token);
      res.register_advance();
      this.advance();

      while (this.cur_token.type == "COMMA") {
        res.register_advance();
        this.advance();

        if (!this.cur_token.type == "IDENTIFIER") {
          return res.failure(
            new IllegalSyntaxError(
              this.cur_token.pos_start,
              this.cur_token.pos_start,
              "Expected identifier "
            )
          );
        }

        arg_name_toks.push(this.cur_token);
        res.register_advance();
        this.advance();
      }

      if (!this.cur_token.type == "RPAREN") {
        return res.failure(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_start,
            "Expected ) "
          )
        );
      }
    }

    if (!this.cur_token.type == "RPAREN") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected ) "
        )
      );
    }

    res.register_advance();
    this.advance();

    if (!this.cur_token.type == "ARROW") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_start,
          "Expected -> "
        )
      );
    }

    res.register_advance();
    this.advance();

    let node_to_return = res.register(this.expr());

    if (res.error) return res;

    return res.success(
      new FuncDefNode(var_name_tok, arg_name_toks, node_to_return)
    );
  }

  list_expr() {
    // console.log("list_expr");
    let res = new ParseResult();
    let element_nodes = [];
    let pos_start = this.cur_token.pos_start.copy();

    if (this.cur_token.type != "SLPAREN") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_end,
          "Expected '['"
        )
      );
    }

    res.register_advance();
    this.advance();

    if (this.cur_token.type == "SRPAREN") {
      res.register_advance();
      this.advance();
    } else {
      element_nodes.push(res.register(this.expr()));
      if (res.error) {
        return res.failure(
          new IllegalSyntaxError(
            this.cur_token.pos_start,
            this.cur_token.pos_end,
            "Expected ']', 'VAR', 'IF', 'FOR', 'WHILE', 'FUN', int, float, identifier, '+', '-', '(', '[' or 'NOT'"
          )
        );
      }
    }

    while (this.cur_token.type == "COMMA") {
      res.register_advance();
      this.advance();

      element_nodes.push(res.register(this.expr()));
      if (res.error) return res;
    }

    if (this.cur_token.type != "SRPAREN") {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_end,
          "Expected ']'"
        )
      );
    }

    res.register_advance();
    this.advance();

    return res.success(
      new ListNode(element_nodes, pos_start, this.cur_token.pos_end.copy())
    );
  }

  atom() {
    // console.log("atom");
    let res = new ParseResult();
    let chk = this.cur_token;

    if (chk && ["INT", "FLOAT"].includes(chk.type)) {
      // console.log("atom number");
      res.register_advance();
      this.advance();
      return res.success(new NumberNode(chk));
    } else if (chk && ["STRING"].includes(chk.type)) {
      // console.log("atom string");
      res.register_advance();
      this.advance();
      return res.success(new StringNode(chk));
    } else if (chk && ["IDENTIFIER"].includes(chk.type)) {
      // console.log("atom identifier");
      res.register_advance();
      this.advance();
      return res.success(new VarAccessNode(chk));
    } else if (chk.type == "LPAREN") {
      // console.log("atom lparen");
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
    } else if (chk.type == "SLPAREN") {
      // console.log("atom slparen");
      let list_expr = res.register(this.list_expr());
      if (res.error) return res;
      return res.success(list_expr);
    } else if (chk.type == "KEYWORD" && chk.value == "IF") {
      // console.log("atom if");
      let if_expr = res.register(this.if_expr());
      if (res.error) return res.error;
      return res.success(if_expr);
    } else if (chk.type == "KEYWORD" && chk.value == "FOR") {
      let for_expr = res.register(this.for_expr());
      if (res.error) return res.error;
      return res.success(for_expr);
    } else if (chk.type == "KEYWORD" && chk.value == "WHILE") {
      let while_expr = res.register(this.while_expr());
      if (res.error) return res.error;
      return res.success(while_expr);
    } else if (chk.type == "KEYWORD" && chk.value == "FUNC") {
      let while_expr = res.register(this.func_def());
      if (res.error) return res.error;
      return res.success(while_expr);
    }

    return res.failure(
      new IllegalSyntaxError(
        chk.pos_start,
        chk.pos_end,
        res.error
          ? res.error.details
          : "Expected INT,FLOAT,identifier, + , - or )"
      )
    );
  }

  function_call = () => {
    let res = new ParseResult();
    let atom = res.register(this.atom());
    if (res.error) return res;

    if (this.cur_token.type == "LPAREN") {
      res.register_advance();
      this.advance();

      let call_args = [];

      if (this.cur_token.type == "RPAREN") {
        res.register_advance();
        this.advance();
      } else {
        call_args.push(res.register(this.expr()));
        if (res.err) {
          return res.failure(
            new IllegalSyntaxError(
              this.cur_token.pos_start,
              this.cur_token.pos_start,
              "Expected , OR )"
            )
          );
        }

        while (this.cur_token.type == "COMMA") {
          res.register_advance();
          this.advance();

          call_args.push(new NumberNode(this.cur_token));
          if (res.error) return res;

          res.register_advance();
          this.advance();
        }

        if (!this.cur_token.type == "RPAREN") {
          return res.failure(
            new IllegalSyntaxError(
              this.cur_token.pos_start,
              this.cur_token.pos_start,
              "Expected )"
            )
          );
        }
        res.register_advance();
        this.advance();
      }
      return res.success(new CallNode(atom, call_args));
    }
    return res.success(atom);
  };

  power() {
    return this.bin_op(this.function_call, ["POWER"], this.factor);
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

  term = () => {
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
  };

  bin_op(func, ops, funcb = null) {
    if (funcb === null) {
      funcb = func;
    }

    let res = new ParseResult();
    var left = res.register(func());

    if (res.error) {
      return res;
    }

    while (
      (this.cur_token && ops.includes(this.cur_token.type)) ||
      ops.some(
        (op) => this.cur_token.type == op[0] && this.cur_token.value === op[1]
      )
    ) {
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

  comp_expr = () => {
    let res = new ParseResult();

    if (this.cur_token.matches("KEYWORD", "NOT")) {
      let op_token = res.register_advance();
      this.advance();

      let node = res.register(this.comp_expr());
      if (res.error) {
        return res;
      }
      return res.success(new UnaryNode(op_token, node));
    }

    let node = res.register(
      this.bin_op(this.arith_expr, [
        "GT",
        "LT",
        "GTE",
        "LTE",
        "NE",
        "EQUALS",
        "DE",
      ])
    );

    if (res.error) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_end,
          "Expected INT,FLOAT,identifier, + , - , ), NOT"
        )
      );
    }

    return res.success(node);
  };

  arith_expr = () => {
    return this.bin_op(this.term, ["PLUS", "MINUS"]);
  };

  statements() {
    let res = new ParseResult();
    let statements = [];
    let pos_start = this.cur_token.pos_start.copy();

    while (this.cur_token.type == "NEWLINE") {
      res.register_advance();
      this.advance();
    }

    // Register the first expression
    let statement = res.register(this.expr());
    if (res.error) return res;
    statements.push(statement);

    let more_statements = true;

    while (true) {
      let newline_count = 0;

      // Count newlines and advance the current token
      while (this.cur_token.type == "NEWLINE") {
        res.register_advance();
        this.advance();
        newline_count += 1;
      }

      if (newline_count === 0) {
        more_statements = false;
      }

      if (!more_statements) break;

      // Try registering the next expression
      statement = res.try_register(this.expr());
      if (!statement) {
        this.reverse(res.to_reverse_count);
        more_statements = false;
        continue;
      }
      statements.push(statement);
    }

    return res.success(
      new ListNode(statements, pos_start, this.cur_token.pos_end.copy())
    );
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
    // var left = res.register(this.term());
    // if (res.err) {
    //   return res;
    // }

    // while (this.cur_token && ["PLUS", "MINUS"].includes(this.cur_token.type)) {
    //   let op_token = this.cur_token;
    //   res.register_advance();
    //   this.advance();
    //   let right = res.register(this.term());
    //   if (res.err) {
    //     return res;
    //   }
    //   left = new BinOpNode(left, op_token, right);
    // }

    // return res.success(left);
    let node = res.register(
      this.bin_op(this.comp_expr, [
        ["KEYWORD", "AND"],
        ["KEYWORD", "OR"],
      ])
    );

    if (res.err) {
      return res.failure(
        new IllegalSyntaxError(
          this.cur_token.pos_start,
          this.cur_token.pos_end,
          "Expected VAR , ) or a number"
        )
      );
    }

    return res.success(node);
  }
}

// *******************HELPER INTERPRETOR***************
// *******************HELPER INTERPRETOR***************

class Value {
  constructor() {
    this.set_pos();
    this.set_context();
  }

  set_pos(pos_start = null, pos_end = null) {
    this.pos_start = pos_start;
    this.pos_end = pos_end;
    return this;
  }

  set_context(context = null) {
    this.context = context;
    return this;
  }

  added_to(other) {
    return [null, this.illegalOperation(other)];
  }

  subtracted_by(other) {
    return [null, this.illegalOperation(other)];
  }

  multiplied_by(other) {
    return [null, this.illegalOperation(other)];
  }

  divided_by(other) {
    return [null, this.illegalOperation(other)];
  }

  powered_by(other) {
    return [null, this.illegalOperation(other)];
  }

  get_comparison_de(other) {
    return [null, this.illegalOperation(other)];
  }

  get_comparison_ne(other) {
    return [null, this.illegalOperation(other)];
  }

  get_comparison_lt(other) {
    return [null, this.illegalOperation(other)];
  }

  get_comparison_gt(other) {
    return [null, this.illegalOperation(other)];
  }

  get_comparison_lte(other) {
    return [null, this.illegalOperation(other)];
  }

  get_comparison_gte(other) {
    return [null, this.illegalOperation(other)];
  }

  get_anded_by(other) {
    return [null, this.illegalOperation(other)];
  }

  get_orred_by(other) {
    return [null, this.illegalOperation(other)];
  }

  notted() {
    return [null, this.illegalOperation()];
  }

  execute(args) {
    return new RTResult().failure(this.illegalOperation());
  }

  copy() {
    throw new Error("No copy method defined");
  }

  isTrue() {
    return false;
  }

  illegalOperation(other = null) {
    if (!other) other = this;
    return new RTError(
      this.pos_start,
      other.pos_end,
      "Illegal operation",
      this.context
    );
  }
}

class Numbers extends Value {
  constructor(value) {
    super();
    this.value = value;
    this.set_pos();
    this.set_context();
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

  get_comparison_de(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) === Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_comparison_ne(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) !== Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_comparison_gt(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) > Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_comparison_lt(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) < Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_comparison_gte(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) >= Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_comparison_lte(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) <= Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_anded_by(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) && Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  get_orred_by(other) {
    if (typeof Number(other.value) === "number" && !isNaN(other.value)) {
      let res = new Numbers(Number(this.value) || Number(other.value));
      res.set_context(this.context);
      return [res, null];
    }
  }

  notted() {
    let res = this.value == 0 ? new Numbers(Number(1)) : new Numbers(Number(0));
    res.set_context(this.context);
    return [res, null];
  }

  copy() {
    let copy = new Numbers(this.value);
    copy.set_pos(this.pos_start, this.pos_end);
    copy.set_context(this.context);
    return copy;
  }

  toString() {
    return this.value;
  }
}

Numbers.null = new Numbers(0);
Numbers.false = new Numbers(0);
Numbers.true = new Numbers(1);
Numbers.math_PI = new Numbers(Math.PI);

class Strings extends Value {
  constructor(value) {
    super();
    this.value = value;
  }

  added_to(other) {
    if (other instanceof Strings) {
      return [
        new Strings(this.value + other.value).set_context(this.context),
        null,
      ];
    } else {
      return [null, new Value.illegalOperation(other)];
    }
  }

  // multiplied_by(other) {
  //   if (other instanceof Strings) {
  //     return [
  //       new Strings(this.value * other.value).set_context(this.context),
  //       null,
  //     ];
  //   } else {
  //     return [null, new Value.illegalOperation(other)];
  //   }
  // }

  isTrue() {
    return this.value.length > 0;
  }

  copy() {
    let copy = new Strings(this.value);
    copy.set_pos(this.pos_start, this.pos_end);
    copy.set_context(this.context);
    return copy;
  }
}

class Lists extends Value {
  constructor(value) {
    super();
    this.value = value;
  }

  // Add a new element to the list
  added_to(other) {
    const newList = this.copy();
    newList.value.push(other.value);
    return [newList, null];
  }

  // Remove element by index
  subtracted_by(other) {
    if (other instanceof Numbers) {
      const newList = this.copy();
      try {
        newList.value.splice(other.value, 1);
        return [newList, null];
      } catch (e) {
        return [
          null,
          new RTError(
            other.pos_start,
            other.pos_end,
            "Element at this index could not be removed from list because index is out of bounds",
            this.context
          ),
        ];
      }
    } else {
      return [null, new Value.illegal_operation(other)];
    }
  }

  // Concatenate lists
  multiplied_by(other) {
    if (other instanceof Lists) {
      const newList = this.copy();
      newList.value = newList.value.concat(other.value);
      return [newList, null];
    } else {
      return [null, new Value.illegal_operation(other)];
    }
  }

  // Retrieve element by index
  divided_by(other) {
    if (other instanceof Numbers) {
      try {
        return [new Placeholder(this.value[other.value]), null];
      } catch (e) {
        return [
          null,
          new RTError(
            other.pos_start,
            other.pos_end,
            "Element at this index could not be retrieved from list because index is out of bounds",
            this.context
          ),
        ];
      }
    } else {
      return [null, new Value.illegal_operation(other)];
    }
  }

  // Copy the list
  copy() {
    return new Lists([...this.value]); // Create a new list with copied value
  }

  // Represent the list as a string
  // toString() {
  //   return `[${this.value.map((x) => x.toString()).join(", ")}]`;
  // }
}

class BaseFunction extends Value {
  constructor(name) {
    super();
    this.name = name || "<anonymous>";
  }

  generate_new_context() {
    const new_context = new Context(this.name, this.context, this.pos_start);
    new_context.symbol_table = new SymbolTable(new_context.parent.symbol_table);
    return new_context;
  }

  check_args(arg_names, args) {
    const res = new RTResult();
    // console.log("args", args);
    // console.log("arg_names", arg_names);

    if (args.length > arg_names.length) {
      return res.failure(
        new RTError(
          this.pos_start,
          this.pos_end,
          `${args.length - arg_names.length} too many args passed into ${this}`,
          this.context
        )
      );
    }

    if (args.length < arg_names.length) {
      return res.failure(
        new RTError(
          this.pos_start,
          this.pos_end,
          `${arg_names.length - args.length} too few args passed into ${this}`,
          this.context
        )
      );
    }

    return res.success(null);
  }

  populate_args(arg_names, args, exec_ctx) {
    for (let i = 0; i < args.length; i++) {
      const arg_name = arg_names[i];
      const arg_value = args[i];
      arg_value.set_context(exec_ctx);
      exec_ctx.symbol_table.set(arg_name, arg_value);
    }
  }

  check_and_populate_args(arg_names, args, exec_ctx) {
    const res = new RTResult();
    res.register(this.check_args(arg_names, args));
    if (res.error) return res;
    this.populate_args(arg_names, args, exec_ctx);
    return res.success(null);
  }
}

class FunctionValue extends BaseFunction {
  constructor(name, body_node, arg_names) {
    super(name);
    this.body_node = body_node;
    this.arg_names = arg_names;
  }

  execute(args) {
    const res = new RTResult();
    const interpreter = new Interpretor();
    const exec_ctx = this.generate_new_context();

    res.register(this.check_and_populate_args(this.arg_names, args, exec_ctx));
    if (res.error) return res;

    const value = res.register(interpreter.visit(this.body_node, exec_ctx));
    if (res.error) return res;
    return res.success(value);
  }

  copy() {
    const copy = new FunctionValue(this.name, this.body_node, this.arg_names);
    copy.set_context(this.context);
    copy.set_pos(this.pos_start, this.pos_end);
    return copy;
  }
}

class BuiltInFunction extends BaseFunction {
  constructor(name) {
    super(name);
  }

  execute(args) {
    const res = new RTResult();
    const exec_ctx = this.generate_new_context();

    const method_name = `execute_${this.name}`;
    const method = this[method_name] || this.no_visit_method.bind(this);

    res.register(
      this.check_and_populate_args(args, method.arg_names, exec_ctx)
    );
    if (res.error) return res;

    const return_value = res.register(method(exec_ctx));
    if (res.error) return res;
    return res.success(return_value);
  }

  no_visit_method(node, context) {
    throw new Error(`No execute_${this.name} method defined`);
  }

  copy() {
    const copy = new BuiltInFunction(this.name);
    copy.set_context(this.context);
    copy.set_pos(this.pos_start, this.pos_end);
    return copy;
  }

  // #####################################

  // execute_print(exec_ctx) {
  //   console.log(String(exec_ctx.symbol_table.get("value")));
  //   return new RTResult().success(Numbers.null);
  // }

  static execute_print(exec_ctx) {
    console.log(String(exec_ctx.symbol_table.get("value")));
    return new RTResult.success(new Placeholder(Numbers.null));
  }
}

BuiltInFunction.execute_print.arg_names = ["value"];
BuiltInFunction.print = BuiltInFunction.execute_print;

class Placeholder {
  constructor(value = null) {
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

  toString() {
    return this.value;
  }
}

class SymbolTable {
  constructor(parent = null) {
    this.symbols = {};
    this.parent = parent;
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
    // console.log("Visit", node.constructor.name);
    const methodName = "visit_" + node.constructor.name;
    const method = this[methodName] || this.no_visit;

    return method.apply(this, [node, context]);
  }

  no_visit(node, context) {
    console.log("no visit", node);
    // throw new ExpectedCharError(
    //   "No visit method defined for " + node.constructor.name
    // );
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

    value = value
      .copy()
      .set_pos(node.pos_start, node.pos_end)
      .set_context(context);
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

  visit_ListNode(node, context) {
    let res = new RTResult();
    let value = [];

    for (let element of node.element_nodes) {
      value.push(res.register(this.visit(element, context)).value);
      if (res.error) return res;
    }

    return res.success(
      new Lists(value)
        .set_context(context)
        .set_pos(node.pos_start, node.pos_end)
    );
  }

  visit_StringNode(node, context) {
    let rtresult = new RTResult();

    let res = new Strings(node.value);
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
    } else if (node.op_token && node.op_token.type == "DE") {
      [result, error] = left.get_comparison_de(right);
    } else if (node.op_token && node.op_token.type == "NE") {
      [result, error] = left.get_comparison_ne(right);
    } else if (node.op_token && node.op_token.type == "GT") {
      [result, error] = left.get_comparison_gt(right);
    } else if (node.op_token && node.op_token.type == "GTE") {
      [result, error] = left.get_comparison_gte(right);
    } else if (node.op_token && node.op_token.type == "LT") {
      [result, error] = left.get_comparison_lt(right);
    } else if (node.op_token && node.op_token.type == "LTE") {
      [result, error] = left.get_comparison_lte(right);
    } else if (node.op_token && node.op_token.matches("KEYWORD", "AND")) {
      [result, error] = left.get_anded_by(right);
    } else if (node.op_token && node.op_token.matches("KEYWORD", "OR")) {
      [result, error] = left.get_orred_by(right);
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
    } else if (node.op_token && node.op_token.type.matches("KEYWORD", "NOT")) {
      [result, error] = number.notted();
    }

    if (error) {
      return rtresult.failure(error);
    }

    return rtresult.success(number.set_pos(node.start_pos, node.end_pos));
  }

  visit_IfNode(node, context) {
    let res = new RTResult();
    for (let [condition, expr] of node.cases) {
      let condition_value = res.register(this.visit(condition, context));
      if (res.error) return res.error;
      if (condition_value.value) {
        let expr_value = res.register(this.visit(expr, context));
        if (res.error) return res;
        return res.success(expr_value);
      }
    }

    if (node.else_case) {
      let else_value = res.register(this.visit(node.else_case, context));
      if (res.error) return res;
      return res.success(else_value);
    }

    return res.success(new Placeholder());
  }

  visit_ForNode(node, context) {
    let res = new RTResult();

    // Get the start value
    let start_value = res.register(this.visit(node.start_value_node, context));
    if (res.error) return res;

    // Get the end value
    let end_value = res.register(this.visit(node.end_value_node, context));
    if (res.error) return res;

    // Get the step value, or default to 1
    let step_value;
    if (node.step_value_node) {
      step_value = res.register(this.visit(node.step_value_node, context));
      if (res.error) return res;
    } else {
      step_value = new Numbers(1); // Default step
    }

    // Initialize the loop variable
    let i = Number(start_value.value);

    // Determine loop condition based on step_value
    const condition =
      step_value.value >= 0
        ? () => i < end_value.value
        : () => i > end_value.value;

    // Loop while the condition is true
    while (condition()) {
      context.symbol_table.set(node.var_name_tok.value, new Numbers(i));
      i += Number(step_value.value); // Increment or decrement based on step_value

      // Visit the body of the loop
      res.register(this.visit(node.body_node, context));
      if (res.error) return res;
      // Re-evaluate the condition to prevent infinite loop
    }
    return res.success(new Placeholder());
  }

  visit_WhileNode(node, context) {
    let res = new RTResult();

    while (true) {
      // Visit the condition node and check if there is an error
      let condition = res.register(this.visit(node.condition_node, context));
      if (res.error) return res;
      // Break the loop if the condition is not true
      if (!condition.value) break;

      // Visit the body of the while loop and check for errors
      res.register(this.visit(node.body_node, context));
      if (res.error) return res;
    }

    // Return success once the loop has completed
    return res.success(new Placeholder());
  }

  visit_FuncDefNode(node, context) {
    const res = new RTResult();

    const funcName = node.var_name_tok ? node.var_name_tok.value : null;
    const bodyNode = node.body_node;
    const argNames = node.arg_name_toks.map((argName) => argName.value);
    const funcValue = new FunctionValue(funcName, bodyNode, argNames)
      .set_context(context)
      .set_pos(node.pos_start, node.pos_end);

    if (node.var_name_tok) {
      context.symbol_table.set(funcName, funcValue);
    }
    // console.log("funcValue", funcValue);
    return res.success(new Placeholder(`Function <${funcName}>`));
  }

  visit_CallNode(node, context) {
    const res = new RTResult();
    const args = [];
    let valueToCall = res.register(this.visit(node.node_to_call, context));
    if (res.error) return res;
    valueToCall = valueToCall.copy().set_pos(node.pos_start, node.pos_end);
    // console.log("node", node);
    // console.log("valueToCall", valueToCall);

    for (let argNode of node.arg_nodes) {
      args.push(res.register(this.visit(argNode, context)));
      if (res.error) return res;
    }
    let returnValue = res.register(valueToCall.execute(args));
    // console.log("returnValue", returnValue);
    if (res.error) return res;

    returnValue = returnValue
      .copy()
      .set_pos(node.pos_start, node.pos_end)
      .set_context(context);
    return res.success(returnValue);
  }
}

// ***************** INTERPRETOR ENDS ********************

// ************** RUN *************************

// *********************************************

let global_symbol_table = new SymbolTable();
global_symbol_table.set("NULL", Numbers.null);
global_symbol_table.set("TRUE", Numbers.true);
global_symbol_table.set("FALSE", Numbers.false);
global_symbol_table.set("MATH_PI", Numbers.math_PI);
global_symbol_table.set("tp", new Placeholder("timepass"));
// console.log("BuiltInFunction.print", BuiltInFunction.print);
global_symbol_table.set("PRINT", BuiltInFunction.print);
// global_symbol_table.set("PRINT_RET", BuiltInFunction.print_ret);
// global_symbol_table.set("INPUT", BuiltInFunction.input);
// global_symbol_table.set("INPUT_INT", BuiltInFunction.input_int);
// global_symbol_table.set("CLEAR", BuiltInFunction.clear);
// global_symbol_table.set("CLS", BuiltInFunction.clear);
// global_symbol_table.set("IS_NUM", BuiltInFunction.is_number);
// global_symbol_table.set("IS_STR", BuiltInFunction.is_string);
// global_symbol_table.set("IS_LIST", BuiltInFunction.is_list);
// global_symbol_table.set("IS_FUN", BuiltInFunction.is_function);
// global_symbol_table.set("APPEND", BuiltInFunction.append);
// global_symbol_table.set("POP", BuiltInFunction.pop);
// global_symbol_table.set("EXTEND", BuiltInFunction.extend);

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
  return [result.value?.value, result.error];
  // return [AST.node, null];
  // return [tokens, null];
};
