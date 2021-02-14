// device list with preselected message IDs and associated identifiers
module.exports.obj = {
    sunny_boy: {
        "id": "1",
        "values": {
            "6100_00464800": {
                "name": "phase1_voltage",
                "divider": 100
            },
            "6100_00465700": {
                "name": "frequency",
                "divider": 100
            },
            "6100_40465300": {
                "name": "phase1_current",
                "divider": 1000
            },
            "6100_0046C200": {
                "name": "phase1_power",
                "divider": 1
            }
        }
    },

    sunny_tripower: {
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
    },

    sunny_boy_storage: {
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
    }
};