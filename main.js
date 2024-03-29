module.exports = function (RED) {
  const retry = require("requestretry");
  const functions = require("./functions.js");
  const parseResult = functions.parseResult;
  const devicePresets = require('./device-presets/');
  
  // read presets on init
  devicePresets.readPresets();
  var deviceConfigs = devicePresets.getConfigs();

  function request(uri, body, callback) {
    retry({
      method: "POST",
      uri,
      body,
      json: true,
      strictSSL: false,
      timeout: 1500,
      maxAttempts: 3,
      retryDelay: 100
    }, callback);
  }

  function buildUrl(https, host, path) {
    return (https ? "https" : "http") + "://" + host + path;
  }

  function login(node, callback) {
    const url = buildUrl(node.use_tls, node.ip_address, "/dyn/login.json");

    node.debug("requesting " + url);

    request(
      url,
      {
        right: node.right,
        pass: node.credentials.password
      }, (error, response, body) => {
        node.debug("response to " + url + ": " + JSON.stringify(response));

        var result;

        if (error) {
          node.error(error);
        } else if (response && response.statusCode == 301 && response.headers && response.headers.location) {
          if (response.headers.location.substring(0, 5) != response.request.uri.protocol) {
            node.error("detected an redirect to HTTPS, please change your configuration to use HTTPS");
          }
        } else if (body) {
          if (body.err) {
            node.error(body);
          } else if (body.result) {
            result = body.result.sid;
            node.sid = body.result.sid;

            node.log("session created: " + node.ip_address + " : " + body.result.sid);
          }
        }

        if (callback) {
          callback(result);
        }
      }
    );
  }

  function getValues(node, callback, onSessionTimeout) {
    const url = buildUrl(node.use_tls, node.ip_address, "/dyn/getValues.json?sid=" + node.sid);

    var message = {};

    // set default message according to device type
    if (node.use_custom_config) {
      message = node.custom_config;
    }
    else {
      message = eval(deviceConfigs[node.device_selection]);
    }

    const value_keys = Object.keys(message.values);

    node.debug("requesting " + url);

    request(
      url,
      {
        "destDev": [],
        "keys": value_keys
      }, (error, response, body) => {
        node.debug("response to " + url + ": " + JSON.stringify(response));

        if (error) {
          node.error(error);
        } else if (body) {
          if (body.err) {
            if (body.err == "401") {
              if (onSessionTimeout) {
                onSessionTimeout();
              }
            } else {
              node.error(body);
            }
          } else if (body.result) {
            if (callback) {
              const result = parseResult(body.result, message);
              callback(result);
            }
          }
        }
      }
    );
  }

  function getFreeSessionsCount(node, callback) {
    const url = buildUrl(node.use_tls, node.ip_address, "/dyn/sessionCheck.json");

    node.debug("requesting " + url);

    request(
      url,
      {},
      (error, response, body) => {
        node.debug("response to " + url + ": " + JSON.stringify(response));

        if (error) {
          node.error(error);
        } else if (body) {
          if (body.result && body.result.cntFreeSess != null) {
            if (callback) {
              callback(body.result.cntFreeSess);
            }
          } else {
            node.log(body);
          }
        }
      }
    );
  }

  function logout(node, callback) {
    if (node.ip_address) {
      const url = buildUrl(node.use_tls, node.ip_address, "/dyn/logout.json?sid=" + node.sid);

      node.log(url);

      request(
        url,
        {},
        (error, response, body) => {
          node.debug("response to " + url + ": " + JSON.stringify(response));

          var result = false;

          if (error) {
            node.error(error);
          } else if (body) {
            if (body.result && body.result.login != null) {
              if (body.result.isLogin == false) {
                result = true;

                node.log("session closed: " + node.sid);
                node.sid = null;
              }
            } else {
              node.log(body);
            }
          }

          if (callback) {
            callback(result);
          }
        }
      );
    }
  }

  function query(node, retries, completion) {
    if (retries > 0) {
      if (node.sid) {
        getValues(node, (result) => {
          getFreeSessionsCount(node, (count) => {
            result.available_sessions = count;

            completion(result);
          })
        }, () => {
          login(node, (sid) => {
            query(node, retries - 1, completion);
          });
        })
      } else {
        login(node, (sid) => {
          query(node, retries - 1, completion);
        });
      }
    }
  }

  function SMAWebconnectNode(config) {
    RED.nodes.createNode(this, config);
    this.ip_address = config.ip_address;
    this.use_tls = config.use_tls;
    this.right = config.right;
    this.device_selection = config.device_selection;
    this.custom_config = {};
    this.use_custom_config = false;
    this.sid = null;

    // change device names to new format till refactoring has been done
    /** REMOVE AFTER REFACTOR */
    if (this.device_selection === 'sb_tripower') {
      this.device_selection = 'sunny_tripower';
    } else if (this.device_selection === 'sb_storage') {
      this.device_selection = 'sunny_boy_storage'
    }
    /** END */

    var node = this;
  
    node.on("input", function(msg) {
      if (msg.payload.hasOwnProperty('sma_config')) {
        node.use_custom_config = true;
        node.custom_config = msg.payload.sma_config;
      }

      query(node, 3, (result) => {
        msg.payload = result;
        node.send(msg);
      });
    });
    node.on("close", function(done) {
      logout(node, (result) => {
        done();
      });
    });
  }

  RED.nodes.registerType("sma-webconnect", SMAWebconnectNode, {
    credentials: {
      password: { type: "password" }
    }
  });
};
