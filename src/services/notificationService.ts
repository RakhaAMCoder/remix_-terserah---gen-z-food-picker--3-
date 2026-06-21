import { LocalNotifications } from '@capacitor/local-notifications';
import { Language, translations } from '../translations';

export class NotificationService {
  static async requestPermissions() {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  static async scheduleDailyNotifications(language: Language) {
    // Clear existing notifications to avoid duplicates
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]
    });

    const isID = language === 'id';

    const schedules = [
      {
        id: 1,
        title: isID ? '🌅 Awali Harimu!' : '🌅 Start Your Day!',
        body: isID ? 'Makan pagi dulu yuk biar semangat menjalani hari! Cari menu sarapan hits di Terserah App.' : 'Have breakfast first to energize your day! Find trending breakfast spots in Terserah App.',
        hour: 7,
        minute: 0
      },
      {
        id: 2,
        title: isID ? '☀️ Waktunya Lunch!' : '☀️ Lunch Time!',
        body: isID ? 'Perut sudah mulai keroncongan? Cek rekomendasi makan siang paling mantap di sekitar kamu!' : 'Hungry yet? Check out the best lunch recommendations around you!',
        hour: 12,
        minute: 0
      },
      {
        id: 3,
        title: isID ? '🌤️ Sore-sore Enaknya Nyemil' : '🌤️ Afternoon Snack Time',
        body: isID ? 'Waktunya break sore! Cari cemilan atau kopi segar buat mood booster hari ini.' : "Time for an afternoon break! Find snacks or fresh coffee to boost your mood today.",
        hour: 16,
        minute: 0
      },
      {
        id: 4,
        title: isID ? '🌙 Makan Malam, Yuk!' : '🌙 Dinner Time!',
        body: isID ? 'Lengkapi harimu dengan makan malam spesial. Ada banyak pilihan menarik menantimu!' : 'Complete your day with a special dinner. Lots of interesting choices awaiting you!',
        hour: 19,
        minute: 0
      },
      {
        id: 5,
        title: isID ? '🌑 Lapar Malam Ini?' : '🌑 Late Night Cravings?',
        body: isID ? 'Belum kenyang juga? Sini Intip menu makan malam yang masih buka sekarang.' : 'Not full yet? Take a peek at dinner menus that are still open now.',
        hour: 21,
        minute: 30
      },
      {
        id: 6,
        title: isID ? '🌃 Midnight Snack Hunter' : '🌃 Midnight Snack Hunter',
        body: isID ? 'Laper tengah malam emang gak bisa bohong. Cari kuliner yang setia menemanimu di jam segini!' : "Midnight hunger is real. Find culinary spots that are loyal to accompany you at this hour!",
        hour: 0,
        minute: 0
      }
    ];

    await LocalNotifications.schedule({
      notifications: schedules.map(s => ({
        id: s.id,
        title: s.title,
        body: s.body,
        schedule: {
          allowWhileIdle: true,
          on: {
            hour: s.hour,
            minute: s.minute
          },
          repeats: true
        },
        actionTypeId: 'OPEN_APP'
      }))
    });
  }

  static async cancelAll() {
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]
    });
  }
}
