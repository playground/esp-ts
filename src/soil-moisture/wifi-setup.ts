import { SoftAPSetup } from 'softap-setup';

export class WifiSetup {
  sap: any;

  constructor() {
    this.sap = new SoftAPSetup({
      protocol: 'http',
      port: 80
    })
  }
  init() {

  }
  getDeviceInfo() {
    this.sap.deviceInfo((err: any, data: any) => {
      if(err) {
        throw err
      }
      console.log("Device ID: %s, claimed: %s", data.id, data.claimed ? "yes" : "no");
    })
  }
}