import { BleManager as BLE, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { DeviceEventEmitter } from 'react-native';

class BleManagerClass {
  public readonly manager: BLE;
  private device: Device | null = null;
  private characteristic: Characteristic | null = null;
  private readonly SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
  private readonly CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

  constructor() {
    this.manager = new BLE();
  }

  public startScan(callback: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error || !device) return;
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

      // Suscribirse a la desconexión
      connectedDevice.onDisconnected(() => {
        DeviceEventEmitter.emit('DeviceDisconnected');
        this.device = null;
        this.characteristic = null;
      });

      // Obtén y registra todos los servicios
      const services = await connectedDevice.services();
      console.log('Servicios disponibles:', services);

      // Busca el servicio con el UUID especificado
      const service = services.find(s => s.uuid === this.SERVICE_UUID);
      if (!service) throw new Error("Servicio no encontrado");

      // Obtén y registra todas las características del servicio
      const characteristics = await service.characteristics();
      console.log('Características disponibles:', characteristics);

      const characteristic = characteristics.find(c => c.uuid === this.CHARACTERISTIC_UUID);
      if (!characteristic) throw new Error("Característica no encontrada");

      this.device = connectedDevice;
      this.characteristic = characteristic;

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