import axios from 'axios'
import { exec } from 'child_process'
import config from '../../server/src/config.mjs'

let mfProcess
const startMf = "npm run build && npm run start"
const mfStarted = "Listening on HTTP port"
const mfDirectory = "../../server/src"
const mfHost = 'localhost'
const mfUserHeader = 'x-mockfirebolt-userid'

function url(host, port, path) {
  return `http://${host}:${port}${path}`;
}

function fireboltCommand(command) {
  //Establish a WS connection to MF living at port 9998
  //Send the firebolt command given by "command"
  //Return the response from MF
}

/**
 * 
 * Make an HTTP call to MF using an auto-generated host:port
 * 
 * @param {String} method Optional HTTP Method to use (Default is GET/POST)
 * @param {String} path The API path for MF
 * @param {String} user Optional MF User
 * @param {String} body Optional body for POST/PUT/etc requests
 * 
 * @return Promise yielding an axios response on resolve() and error on reject()
 */
async function callApi(path, user, body, method) {
  let httpPort = config.httpPort
  let fullUrl = url(mfHost, httpPort, path)

  let headers = user ? {
    mfUserHeader: user
  } : {}

  return new Promise((res, rej) => {
    if (body) {
      if (method == undefined || method == null || method == 'POST') {
        try {
          axios.post(fullUrl, body, headers).then((response) => {
            res(response)
          })
        } catch(err) {
          rej(err)
        }
      } else {
        //Try to use the method provided in "method"
        try {
          axios[method](fullUrl, body, headers).then((response) => {
            res(response)
          })
        } catch(err) {
          rej(err);
        }
      }
    } else {

      if (method == undefined || method == null || method == 'GET') {
        try {
          axios.get(fullUrl, headers).then((response) => {
            res(response)
          })
        } catch(err) {
          rej(err)
        }
      } else {
        try {
          axios[method](fullUrl, headers).then((response) => {
            res(response)
          })
        } catch(err) {
          rej(err)
        }
      }
    }
  })
}

function callMfCli(command) {
  //Send a command via cli/cli.mjs and return the response
  //Ex: callMfCli(command) should generate a call to the CLI like
  //"node cli/src/cli.mjs <command>"
}

/**
 * 
 * Start or stop the MF server
 * 
 * @param {Boolean} on True to start MF. False to terminate
 * 
 * @returns A Promise that will res() on success or rej() on failure
 */
async function mfState(on) {

  return new Promise((res, rej) => {
    if (on) {
      //MF is already running
      if (mfProcess && mfProcess.pid) {
        res("MF process already started. PID: " + mfProcess.pid)
      }

      let process = exec(startMf, mfDirectory)

      //Wait for "Listening on HTTP port" message for MF startup
      process.stdout.on('data', (data) => {
        if (data.includes(mfStarted)) {
          mfProcess = process
          res("MF started successfully")
        }
      })

      process.on('error', (err) => {
        rej("MF not started successfully: " + JSON.stringify(err))
      })

      process.on('close', (code) => {
        rej("MF not started. Terminated with code " + code)
      })
    } else {
      if (mfProcess && mfProcess.pid) {
        if (mfProcess.kill('SIGTERM')) {
          res("MF terminated successfully")
        } else {
          rej("Unable to terminate MF process")
        }
      } else {
        res("No MF process running")
      }
    }
  })
}