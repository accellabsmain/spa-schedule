# 🧠 SPA — Scheduled Personal Assistant
> **AI-Driven Minimalist Checklist App**

Aplikasi pelacak jadwal harian berbasis AI dengan pendekatan *privacy-first* dan desain *ultra-minimalis* yang terinspirasi dari antarmuka Notion dan Linear. Dirancang khusus untuk mempermudah personalisasi jadwal harian menggunakan struktur input JSON yang dihasilkan oleh AI, lengkap dengan pelacakan tingkat kepatuhan waktu (*time adherence rate*) secara *real-time*.

---

## 🚀 Fitur Utama

*   **✨ AI-Generated Schedule Ingestion**
    Menerima input mentah berbasis `.json` yang dibuat melalui asisten AI untuk memisahkan kegiatan secara otomatis tanpa entri manual yang rumit.
*   **🔒 7-Day Persistent Session**
    Menggunakan Supabase Auth dengan konfigurasi *session persistence* selama 7 hari penuh untuk meminimalkan kebutuhan re-login yang mengganggu.
*   **📂 Dynamic Accordion Categories**
    Mengelompokkan aktivitas secara otomatis berdasarkan kategori (misalnya: *Deep Work*, *Morning Routine*, *Rest*) menggunakan dropdown akordeon yang bersih dan intuitif.
*   **⏱️ Real-time Time-Adherence Badges**
    Menghitung selisih waktu aktual saat tugas dicentang dengan target waktu yang direncanakan:
    *   🟢 **On Time**: Toleransi $\le 5$ menit dari target.
    *   🟡 **Delayed**: Terlambat $6 - 30$ menit dari target.
    *   🔴 **Late**: Terlambat $> 30$ menit dari target.
*   **📊 Daily Analytics**
    Menampilkan skor persentase kepatuhan harian secara instan di bagian atas dashboard untuk memantau produktivitas harian Anda.
*   **⚡ Serverless & Edge Ready**
    Dibangun di atas Next.js App Router dan di-deploy secara optimal di Vercel.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS & shadcn/ui
*   **Database & Auth:** Supabase (Client SDK & `@supabase/ssr`)
*   **Icons:** Lucide React
*   **Deployment:** Vercel

---

## 🗄️ Struktur Database (Supabase)

Jalankan query SQL berikut di **SQL Editor** Supabase Anda untuk membuat tabel-tabel yang diperlukan:

### 1. Skema Tabel

```sql
-- Tabel Schedules
create table schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date default current_date not null,
  overall_badge varchar(50),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel Tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references schedules(id) on delete cascade not null,
  task_name text not null,
  target_time time without time zone not null,
  completed_time time without time zone,
  category varchar(100) not null,
  notes text,
  is_done boolean default false not null
);
```

### 2. Kebijakan Keamanan (Row Level Security - RLS)

> [!IMPORTANT]
> Untuk mendukung pendekatan *privacy-first*, sangat disarankan untuk mengaktifkan RLS pada kedua tabel agar data pengguna tidak dapat diakses oleh pengguna lain.

```sql
-- Mengaktifkan RLS
alter table schedules enable row level security;
alter table tasks enable row level security;

-- Kebijakan untuk tabel schedules (Hanya pemilik yang dapat mengelola data mereka sendiri)
create policy "Pengguna hanya dapat mengelola jadwal mereka sendiri"
  on schedules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Kebijakan untuk tabel tasks (Hanya pemilik jadwal terkait yang dapat mengelola tugas)
create policy "Pengguna hanya dapat mengelola tugas pada jadwal mereka sendiri"
  on tasks for all
  using (
    exists (
      select 1 from schedules
      where schedules.id = tasks.schedule_id
      and schedules.user_id = auth.uid()
    )
  );
```

---

## 🤖 Format Input JSON AI (Contoh Ingest)

Aplikasi ini menerima struktur JSON berikut dari asisten AI Anda untuk memuat jadwal harian secara otomatis:

```json
{
  "date": "2026-05-18",
  "tasks": [
    {
      "task_name": "Morning Meditation & Planning",
      "target_time": "06:00:00",
      "category": "Morning Routine",
      "notes": "Fokus pada pernapasan dan tetapkan 3 prioritas hari ini."
    },
    {
      "task_name": "Deep Work: Coding Feature A",
      "target_time": "08:30:00",
      "category": "Deep Work",
      "notes": "Implementasikan state management dan integrasi API Supabase."
    },
    {
      "task_name": "Review PR & Team Sync",
      "target_time": "11:00:00",
      "category": "Collaboration",
      "notes": "Siapkan feedback untuk PR modul autentikasi."
    },
    {
      "task_name": "Power Nap / Rest",
      "target_time": "13:00:00",
      "category": "Rest",
      "notes": "Istirahat sejenak untuk memulihkan energi tubuh."
    }
  ]
}
```

---

## ⚙️ Pengaturan Supabase Auth (Sesi 7 Hari)

> [!TIP]
> Agar sesi login pengguna bertahan selama 7 hari penuh sesuai fitur utama, silakan ubah konfigurasi berikut di Dashboard Supabase Anda:
> 1. Buka dashboard **Supabase** -> **Authentication** -> **Providers** -> **Email**.
> 2. Buka bagian **Advanced Settings**.
> 3. Ubah **JWT Expiry** menjadi `604800` detik (setara dengan 7 hari).
> 4. Klik **Save**.

---

## 💻 Panduan Pengembangan Lokal

### 1. Kloning Repositori & Instalasi Dependensi
```bash
npm install
# atau
pnpm install
# atau
yarn install
```

### 2. Konfigurasi Environment Variables
Buat berkas `.env.local` di direktori utama proyek Anda dan isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Jalankan Dev Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya secara lokal.
