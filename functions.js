module.exports = {
  parseResult: (bodyResult, config) => {
    var result = {};

    // initialize all values to 0
    for (const key of Object.keys(config.values)) {
      result[config.values[key].name] = 0;
    }

    for (const id in bodyResult) {
      const set = bodyResult[id];

      // iterate over messages from sma device
      for (const key in set) {
        if (config.values.hasOwnProperty(key)) {
          const value = set[key];

          if ((value != null) && (value[config.id] != null)) {
            var values = []; // value array

            // iterate over all elements in the message
            for (const elm of value[config.id]) {
              // if element contains an object with more than one key save the whole object
              if (Object.keys(elm).length > 1) {
                values.push(elm);
              }
              else {
                var tmp = 0;

                if (elm.val) {
                  // if element contains an object with only one key store it (mostly tags?)
                  if (elm.val[0]) {
                    tmp = elm.val[0];
                  }
                  else {
                    if (typeof elm.val === 'number' && config.values[key].divider) {
                      tmp = elm.val / config.values[key].divider;
                    }
                    else {
                      tmp = elm.val;
                    }
                  }
                }
                // add values to the array
                values.push(tmp);
              }
            }

            // store value in output message
            if (values.length > 1) {
              result[config.values[key].name] = values;
            }
            else {
              result[config.values[key].name] = values[0];
            }
          }
        }
      }
    }

    return result;
  }
};
