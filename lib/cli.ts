import fs from "fs";
import tty from "tty";
import { diff } from "./index";
import { colorize } from "./colorize";

export default function(argv) {
  const options = require("dreamopt")(
    [
      "Usage: json-diff [-vjCk] first.json second.json",

      "Arguments:",
      "  first.json              Old file #var(file1) #required",
      "  second.json             New file #var(file2) #required",

      "General options:",
      "  -v, --verbose           Output progress info",
      "  -C, --[no-]color        Colored output",
      "  -j, --raw-json          Display raw JSON encoding of the diff #var(raw)",
      "  -k, --keys-only         Compare only the keys, ignore the differences in values #var(keysOnly)"
    ],
    argv
  );

  if (options.verbose) {
    process.stderr.write(`${JSON.stringify(options, null, 2)}\n`);
  }

  if (options.verbose) {
    process.stderr.write("Loading files...\n");
  }
  const data1 = fs.readFileSync(options.file1, "utf8");
  const data2 = fs.readFileSync(options.file2, "utf8");

  if (options.verbose) {
    process.stderr.write("Parsing old file...\n");
  }
  const json1 = JSON.parse(data1);
  if (options.verbose) {
    process.stderr.write("Parsing new file...\n");
  }
  const json2 = JSON.parse(data2);

  if (options.verbose) {
    process.stderr.write("Running diff...\n");
  }
  const result = diff(json1, json2, options);

  if (options.color) {
    // @ts-ignore
    options.color = tty.isatty(process.stdout.fd);
  }

  if (result) {
    if (options.raw) {
      if (options.verbose) {
        process.stderr.write("Serializing JSON output...\n");
      }
      process.stdout.write(JSON.stringify(result, null, 2));
    } else {
      if (options.verbose) {
        process.stderr.write("Producing colored output...\n");
      }
      process.stdout.write(colorize(result, { color: options.color }));
    }
  } else {
    if (options.verbose) {
      process.stderr.write("No diff");
    }
  }

  if (result) {
    return process.exit(1);
  }
}
