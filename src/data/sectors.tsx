
export type SectorId = "beauty" | "fleet" | "construction";

export type Appointment = {
  id: number;
  customer: string;
  service: string;
  resource: string;
  time: string;
  status: "Onaylandı" | "Devam Ediyor" | "Bekliyor";
};

export type Sector = {
  id: SectorId;
  name: string;
  shortName: string;
  description: string;
  stats: {
    label: string;
    value: string;
    detail: string;
  }[];
  appointments: Appointment[];
};

export const sectors: Sector[] = [
  {
    id: "beauty",
    name: "Unisex Kuaför & Güzellik",
    shortName: "Beauty Studio",
    description: "Güzellik ve kişisel bakım operasyonları",
    stats: [
      { label: "Bugünkü Randevular", value: "24", detail: "Planlanan işlemler" },
      { label: "Aktif Personel", value: "8", detail: "6 personel müsait" },
      { label: "Tamamlanan İşler", value: "18", detail: "Bugünkü hizmetler" },
      { label: "Doluluk Oranı", value: "%78", detail: "Örnek kapasite verisi" },
    ],
    appointments: [
      { id: 1, customer: "Ayşe Yılmaz", service: "Saç Kesimi & Fön", resource: "Elif Demir", time: "09:30", status: "Onaylandı" },
      { id: 2, customer: "Mehmet Kaya", service: "Erkek Saç Kesimi", resource: "Burak Yıldız", time: "10:15", status: "Devam Ediyor" },
      { id: 3, customer: "Zeynep Çelik", service: "Saç Boyama", resource: "Elif Demir", time: "11:30", status: "Bekliyor" },
    ],
  },
  {
    id: "fleet",
    name: "Vidanjör / Kombine / Kuka",
    shortName: "Altyapı Operasyon",
    description: "Araç ve saha hizmeti planlaması",
    stats: [
      { label: "Planlanan İşler", value: "16", detail: "Bugünkü görevler" },
      { label: "Aktif Araçlar", value: "9", detail: "3 araç müsait" },
      { label: "Tamamlanan İşler", value: "11", detail: "Günlük operasyon" },
      { label: "Kapasite Kullanımı", value: "%72", detail: "Örnek kapasite verisi" },
    ],
    appointments: [
      { id: 1, customer: "ABC Yapı", service: "Vidanjör Hizmeti", resource: "34 VDJ 101", time: "09:00", status: "Onaylandı" },
      { id: 2, customer: "Merkez Yönetim", service: "Kombine Kanal Açma", resource: "34 KMB 202", time: "10:30", status: "Devam Ediyor" },
      { id: 3, customer: "XYZ İşletme", service: "Kuka Hizmeti", resource: "34 KKA 303", time: "13:00", status: "Bekliyor" },
    ],
  },
  {
    id: "construction",
    name: "Altyapı İnşaat",
    shortName: "İnşaat Operasyon",
    description: "Şantiye, ekip ve iş makinesi planlaması",
    stats: [
      { label: "Planlanan Görevler", value: "12", detail: "Bugünkü görevler" },
      { label: "Aktif Ekipler", value: "5", detail: "2 ekip müsait" },
      { label: "Tamamlanan Görevler", value: "7", detail: "Günlük operasyon" },
      { label: "Kaynak Kullanımı", value: "%81", detail: "Örnek kapasite verisi" },
    ],
    appointments: [
      { id: 1, customer: "Kuzey Projesi", service: "Saha Keşfi", resource: "Keşif Ekibi A", time: "08:30", status: "Onaylandı" },
      { id: 2, customer: "Merkez Altyapı", service: "Kazı Planlaması", resource: "Ekskavatör 01", time: "10:00", status: "Devam Ediyor" },
      { id: 3, customer: "Güney Şantiye", service: "Boru Hattı Kontrolü", resource: "Saha Ekibi B", time: "14:00", status: "Bekliyor" },
    ],
  },
];
