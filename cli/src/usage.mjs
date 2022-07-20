/*
* Copyright 2021 Comcast Cable Communications Management, LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* SPDX-License-Identifier: Apache-2.0
*/

// CLI usage metadata which drives the "node cli.mjs --help" output

'use strict';

const lines = [
  { cmdInfo: "--help",                                                           comment: "Show this helpful usage information" },
  { cmdInfo: "--user <userId> ...(see below)...",                                comment: "Target the given user; Overrides the .mf.config.json file, if present" },
  { cmdInfo: "--port 3333 ...(see below)...",                                    comment: "If running Mock Firebolt on a non-standard port" },
  { cmdInfo: "--quiet ...(see below)...",                                        comment: "Don't emit command summary text; helpful for exporting state" },
  { cmdInfo: "--health",                                                         comment: "Performs health check on Mock Firebolt" },
  { cmdInfo: "--state",                                                          comment: "Asks Mock Firebolt to dump its state; handy for debugging" },
  { cmdInfo: "--revert",                                                         comment: "Go back to the way things were when server started (w.r.t. state)" },
  { cmdInfo: "--latency 0",                                                      comment: "Set min and max latency values to given value" },
  { cmdInfo: "--latency 50 --latency 100",                                       comment: "Set min and max latency values to given values; min 1st, max 2nd" },
  { cmdInfo: "--method device.type --latency 3000",                              comment: "Set min and max latency values to given value for given method" },
  { cmdInfo: "--method device.type --latency 2500 --latency 3500",               comment: "Set min and max latency values to given values for given method; min 1st, max 2nd" },
  { cmdInfo: "--mode default",                                                   comment: "Set mode to DEFAULT; mock overrides used first, OpenRPC examples second" },
  { cmdInfo: "--mode box",                                                       comment: "Set mode to BOX; Only OpenRPC examples used/returned. Overrides unused" },
  { cmdInfo: "--method account.id --result \"'111'\"",                           comment: "Set result for given method the next time it is called" },
  { cmdInfo: "--method device.id --errCode -32888 --errMsg \"Sad day for you\"", comment: "Set error code & msg for method" },
  { cmdInfo: "--upload ../examples/slow.json  ",                                 comment: "See examples/ directory for, uh, examples" },
  { cmdInfo: "--event ../examples/device-onDeviceNameChanged1.event.json",       comment: "Send event (method, result keys expected)" },
  { cmdInfo: "--sequence ../examples/events1.sequence.json  ",                   comment: "Send an event sequence (See examples/device-onDeviceNameChanged.sequence.json)" },
  { cmdInfo: "--session start/stop  ",                                           comment: "Start/Stop Firebolt session recording" },
];

function usage() {
  console.log('Usage Examples:');
  const len = Math.max.apply(Math, lines.map(function(o) { return o.cmdInfo.length; })) + 1;
  lines.forEach((line) => {
    console.log(`  node cli.mjs ${line.cmdInfo.padEnd(len, ' ')} ${line.comment}`);
  });
  console.log('Note: You can also use commands that look like:');
  console.log('  ./mf.sh --help');
}

export { usage };
