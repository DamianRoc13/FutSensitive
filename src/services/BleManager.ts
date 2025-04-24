import { BleManager as BLE, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

class BleManagerClass {
  public readonly manager: BLE;
  private device: Device | null = null;
  private characteristic: Characteristic | null = null;

  constructor() {
    this.manager = new BLE();
  }

  public startScan(callback: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error || !device?.name) return;
      callback(device);
    });
  }

  public stopScan() {
    this.manager.stopDeviceScan();
  }

  public async connectTo(device: Device) {
    try {
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      const services = await connectedDevice.services();
      const characteristics = await services[0].characteristics();

      this.device = connectedDevice;
      this.characteristic = characteristics[0];

      return connectedDevice;
    } catch (e) {
      console.warn('Error al conectar:', e);
      throw e;
    }
  }

  public async sendCommand(command: string) {
    if (!this.device || !this.characteristic) return;
    const encoded = Buffer.from(command).toString('base64');
    await this.characteristic.writeWithResponse(encoded);
  }

  public async disconnect() {
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
      this.characteristic = null;
    }
  }

  public getConnectedDevice(): Device | null {
    return this.device;
  }
}

const BleManager = new BleManagerClass();
export default BleManager;
