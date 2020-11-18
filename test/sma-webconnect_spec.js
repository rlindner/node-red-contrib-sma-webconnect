var should = require("should");
var functions = require("../functions.js");

describe('sma-webconnect Node', function() {
  describe('parseResult', function() {
    it('should parse simple values', function() {
      const config = {
        "id": "1",
        "values": {
          "6100_0046E500": {
            "name": "phase1_voltage"
          }
        }
      }

      const response = {
        "xxxx-xxxxxxxx": {
          "6100_0046E500": {
            "1": [{
              "val": 23543
            }]
          }
        }
      }

      const result = functions.parseResult(response, config)

      result.should.eql({
        phase1_voltage: 23543
      });
    });

    it('should use the divider on simple values if provided', function() {
      const config = {
        "id": "1",
        "values": {
          "6100_0046E500": {
            "name": "phase1_voltage",
            "divider": 100
          }
        }
      }

      const response = {
        "xxxx-xxxxxxxx": {
          "6100_0046E500": {
            "1": [{
              "val": 23543
            }]
          }
        }
      }

      const result = functions.parseResult(response, config)

      result.should.eql({
        phase1_voltage: 235.43
      });
    });

    it('should return array values', function() {
      const config = {
        "id": "1",
        "values": {
          "6380_40251E00": {
            "name": "dc_power"
          }
        }
      }

      const response = {
        "xxxx-xxxxxxxx": {
          "6380_40251E00": {
            "1": [{
              "val": 156
            }, {
              "val": 404
            }]
          }
        }
      }

      const result = functions.parseResult(response, config)

      result.should.eql({
        dc_power: [156, 404]
      });
    });

    it('should return objects', function() {
      const config = {
        "id": "1",
        "values": {
          "6180_00522900": {
            "name": "unknown"
          }
        }
      }

      const response = {
        "xxxx-xxxxxxxx": {
          "6180_00522900": {
            "1": [{
              "low": 0,
              "high": 0,
              "val": null
            }]
          }
        }
      }

      const result = functions.parseResult(response, config)

      result.should.eql({
        unknown: {
          low: 0,
          high: 0,
          val: null
        }
      });
    });
  });
});
