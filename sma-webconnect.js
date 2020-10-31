module.exports = function (RED) {
  const retry = require("requestretry");

  const sb_tripower = {
    "id": "1",
    "values": {
      "6100_0046E500": {
        "name": "phase1_voltage",
        "divider": 100
      },
      "6100_0046E600": {
        "name": "phase2_voltage",
        "divider": 100
      },
      "6100_0046E700": {
        "name": "phase3_voltage",
        "divider": 100
      },
      "6100_40463600": {
        "name": "grid_feedin",
        "divider": 1
      },
      "6100_40463700": {
        "name": "grid_consumption",
        "divider": 1
      },
      "6100_40263F00": {
        "name": "power",
        "divider": 1
      }
    }
  };

  const sb_storage = {
    "id": "7",
    "values": {
      "6100_00295A00": {
        "name": "charge_percent",
        "divider": 1
      },
      "6100_00495C00": {
        "name": "voltage",
        "divider": 100
      },
      "6400_00496700": {
        "name": "overall_charge_wh",
        "divider": 1
      },
      "6100_00496900": {
        "name": "current_charging_w",
        "divider": 1
      },
      "6400_00497E00": {
        "name": "current_charging_wh",
        "divider": 1
      },
      "6400_00496800": {
        "name": "overall_discharge_wh",
        "divider": 1
      },
      "6100_00496A00": {
        "name": "current_discharge_w",
        "divider": 1
      },
      "6400_00496D00": {
        "name": "current_discharge_wh",
        "divider": 1
      },
      "6400_00496900": {
        "name": "charge_w",
        "divider": 1
      },
      "6100_40495B00": {
        "name": "temperature_deg",
        "divider": 10
      },
      "6180_08495E00": {
        "name": "state_charging",
        "divider": 1
      }
    }
  };

  var message = {};

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

    // set default message according to device type
    if (node.use_custom_config) {
      message = node.custom_config;
    }
    else {
      message = eval(node.device_selection);
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
            var result = {};

            // initialize all values to 0
            for (const key of value_keys) {
              result[message.values[key].name] = 0;
            }

            for (const id in body.result) {
              const set = body.result[id];

              // iterate over messages from sma device
              for (const key in set) {
                if (message.values.hasOwnProperty(key)) {
                  const value = set[key];

                  if (value != null) {
                    var val_cnt = 0;  // value counter
                    var val_arr = []; // value array
                    
                    // iterate over all elements in the message
                    for (const elm of value[message.id]) {
                      if (elm.val) {
                        var tmp = null;

                        // if element contains an object store its first value (mostly tags in the messages)
                        if (elm.val[0]) {
                          tmp = elm.val[0];
                        }
                        else {
                          if (typeof elm.val === 'number' && message.values[key].divider) {
                            tmp = elm.val / message.values[key].divider;
                          }
                          else {
                            tmp = elm.val;
                          }
                        }

                        // add values to the array
                        val_arr[val_cnt++] = tmp;
                      }
                    }

                    // store value in output message
                    if (val_cnt > 1) {
                      result[message.values[key].name] = val_arr;
                    }
                    else {
                      result[message.values[key].name] = val_arr[0];
                    }
                  }
                }
              }
            }

            if (callback) {
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

    var node = this;
    node.on("input", function (msg) {
      if (msg.payload.hasOwnProperty('sma_config')) {
        node.use_custom_config = true;
        node.custom_config = msg.payload.sma_config;
      }

      query(node, 3, (result) => {
        msg.payload = result;
        node.send(msg);
      });
    });
    node.on("close", function (done) {
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
