# 🔐 Nexus Message - Secure Messaging App

Güvenli ve hızlı mesajlaşma uygulaması.

## ✨ Özellikler

✅ **Google OAuth Girişi** - Error 400 düzeltildi
✅ **Gmail Kayıt/Giriş** - Connection hatası çözüldü
✅ **İzin Sistemi** - Kamera, Konum, Mikrofon, Bildirim, Galeri, Depolama
✅ **Otomatik Yedekleme** - Mesajları cihazda güvenli yedekle
✅ **Splash Screen** - 3 saniye video oynatma
✅ **Modern UI** - Neon design, dark mode
✅ **Gerçek-Zamanlı Mesajlaşma** - Supabase entegrasyonu

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Expo CLI: `npm install -g expo-cli`

### Kurulum

```bash
cd nexus-fixed/artifacts/nexus-app

# Bağımlılıkları kur
npm install

# .env dosyası oluştur
cp .env.example .env

# Değerleri doldur (Google OAuth, Supabase vb)
nano .env
```

### Uygulamayı Çalıştır

```bash
# Development
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 🔑 Environment Variables

`.env` dosyasını aşağıdaki bilgilerle doldurun:

```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 📱 Ekranlar

- **Splash** - Video oynatma (3 saniye)
- **Login** - Google OAuth + Email/Şifre
- **Register** - Hesap oluşturma
- **Permissions** - İzin istek sistemi
- **Messages** - Mesajlaşma ana ekranı
- **Settings** - Ayarlar ve profil

## 🛡️ Güvenlik

- ✅ Şifreli yedekleme
- ✅ Secure AsyncStorage
- ✅ Firebase Auth entegrasyonu
- ✅ HTTPS only
- ✅ End-to-End Encryption (e2ee)

## 📂 Klasör Yapısı

```
nexus-app/
├── app/
│   ├── (auth)/       # Login, Register, Permissions
│   ├── (tabs)/       # Main app tabs
│   └── splash.tsx    # Splash screen
├── components/       # Reusable components
├── context/          # Auth, Theme context
├── lib/
│   └── backup.ts     # Backup sistem
├── assets/           # Görseller, videolar
└── package.json      # Bağımlılıklar
```

## 🐛 Hata Giderme

### Google OAuth Error 400
→ Client ID'leri `.env` dosyasında kontrol edin

### Connection Error
→ Supabase URL ve key'i doğru yapılandırın

### İzin Hataları
→ Android: `app.json` permissions kontrol edin
→ iOS: `app.json` Info.plist değerleri kontrol edin

## 📝 Yedekleme

Uygulamada otomatik yedekleme açılıysa:
- Cihazda: `${FileSystem.documentDirectory}nexus_backups/`
- Format: JSON
- Otomatik: Her mesajlaşmada

Yedekten Geri Yükleme:
```typescript
import { BackupService } from '@/lib/backup';
const backup = await BackupService.restoreBackup();
```

## 🚀 Build

```bash
# Android APK
expo build:android

# iOS IPA
expo build:ios

# Web
expo export:web
```

## 📊 Versyon

- **v2.0.0** - Full rewrite
- Video splash screen
- Real permissions system
- Gerçek backup sistemi

## 👨‍💻 Geliştirme

Yazı: Muhammed
Teknoloji: React Native, Expo, TypeScript

## 📞 Destek

Hata veya soru için: balinmuhammed722@gmail.com

---

**Built with 💙 by Nexus Team**
