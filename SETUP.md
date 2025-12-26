# Setup Guide - Kasaku

Project Kasaku sekarang menggunakan arsitektur Client-Server yang terintegrasi dengan database MySQL.

## Prasyarat

- Node.js (v16+)
- MySQL (v5.7+ atau MariaDB) - Bisa menggunakan Laragon/XAMPP
- NPM (terinstall bersama Node.js)

## Struktur Folder

- `/backend`: Node.js Express API Server
- `/frontend`: React + Vite Frontend Application

## Cara Instalasi dan Menjalankan

### 1. Setup Database MySQL

Pastikan MySQL server sudah berjalan.

1. Buka terminal di folder `backend`.
2. Jalankan perintah untuk membuat database dan mengisi data awal:
   ```bash
   npm install
   mysql -u root -e "source database/create_mysql_db.sql"
   mysql -u root -e "source database/seed.sql"
   ```
   *(Asumsi user root tanpa password. Jika ada password, tambahkan flag -p)*

### 2. Setup Backend

1. Buka terminal di folder `backend`.
2. Buat file `.env` (jika belum ada) dengan konten:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=kasaku_db
   FRONTEND_URL=http://localhost:5173
   ```
3. Jalankan server:
   ```bash
   npm start
   ```
   Server akan berjalan di `http://localhost:3000`.

### 3. Setup Frontend

1. Buka terminal baru di folder `frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Pastikan file `.env.local` ada dengan konten:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
4. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:5173`.

## Verify Connection

Buka browser dan akses `http://localhost:5173`. Aplikasi seharusnya menampilkan data dari database (misalnya: Nama Perusahaan "PT Maju Bersama").

## Login Info Default

Untuk pengembangan, otentikasi saat ini disederhanakan (mock auth/single user).
Data admin default di database:
- Admin: Budi Santoso
- Perusahaan: PT Maju Bersama
