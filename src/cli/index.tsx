#!/usr/bin/env bun
import { render } from "ink";
import React from "react";
import { App } from "./components/App";
import { parseArgs } from "./args";

const args = parseArgs(process.argv.slice(2));
render(React.createElement(App, { args }));
