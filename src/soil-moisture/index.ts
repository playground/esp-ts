import { WifiSetup } from './wifi-setup';

const wifi = new WifiSetup();

// Set up moisture sensor on pin A0 (or whatever pin you're using)
wifi.setMoistureSensorPin('A0');

// Start BLE advertising
wifi.startAdvertising();

// Start reading moisture values every 2 seconds
wifi.startMoistureReading(2000);

wifi.getDeviceInfo();
