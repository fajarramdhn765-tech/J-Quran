import { AudioService } from './audioService';

export class NotificationService {
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  static sendNotification(title: string, body: string, playSound = true): boolean {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/favicon.ico',
        tag: 'jayz-quran-prayer',
      });

      if (playSound) {
        AudioService.playAdhanChime();
      }
      return true;
    } catch (e) {
      console.warn('Failed to dispatch notification', e);
      return false;
    }
  }

  static sendTestNotification(): boolean {
    const success = this.sendNotification(
      "Jay'z Quran — Uji Pengingat Adzan",
      'Waktu salat telah tiba. Panggilan suci memanggil kita untuk bersujud.'
    );
    if (!success) {
      // Fallback audio test if notifications blocked
      AudioService.playAdhanChime();
    }
    return success;
  }
}
