const fs = require("fs");
const readline = require("readline");

function parseTsx(filename) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filename),
    });

    const isClose = (line) => {
      const m7 = line.match(/(.+)<\/(.+)>\s*/);
      if (m7) return true;
      return false;
    };

    const parseLine = (line) => {
      const m10 = line.match(/^\s*\/\/=(.+)/);
      if (m10)
        return {
          type: "comment",
          value: m10[1],
        };
      const m7 = line.match(/^\s*\{\/\*=(.+)\*\/\}.*/);
      if (m7)
        return {
          type: "comment",
          value: m7[1],
        };
      const m9 = line.match(/^\s*\{\/\*(.+)\*\/\}.*/);
      if (m9)
        return {
          type: "skip",
          value: m9[1],
        };
      const m8 = line.match(/^\s*\{\/\*=(.+).*/);
      if (m8)
        return {
          type: "start-comment",
          value: m8[1],
        };
      const m1 = line.match(/^\s*<([^\s^\/.]+?)\s+.*\/>/);
      if (m1)
        return {
          type: "open-close",
          value: m1[1],
        };
      const m2 = line.match(/^\s*<([^\s^\/.]+?)\s+.*>/);
      if (m2)
        return {
          type: "open",
          value: m2[1],
        };
      const m3 = line.match(/^\s*<\/([^\s^\/.]+?)\s+.*>/);
      if (m3)
        return {
          type: "close",
          value: m3[1],
        };
      const m4 = line.match(/^\s*<([^\s^\/.]+?)\s*>/);
      if (m4)
        return {
          type: "open",
          value: m4[1],
        };
      const m5 = line.match(/^\s*<\/([^\s^\/.]+?)\s*>/);
      if (m5)
        return {
          type: "close",
          value: m5[1],
        };
      const m6 = line.match(/^\s*<([^\s^\/.]+?).*/);
      if (m6)
        return {
          type: "start",
          value: m6[1],
        };
    };

    let curLine = "";
    let stat = "parse";
    let indent = 0;
    let lineCount = 0;
    let result = [];

    rl.on("line", (line) => {
      lineCount++;
      curLine += line;
      const p = parseLine(curLine);
      if (p) {
        if (p.type === "start") {
          stat = "start";
          return;
        }
        if (p.type === "start-comment") {
          stat = "start-comment";
          curLine += "\\n";
          return;
        }
        if (p.type === "open") {
          if (isClose(curLine)) {
            p.type = "open-close";
          }
        }
        if (p.type === "close") indent--;
        stat = "parse";
        p.indent = indent;
        p.lineCount = lineCount;
        p.value = p.value
          .replace(/\\n/g, "\n")
          .split("\n")
          .map((v) => v.trim())
          .join("\n");
        // console.log("########");
        // console.log(curLine);
        result.push(p);
        if (p.type === "open") indent++;
      }
      if (stat === "start-comment") return;
      if (stat === "start") return;
      curLine = "";
    });

    rl.on("close", () => {
      resolve(result);
      // console.log(JSON.stringify(result, null, "  "));
    });
  });
}

function printCsv(result) {
  const indent = (indent, value, spaces) => {
    let d = "";
    for (let i = 0; i < spaces.length; i++) {
      for (let j = 0; j < spaces[i]; j++) {
        d += "_";
      }
      d += ":";
    }
    d += value;
    return d;
  };
  const skip = (line) =>
    line.type === "comment" || line.type === "close" || line.type === "skip";
  const indentSpaces = [0, 0, 0, 0];
  let maxlen = 0;
  result.forEach((line) => {
    if (skip(line)) return;
    const t = indent(line.indent, line.value, []);
    indentSpaces[line.indent] = t.length;
    line.indentSpace = [...indentSpaces].splice(0, line.indent);
    const s = t.padStart(
      line.indentSpace.reduce((a, b) => (a += b + 1), 0) + line.value.length,
      " "
    );
    if (maxlen < s.length) maxlen = s.length;
  });
  let s = "";
  result.forEach((line, i) => {
    if (skip(line)) return;
    s += `${line.lineCount.toString().padStart(5, " ")},`;
    // s += `${line.type}`.padEnd(10, " ");
    // s += `,`;
    // s += `${line.indent},`;
    s += `${indent(line.indent, line.value, line.indentSpace)}`.padEnd(
      maxlen,
      " "
    );
    s += `,`;
    if (i > 0) {
      let q = "";
      let n = i;
      for (let j = i - 1; j > 0; j--) {
        if (result[j].type === "comment") {
          n = j;
        } else {
          break;
        }
      }
      if (n != i) {
        for (let j = n; j < i; j++) {
          if (j > n) q += "\\n";
          const v = result[j].value.replace(/"/g, '\\"');
          q += `${v}`;
        }
      }
      s += q;
    }
    s += "\n";
  });
  return s;
}

async function main() {
  const filename = process.argv[2] || "";
  const result = await parseTsx(filename);
  const csv = printCsv(result);
  console.log(`,,,${filename}`);
  console.log(csv);
  // console.log(JSON.stringify(result, null, "  "));
}

main();
