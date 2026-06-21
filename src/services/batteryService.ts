import { BatteryData } from '../types';

export class BatteryService {
  static async getBatteryStatus(): Promise<BatteryData> {
    try {
      // @ts-ignore
      const battery = await navigator.getBattery();
      return {
        level: Math.round(battery.level * 100),
        isCharging: battery.charging
      };
    } catch (error) {
      console.error('Error getting battery status:', error);
      return { level: 100, isCharging: false };
    }
  }

  static subscribeToBatteryChanges(callback: (data: BatteryData) => void): (() => void) {
    let cleanup = () => {};
    // @ts-ignore
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      // @ts-ignore
      navigator.getBattery().then((battery) => {
        const update = () => {
          callback({
            level: Math.round(battery.level * 100),
            isCharging: battery.charging
          });
        };

        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
        
        // Initial call
        update();

        cleanup = () => {
          battery.removeEventListener('levelchange', update);
          battery.removeEventListener('chargingchange', update);
        };
      });
    }
    return () => cleanup();
  }
}
