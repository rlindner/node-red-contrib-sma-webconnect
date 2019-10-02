# node-red-contrib-sma-webconnect

Node-RED node to query the Webconnect interface of SMA inverters.

## Compatibility
The implementation has been tested with an ethernet connected Sunny Tripower 10.0 but should work with various similiar models. I'm happy to compile a compatiblity list of successfully tested models here.

## Install

```
npm install node-red-contrib-sma-webconnect
```

## Configure

Configure the IP address, user group and password in the node properties. Uncheck the "Use HTTPS connection" checkbox if your inverter doesn't support HTTPS.

![Node properties](node-properties.png)

## Example message payload

```json
{
  "available_sessions": 3,
  "grid_consumption": 0,
  "grid_feedin": 6546,
  "phase1_voltage": 230.12,
  "phase2_voltage": 231.01,
  "phase3_voltage": 230.55,
  "power": 7608
}
```

## Login sessions
In my testings I've ran into problems with the maximum number of sessions the webserver supports (4 in my case). The node creates a session and reuses that until the node is restarted or the session expires. If you're using a reasonable small interval (I'm using 5 seconds) to query the inverter the session normally shouldn't expire. Otherwise a session expires after around 6,5 hours according to my testings. But it may happen that a created session get's lost when the node is stopped ungracefully. Logins to the web interface via a web browser count against the same session limit as well.

## Network requirements
This node tries to collect the metrics very agressively, i. e.:
* short network timeouts of 1500ms
* timed out requests are retried after 100ms
* retries are attempted 3 times
