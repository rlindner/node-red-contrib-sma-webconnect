# node-red-contrib-sma-webconnect

Node-RED node to query the web interface of SMA inverters or storage systems.

## Compatibility
The implementation has been tested with an ethernet connected Sunny Tripower 10.0 but should work with various similiar models. I'm happy to compile a compatiblity list of successfully tested models here.

## Install

```
npm install node-red-contrib-sma-webconnect
```

## Configure

Configure the IP address, user group and password in the node properties. Uncheck the "Use HTTPS connection" checkbox if your device doesn't support HTTPS.

![Node properties](node-properties.png)

## Example Message Payload

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

## Read Custom Values

The node provides preset configurations for Sunny Boy 1AV-40, Sunny Tripower and Sunny Boy Storage 2.5 units to read basic values from those devices. But it is also possible to configure the node with a input message to read additional values from your devices.

To read custom values the node needs an configuration object as payload under the "sma_config" key. This configuration consists of an id (`DeviceClassId`, see table below) and a list of ids of the values you want to read.

### Example input payload
```json
{
    "sma_config": {
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
    }
}
```
* `sma_config`: this will tell the node to use the provided input payload, the device selection in the node settings will be ignored (**required**)
* `id`: The DeviceClassId to tell the node how to extract the values (**required**)
* `values`: list of value ids that should be read (**required**)
  * `value_id`: id of value that should be read (**required**)
    * `name`: custom name for the read value (**required**)
    * `divider`: sets a divider for the read value (optional)

| Device Type | DeviceClassId |
|-------------|---------------|
| Inverter    | 1             |
| Battery     | 7             |
| Hybrid      | 9             |

### The following steps will show you how to read custom values from your device
The necessary message and value ids can easily be obtained by visiting the `/spotvalues` page of your device webinterface and by using the developer tools of your browser.

### How to find the DeviceClassId and the value ids

The following steps show you how to obtain the `DeviceClassId` ("message_id") and the value ids ("value_id") you will have to provide in the input payload to read custom values from the devices.

1. Connect to the web interface of your device, i.e. `http(s)://192.168.1.42/#/login`
2. Open the overview section of your device, i.e. `http(s)://192.168.1.42/#/spotvalues`
3. Open your browsers developer tools
4. Get the message `id` of your device by opening the network tab of the developer tools and selecting the XHR filter
    * select one of the responses from the `/getValues.json` endpoint

    | ![Find message id](find-message-id.png) |
    |:--:|
    | *the red is the message `id` and the green a possible `value_id`* |

5. get the `value_id` of your wanted values by using the inspect function of the developer tools
    * open the accordions and search for the values you want to read
    * use the inspect tool to select the displayed value and show the `value_id`
    
    | ![Find value id](find-value-ids.png) |
    |:--:|
    | *the value id should be a 13 character long string, in this example it's `6380_40251E00`* |

