import { SoftAPSetup } from "softap-setup";
declare const NRF: any; // Espruino BLE API
declare const analogRead: any; // Espruino analog read function

export class WifiSetup {
  sap: any;
  ble: any;
  isAdvertising: boolean = false;
  moisturePin: string = "A0"; // Default analog pin for moisture sensor
  moistureReadInterval: any;
  
  constructor() {
    this.sap = new SoftAPSetup({
    protocol: "http",
      port: 80,
    });
    this.initBLE();
  }

  private initBLE() {
    if (typeof NRF !== "undefined") {
      this.ble = NRF;
      // Set device name for BLE advertising
      this.ble.setAddress("c0:ff:ee:c0:ff:ee");
      this.ble.setServices(
        {
          0xffff: {
            // Custom service UUID
            0xfff0: {
              // Custom characteristic UUID
              value: [0],
              maxLen: 1,
              writable: true,
              onWrite: (evt: any) => {
                this.handleBLEWrite(evt);
              },
            },
          },
        },
        { advertise: ["0xFFFF"] }
      );
    }
  }

  startAdvertising() {
    if (this.ble && !this.isAdvertising) {
      this.ble.setAdvertising(
        {
          0x180f: [0x90, 0x00], // Custom advertising data
        },
        { name: "ESP-Device" }
      );
      this.isAdvertising = true;
      console.log("BLE advertising started");
    }
  }

  stopAdvertising() {
    if (this.ble && this.isAdvertising) {
      this.ble.setAdvertising({});
      this.isAdvertising = false;
      console.log("BLE advertising stopped");
    }
  }

  private handleBLEWrite(evt: any) {
    console.log("BLE write received:", evt.data);
    // Handle incoming BLE data here
  }

  init() {}
  getDeviceInfo() {
    this.sap.deviceInfo((err: any, data: any) => {
      if (err) {
        throw err;
      }
      console.log(
        "Device ID: %s, claimed: %s",
        data.id,
        data.claimed ? "yes" : "no"
      );
    });
  }

  setMoistureSensorPin(pin: string) {
    this.moisturePin = pin;
  }

  readMoisture(): number {
    try {
      // analogRead returns value between 0 and 1
      const rawValue = analogRead(this.moisturePin);
      // Convert to percentage (0-100)
      const percentage = Math.round((1 - rawValue) * 100);
      return percentage;
    } catch (err) {
      console.log("Error reading moisture sensor:", err);
      return -1;
    }
  }

  startMoistureReading(intervalMs: number = 1000) {
    // Stop any existing interval
    this.stopMoistureReading();

    // Start new reading interval
    this.moistureReadInterval = setInterval(() => {
      const moisture = this.readMoisture();
      console.log("Moisture level:", moisture + "%");

      // If BLE is connected, send the moisture data
      if (this.ble && this.isAdvertising) {
        this.ble.setServices({
          0xffff: {
            0xfff0: {
              value: [moisture],
              maxLen: 1,
              notify: true,
            },
          },
        });
      }
    }, intervalMs);
  }

  stopMoistureReading() {
    if (this.moistureReadInterval) {
      clearInterval(this.moistureReadInterval);
      this.moistureReadInterval = null;
    }
  }
}