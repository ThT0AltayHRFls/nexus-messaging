# Nexus Messaging

Nexus Messaging, konuşmaları, toplulukları, hikâyeleri ve video akışını tek bir
mobil deneyimde bir araya getiren modern bir mesajlaşma uygulamasıdır. Uygulama
Android için imzalı APK olarak üretilebilir ve her `main` gönderiminde GitHub
Release olarak yayınlanabilir.

## Nexus nedir?

Nexus; yalnızca mesaj göndermek yerine insanların birbirleriyle farklı şekillerde
bağlantı kurmasını amaçlar. Bire bir sohbetlerden grup konuşmalarına, herkese açık
kanallardan kısa ve uzun videolara kadar günlük iletişimin temel parçalarını tek
bir yerde tutar.

Uygulama şu deneyimleri sunar:

- Bire bir konuşmalar ve gerçek zamanlı mesajlaşma
- Grup sohbetleri ve herkese açık kanallar
- Hikâyeler ve topluluk güncellemeleri
- Kısa ve uzun video akışı
- Profil fotoğrafı, biyografi ve durum mesajı
- Tepkiler, yorumlar, yanıtlar ve sabitleme
- Kişi, grup ve kanal araması
- Bildirim tercihleri ve gizlilik ayarları
- Fotoğraf yükleme ve medya paylaşımı
- Nexus’un tüm özelliklerini açıklayan “About Nexus” ekranı

## Proje yapısı

```text
artifacts/
├── nexus-app/                 # Expo Router mobil uygulaması
│   ├── app/                   # Giriş, sekmeler ve uygulama ekranları
│   ├── components/            # Avatar, mesaj, video ve bilgi widget'ları
│   ├── context/               # Kimlik doğrulama, socket ve bildirim durumu
│   ├── lib/api.ts             # Mobil istemci API katmanı
│   └── app.json               # Expo ve Android uygulama yapılandırması
└── api-server/                # Express API ve Socket.IO sunucusu

lib/
├── db/                        # Drizzle ORM şeması
├── api-spec/                  # OpenAPI sözleşmesi
├── api-client-react/          # Üretilen React API istemcisi
└── api-zod/                   # Üretilen Zod tipleri

.github/workflows/
└── build-android.yml          # Otomatik imzalı APK ve GitHub Release akışı
```

## Kullanılan teknolojiler

- Expo SDK 54 ve React Native 0.81
- Expo Router ile dosya tabanlı mobil yönlendirme
- Express 5 ve Socket.IO
- PostgreSQL ve Drizzle ORM
- TypeScript
- pnpm workspace
- GitHub Actions
- Android Gradle Plugin ve JDK 17

## Yerel geliştirme

### Gereksinimler

- Node.js 24
- pnpm 10
- PostgreSQL
- Expo CLI bağımlılıkları

Bağımlılıkları kurun:

```bash
pnpm install
```

Veritabanı bağlantısını sağlayın:

```bash
export DATABASE_URL="postgresql://..."
```

API sunucusunu çalıştırın:

```bash
pnpm --filter @workspace/api-server run dev
```

Mobil uygulama geliştirme sunucusunu başlatın:

```bash
pnpm --filter @workspace/nexus-app run dev
```

Uygulama, geliştirme ortamında API adresini şu sırayla seçer:

1. `EXPO_PUBLIC_API_URL`
2. `EXPO_PUBLIC_DOMAIN`
3. Yerel geliştirme için `http://localhost:5000`

Gerçek cihaz kullanırken `localhost` cihazın kendisini ifade eder. Bu nedenle
telefonla geliştirme yaparken erişilebilir bir API adresi mutlaka
`EXPO_PUBLIC_API_URL` olarak verilmelidir.

## Android uygulama kimliği ve ikon

- Uygulama adı: `Nexus`
- Android paket adı: `com.altayhr.nexus`
- Expo slug: `nexus-app`
- Başlangıç sürümü: `1.0.0`
- Ana uygulama ikonu: `artifacts/nexus-app/assets/images/icon_2.png`
- Splash ekranı ve Android adaptive icon aynı Nexus görselini kullanır.

İkon 1024 × 1024 PNG olarak depoda bulunur ve Android adaptive icon arka planı
Nexus’un koyu uzay temasına göre ayarlanmıştır. Native `android/` klasörü kaynak
koda eklenmez; GitHub Actions her derlemede `expo prebuild` ile temiz biçimde
yeniden üretir. Böylece yerel native dosyaların eski Expo ayarlarıyla çakışması
önlenir.

## GitHub Actions ile APK üretimi

`.github/workflows/build-android.yml` dosyası:

1. `main` dalındaki kodu alır.
2. Node.js, pnpm, JDK 17 ve Android SDK'yı kurar.
3. Bağımlılıkları kilitli sürümlerle yükler.
4. Expo Android projesini temiz biçimde üretir.
5. Release signing yapılandırmasını uygular.
6. GitHub run numarasından artan bir Android `versionCode` verir.
7. Release APK'yı derler.
8. APK'yı Actions artifact olarak saklar.
9. `v1.0.0-build.<run-number>` formatında kararlı GitHub Release oluşturur.
10. APK'yı Release dosyası olarak ekler.

Workflow hem `main` dalına yapılan push ile otomatik çalışır hem de GitHub
Actions ekranından elle başlatılabilir.

### API adresini tanımlama

APK'nın gerçek bir telefonda çalışabilmesi için GitHub deposunda şu repository
variable tanımlanmalıdır:

```text
NEXUS_API_URL=https://api.example.com
```

GitHub yolu:

```text
Settings → Secrets and variables → Actions → Variables → New repository variable
```

Elle workflow başlatırken `api_url` alanı verilirse repository variable'ın
yerine o değer kullanılır. API adresi verilmezse workflow bilerek durur; böylece
çalışmayan ve yanlışlıkla `localhost` adresine bağlanan bir APK yayınlanmaz.

### APK imzalama

İlk release'te gerekli signing anahtarı yoksa workflow rastgele ve güçlü
parolalarla yeni bir keystore üretir. Bu, kullanıcının ayrıca bilgisayarında
keytool çalıştırmasına gerek bırakmaz.

Android güncellemelerinin daha önceki APK'nın üzerine kurulabilmesi için sonraki
release'lerde aynı imza kimliği korunmalıdır. Bunun için GitHub Actions
Secrets bölümüne aşağıdaki dört değeri ekleyin:

```text
NEXUS_KEYSTORE_BASE64
NEXUS_KEY_ALIAS
NEXUS_KEYSTORE_PASSWORD
NEXUS_KEY_PASSWORD
```

`NEXUS_KEYSTORE_BASE64`, keystore dosyasının Base64 karşılığıdır. Keystore
parolalarını kaynak koda, README'ye, workflow çıktısına veya sohbet mesajlarına
yazmayın. Secrets bulunmadığında workflow yine APK üretir, ancak o çalıştırmaya
özel yeni bir imza anahtarı kullandığı için bu APK sonraki imzalı sürümlerle
aynı uygulamanın üzerine güncellenemeyebilir.

### Release dosyasını indirme

Workflow tamamlandığında:

1. GitHub deposunda **Releases** sekmesini açın.
2. En yeni `Nexus v...` release'ini seçin.
3. Release içindeki `.apk` dosyasını indirin.
4. Android cihazda kurulum izni istenirse yalnızca güvendiğiniz kaynaktan
   yüklemeye izin verin.

Her workflow run'ında ayrıca 30 gün saklanan bir Actions artifact'i bulunur.

## Kalite kontrolleri

Tüm workspace tiplerini kontrol etmek için:

```bash
pnpm run typecheck
```

Sadece mobil uygulamayı kontrol etmek için:

```bash
pnpm --filter @workspace/nexus-app run typecheck
```

API sözleşmesinde değişiklik yaptıktan sonra istemci ve Zod çıktısını yenileyin:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Güvenlik notları

- GitHub tokenleri kaynak koda veya git remote URL'sine yazılmamalıdır.
- GitHub Actions tokeni yalnızca Actions çalışma ortamında kullanılır.
- Keystore parolaları GitHub Secrets içinde tutulmalıdır.
- Yüklenen medya dosyaları kaynak koda commit edilmemelidir.
- Release workflow'u API adresi yoksa fail-fast davranır.
- Kullanıcı parolaları mobil cihazda yalnızca oturum tokeniyle birlikte güvenli
  uygulama depolamasında tutulur; token loglara yazılmaz.

## Sürüm yayınlama özeti

```text
Kod değişikliği → main push → Actions build → signed APK
→ Actions artifact → GitHub Release → APK indirilebilir
```

Yeni bir sürüm yayınlamadan önce `app.json` içindeki `expo.version` değerini
artırın. Workflow her çalıştırmada Android `versionCode` değerini otomatik
olarak yükseltir; bu, Google Play veya cihaz üzerindeki güncelleme sıralaması
için gereklidir.

## Lisans ve geliştirici

Nexus Messaging, AltayHR tarafından geliştirilmektedir. Proje içindeki
üçüncü taraf paketlerin lisansları kendi paket tanımları ve npm kayıtları
üzerinden takip edilmelidir.