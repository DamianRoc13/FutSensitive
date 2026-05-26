import { BleManager as BLE, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { DeviceEventEmitter } from 'react-native';

class BleManagerClass {
  public readonly manager: BLE;
  private device: Device | null = null;
  private characteristic: Characteristic | null = null;
  private characteristicTX: Characteristic | null = null;
  private readonly SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
  private readonly CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
  private readonly CHARACTERISTIC_UUID_TX = "8676d059-e970-4383-b715-464521477755";

  constructor() {
    this.manager = new BLE();
  }

  public startScan(callback: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error || !device) return;
      callback(device);
    });
  }

  public async enableBluetooth(){
    try {
      return await this.manager.enable()
    } catch (error) {
      console.log('Error activando el Bluetooth', error)
    }
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

      const characteristicTX = characteristics.find(c => c.uuid === this.CHARACTERISTIC_UUID_TX);
      if (!characteristicTX) throw new Error("Característica TX no encontrada");

      this.device = connectedDevice;
      this.characteristic = characteristic;
      this.characteristicTX = characteristicTX;

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

  public onBatteryNotification(callback: (data: { master: number; slave1: number; slave2: number }) => void) {
    if (!this.characteristicTX) {
      console.warn('CharacteristicTX no disponible');
      return;
    }

    const subscription = this.characteristicTX.monitor((error, characteristic) => {
      if (error) {
        console.warn('Error al recibir notificación:', error);
        return;
      }

      if (characteristic?.value) {
        try {
          const decoded = Buffer.from(characteristic.value, 'base64').toString('utf8');
          // Parsear formato "M:XX,S1:XX,S2:XX"
          const parts = decoded.split(',');
          const master = parseInt(parts[0]?.split(':')[1] || '0', 10);
          const slave1 = parseInt(parts[1]?.split(':')[1] || '0', 10);
          const slave2 = parseInt(parts[2]?.split(':')[1] || '0', 10);

          callback({ master, slave1, slave2 });
        } catch (e) {
          console.warn('Error parseando datos de batería:', e);
        }
      }
    });

    return subscription;
  }

  public async disconnect() {
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
      this.characteristic = null;
      this.characteristicTX = null;
    }
  }

  public getConnectedDevice(): Device | null {
    return this.device;
  }
}

const BleManager = new BleManagerClass();
export default BleManager;