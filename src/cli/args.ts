export type OutputFormat = "table" | "json" | "minimal";

export interface CliArgs {
  model?: string;
  all?: boolean;
  force?: boolean;
  list?: boolean;
  results?: boolean;
  resultsModel?: string;
  help?: boolean;
  verbose?: boolean;
  output?: OutputFormat;
  debug?: boolean;
  task?: string;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--model":
      case "-m":
        args.model = argv[++i];
        break;
      case "--all":
      case "-a":
        args.all = true;
        break;
      case "--force":
      case "-f":
        args.force = true;
        break;
      case "--list":
      case "-l":
        args.list = true;
        break;
      case "--results":
      case "-r":
        args.results = true;
        // Check if next arg is a model id (not a flag)
        if (argv[i + 1] && !argv[i + 1]?.startsWith("-")) {
          args.resultsModel = argv[++i];
        }
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--verbose":
      case "-v":
        args.verbose = true;
        break;
      case "--output":
      case "-o": {
        const next = argv[i + 1];
        if (next && !next.startsWith("-")) {
          const format = next;
          if (format === "json" || format === "table" || format === "minimal") {
            args.output = format;
          }
          i++;
        }
        break;
      }
      case "--debug":
      case "-d":
        args.debug = true;
        break;
      case "--task":
      case "-t":
        args.task = argv[++i];
        break;
    }
  }

  return args;
}
