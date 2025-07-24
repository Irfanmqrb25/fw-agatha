1. NAMA TAMPILAN “Portal Administrasi Lingkungan St. Agatha
2. Bahasa tampilan adalah Bahasa Indonesia
3. LAMAN LOGIN
- Terdiri dari 3 Tab:
o LOGIN:
 Terdiri dari form Username dan Password
 Buat notif pop-up terkait tindakan
o Register:
 Terdiri dari Cek nama Kepala Keluarga (proses registrasi akun baru dapat
dilanjutkan jika Nama Kepala Keluarga yang diinput sesuai dengan yang
tersimpan pada database dan setiap nama Kepala Keluarga yang
terdaftar pada system hanya dapat memiliki 1 akun)
 Buat fungsi pengecekan agar tidak ada Username yang sama
 Password (terdiri dari angka dan huruf)
 Tambahkan kolom passphrase (terdiri dari angka dan huruf) 
digunakan untuk otentikasi reset password agar tidak ada yang berbuat
iseng.
 Pengaturan otorisasi pengguna untuk register adalah setiap akun yang
berasal dari proses Register diberikan otorisasi “Umat”
 Tidak ada pengiriman konfirmasi melalui email untuk proses registrasi
 Buat notif popup terkait tindakan
o Lupa Password:
 Tahap 1 adalah lakukan verifikasi nama Kepala Keluarga. Proses dapat
dilanjutkan jika Nama Lengkap yang diinput sesuai dengan yang
tersimpan di database
 Tahap 2 minta passphrase.
 Tahap 3 input Password Baru dan Ulangi Password Baru.
4. DASHBOARD (Jadikan halaman Utama)
 Terdiri dari 1 page yang menampilkan data real time terkait:
 Resume Keuangan Lingkungan
o Datacard (Saldo Awal, Total Pemasukan, Total Pengeluaran, dan Saldo Akhir)
o Dapat di filter berdasarkan Bulan dan tahun
o Prioritas tampilan filter adalah bulan dan tahun sesuai sistem (GMT+7)
o Buat desainnya menarik namun sederhana agar mudah untuk dipahami
 Resume Keuangan IKATA
o Datacard (Saldo Awal, Pemasukan, Pengeluaran, Saldo Akhir)
o Dapat di filter berdasarkan Bulan dan tahun
o Prioritas tampilan filter adalah bulan dan tahun sesuai sistem (GMT+7)
o Buat desainnya menarik namun sederhana agar mudah untuk dipahami
 Resume Kesekretariatan
o Datacard (Total Kepala Keluarga, Jumlah Jiwa, KK Bergabung, KK Pindah,
Umat Meninggal Dunia, Tingkat Partisipasi Umat)
o Tingkat partisipasi umat merupakan rata-rata kehadiran umat dalam kegiatan
doling per bulan.
o Dapat di filter berdasarkan Bulan dan tahun
o Prioritas tampilan filter adalah bulan dan tahun sesuai sistem (GMT+7)
o Buat desainnya menarik namun sederhana agar mudah untuk dipahami
 List nama-nama Kepala Keluarga yang menunggak Iuran Dana Mandiri (seluruh Bulan
dan/atau Tahun tertunggak)
 List nama-nama Kepala Keluarga yang menunggak Iuran IKATA (seluruh Bulan
dan/atau Tahun tertunggak)
 Sidebar berisi daftar menu dan submenu
 Menu Dashboard  seluruh role
 Menu Publikasi (submenu Buat Publikasi  role sekretaris & wakilnya dan Daftar
Pengumuman  seluruh role)
 Menu Lingkungan (submenu Kas Lingkungan dan Dana Mandiri)  role bendahara
 Menu IKATA  role wakil Bendahara
 Menu Approval  role Bendahara
 Menu Histori Pembayaran  role Umat
 Menu Kesekretariatan (submenu Data Umat  role sekretaris & wakilnya , Doa
Lingkungan  role Ketua & wakilnya, sekretaris & wakilnya, Agenda  seluruh role)
 Setting (submenu Profil  role Umat, dan Ganti Password  seluruh role)
 Notifikasi yang terintegrasi dengan tindakan2 yang membutuhkan notifikasi global.
5. Menu LINGKUNGAN
 Submenu Kas Lingkungan
o Menampilkan Datacard (Saldo Awal, Pemasukan, Pengeluaran, Saldo Akhir)
o Menampilkan data transaksi yang pernah/sudah direkam (dapat difilter bulan
dan tahun)
o Prioritas data yang ditampilkan adalah bulan dan tahun sesuai system (GMT
+7)
o Berikan warna yang berbeda untuk jenis transaksi debit dan kredit agar mudah
dibedakan.
o Tombol “Input Transaksi” untuk Kas Lingkungan (form isian dengan dropdown
dinamis, apabila terlalu panjang tambahkan fitur dapat discroll keatas atau
kebawah)
o Tombol “Input Transaksi” berisi : Kotak dialog Tanggal Transaksi, Jenis Transaksi
(dropdown Uang Masuk dan Uang Keluar), Tipe Transaksi (jika Jenis transaksi
Uang Masuk maka pilihan Kolekte I, Kolekte II, Sumbangan Umat, dan
Penerimaan Lain-Lain. Jika Uang Keluar maka pilihan tipe transaksi adalah Biaya
Operasional, Penyelenggaraan Kegiatan, Pembelian, Sosial-Duka, Transfer
Dana ke IKATA, Lain-Lain), Keterangan, Debit (pemasukan), dan Kredit
(pengeluaran).
o Apabila Jenis Transaksi = Uang Masuk, tipe transaksi = Sumbangan Umat, pada
kolom Keterangan (tampilkan list Kepala Keluarga yang dapat dipilih)
o Apabila terdapat perekaman data dengan uraian : Jenis transaksi Uang Keluar
dengan pilihan Transfer Dana ke IKATA, Debit. Maka rekam otomatis data
tersebut pada submenu Kas IKATA, dengan rincian Jenis transaksi Uang Masuk
dengan pilihan Transfer Dana dari Lingkungan, dan nilai Debit.
o Tambahkan konfirmasi tambahan untuk tindakan diatas.
o Edit dan Hapus Data.
o Munculkan notifikasi kepada seluruh akun yang terdaftar apabila terdapat Jenis
Transaksi yang berhasil direkam.
o Notifikasi mencantumkan Tanggal, tipe transaksi terkait, Keterangan dan
nominalnya yang dikirimkan setiap minggu pada hari minggu jam 12.00
o Buat notifikasi pop-up atas setiap tindakan.
o Tombol Print PDF:
 Menu Print dalam format PDF
 Tampilan : Cek lampiran Template
 Subjudul (tgl/bln awal yang dipilih) s.d. (tgl/bulan akhir) tahun (yg
dipilih)
 Tambahkan kotak dialog untuk memilih rentang tanggal, bulan, dan
tahun yg akan di print.
 Fitur Lock transaksi apabila pada rentang tanggal/bulan/tahun trsb
sudah di print
 Submenu Dana Mandiri (terdiri dari 2 tab)
 Tab 1
o Datacard (Jumlah Iuran Terkumpul, Jumlah KK Lunas, Jumlah KK
belum lunas / bayar)
o Menampilkan data transaksi yang pernah/sudah direkam (per tahun)
o Tambah Data untuk DANA MANDIRI (kotak dialog dengan dropdown
dinamis, apabila terlalu panjang tambahkan fitur dapat discroll keatas
atau kebawah)
o Form isian berisi Tanggal Transaksi, Keterangan (dropdown diambil
dari list nama kepala keluarga), Jumlah Dibayar.
o Edit dan Hapus Data.
o Tambahkan fitur Setor ke Paroki dengan tambahan menu input
tanggal/bulan/tahun untuk menambahkan status data menjadi Telah
Disetor Ke Paroki pada Tanggal.
o Tambahkan fitur check dan uncheck all untuk memilih data yang akan
ditindaklanjuti dengan fitur Setor ke Paroki.
o Tambahkan fitur lock apabila data yang dipilih sudah berstatus Setor
ke Paroki.
o Tambahkan fitur pencarian berdasarkan nama kepala keluarga
o Notifikasi ke pemilik akun terkait apabila Dana Mandiri a.n. nama
kepala Keluarga tersebut statusnya telah di setor ke paroki (real time).
o Buat notifikasi pop-up untuk setiap tindakan
o Tombol Print PDF:
 Print PDF
 Tambahkan kotak dialog untuk memilih bulan, tahun, dan jenis
data (Bukti Terima Uang atau Setor ke Paroki) untuk
meminimalkan data sebelum berpindah ke page print.
 Bukti Terima Uang untuk bukti transaksi penerimaan uang
(Judul Bukti Penerimaan Dana Mandiri, list pembayar dan
nominal, dan kolom ttd Bendahara)
 Setor ke Paroki untuk bukti transaksi penyetoran ke paroki
(Judul Surat Setor Dana Mandiri Lingkungan St. Agatha, list
pembayar dan nominal, dan kolom ttd Bendahara dan
penerima setoran)
 Template : Cek Lampiran Template
 Tab 2
o Untuk Monitoring kepala keluarga Penunggak Iuran Dana Mandiri
o Tampilkan berdasarkan nama Kepala Keluarga dan bulan/tahun yang
tertunggak
o Tambahkan fitur pencarian berdasarkan nama kepala keluarga
o Tombol set iuran Dana Mandiri (untuk besarnya iuran setiap kepala
keluarga dalam 1 tahun)
o Tambahkan tombol kirim notifikasi yang berfungsi mengirimkan
notifikasi pengingat kepada akun terkait (sesuai nama Kepala
Keluarga penunggak) untuk segera melakukan pembayaran
dan/atau pelunasan iuran dana mandiri (real time).
o Buat notifikasi pop-up untuk seluruh tindakan.
6. IKATA (terdiri dari 2 tab)
 Tab 1
o Kas IKATA
o Menampilkan Datacard (Saldo Awal, Pemasukan, Pengeluaran, Saldo Akhir)
o Menampilkan data transaksi yang pernah/sudah direkam (dapat difilter
bulan dan tahun)
o Prioritas data yang ditampilkan adalah bulan dan tahun sesuai system (GMT
+7)
o Berikan warna yang berbeda untuk jenis transaksi debit dan kredit agar
mudah dibedakan.
o Tambah Data untuk Kas IKATA (form isian dengan dropdown dinamis,
apabila terlalu panjang tambahkan fitur dapat discroll keatas atau kebawah)
o Form isian berisi Tanggal Transaksi, Jenis Transaksi (dropdown Uang Masuk
dan Uang Keluar), Tipe Transaksi (jika Jenis transaksi Uang Masuk maka
pilihan Iuran Anggota, Transfer Dana dari Lingkungan, Sumbangan
Anggota, dan Penerimaan Lain-Lain. Jika Uang Keluar maka pilihan adalah
Uang Duka / Papan Bunga, Kunjungan Kasih, Cinderamata Kelahiran,
Cinderamata Pernikahan, Uang Akomodasi, Pembelian, Lain-Lain),
Keterangan, Debit, dan Kredit.
o Apabila terdapat perekaman data dengan uraian: Jenis transaksi Uang
Masuk dengan pilihan Iuran Anggota, Debit. Maka berikan pilihan
dropdown pada bagian Keterangan dengan sumber database Nama
Lengkap (tampilkan dalam format Keluarga + nama Kepala Keluarga), dan
munculkan tambahan Form isian berisi Status (Lunas, Sebagian Bulan,
Belum Ada Pembayaran). Tambahan input form meminta pilihan rentang
bulan yang sudah dilunasi hanya muncul Jika Status “Sebagian Bulan”
dipilih.
o Apabila Jenis Transaksi = Uang Masuk, tipe transaksi = Sumbangan
Anggota, pada kolom Keterangan (tampilkan list Kepala Keluarga)
o Munculkan notifikasi kepada seluruh akun yang terdaftar apabila terdapat
tipe transaksi (Sumbangan Anggota) yang berhasil direkam.
o Notifikasi mencantumkan Tanggal, tipe transaksi terkait, Keterangan dan
nominalnya yang dikirimkan setiap minggu pada hari minggu jam 12.00
o Edit dan Hapus Data.
o Fitur filter berdasarkan Bulan dan Tahun
o Apabila Jenis Transaksi = Uang Masuk, tipe transaksi = Iuran Anggota, maka
munculkan notifikasi yang mencantumkan nominal yang dibayarkan kepada
akun terkait (sesuai nama Kepala Keluarga) bahwa Iurannya telah berhasil
direkam/dibukukan (realtime).
o Buat notifikasi pop-up atas setiap tindakan.
o Tombol Print dalam format PDF:
o Menu Print dalam format PDF
o Tampilannya : Cek Lampiran Template
o Subjudul (tgl/bln awal yang dipilih) s.d. (tgl/bulan akhir) tahun (yg
dipilih)
o Tambahkan kotak dialog untuk memilih rentang tanggal, bulan, dan
tahun yg akan di print.
o Fitur Lock transaksi apabila pada rentang tanggal/bulan/tahun trsb
sudah di print
b. Tab 2
o Berfungsi monitoring penunggak iuran IKATA
o Tampilkan berdasarkan nama Kepala Keluarga dan bulan/tahun yang
tertunggak
o Tambahkan fitur pencarian berdasarkan nama kepala keluarga
o Tombol set iuran IKATA (untuk besarnya iuran setiap kepala keluarga dalam
1 tahun)
o Tambahkan tombol kirim notifikasi yang berfungsi mengirimkan notifikasi
pengingat kepada akun terkait (sesuai nama Kepala Keluarga penunggak)
untuk segera melakukan pembayaran dan/atau pelunasan iuran IKATA (real
time).
o Buat notifikasi pop-up untuk seluruh tindakan.
7. KESEKRETARIATAN
 Submenu Data Umat (Kuncian dari semua fitur lain)
 Menampilkan list daftar nama Kepala Keluarga
 Terdapat Tombol “Tambah” berfungsi menambahkandata Kepala Keluarga
(Nama Kepala Keluarga, tanggal bergabung, Alamat, Jumlah Anak
Tertanggung, Jumlah Kerabat Tertanggung, jumlah anggota keluarga).
 Terdapat tombol aksi pada list daftar kepala keluarga tersebut
 Tombol aksinya adalah Edit dan Hapus
 Tombol aksi edit (seperti layaknya mengedit data)
 Tombol aksi Hapus memiliki pilihan (Pindah atau Meninggal). Apabila dipilih
Pindah maka buat fungsi otomatis yang akan menghapus seluruh data terkait
nama kepala keluarga yang dipilih dari database 1 tahun 1 bulan sejak Pindah.
Apabila dipilih meninggal maka input nama anggota keluarga yang meninggal
(tindakan ini otomatis memperbaharui database.
 Buatkan tombol Download Template (file excel memuat data utama yang perlu
diinput)
 Data Utama yang perlu diinput adalah Kepala Keluarga (Nama Kepala Keluarga,
tanggal bergabung / keluar, Alamat, Jumlah Anak Tertanggung, Jumlah Kerabat
Tertanggung, jumlah anggota keluarga.
 Tombol Download template akan tersinkronisasi dengan tombol impor data
 Buatkan tombol Impor Data (menggunakan file excel)
 Tombol impor data berfungsi untuk menambahkan data kepala keluarga secara
massal.
 Buat notif pop-up untuk setiap tindakan
 Submenu Doa Lingkungan (terdiri dari 5 tab)
 Jadwal Doling
 Merupakan fitur untuk mengatur penjadwalan calon tuan rumah doa
lingkungan
 Berdasarkan data nama kepala keluarga
 Atur system agar nama kepala keluarga yang sudah pernah terpilih agar
tidak ditampilkan lagi kecuali dilakukan reset.
 Buatkan fungsi reminder kepada role Ketua dan wakilnya, sekretaris dan
wakilnya apabila 1 minggu kedepan jadwal doa belum disusun
(reminder dikirim setiap hari sabtu jam 19.00 WIB)
 Buatkan notifikasi otomatis yang akan dikirim setiap minggu pada hari
minggu jam 12.00 berisi reminder jadwal doling untuk 1 minggu
kedepan. (notifikasi akan dikirimkan apabila terdapat jadwal doling yang
telah di susun sebelumnya).
 Buat notif pop-up untuk setiap tindakan
 Tombol Print PDF:
 Mencetak form jadwal calon tuan rumah / kepala keluarga
 Kotak dialog untuk memilih rentang bulan dan tahun jadwal yang
akan di cetak
 Judul “Jadwal Tuan Rumah Doa Lingkungan St. Agatha”
 Subjudul “bulan tahun yang akan di cetak”
 Tampilkan dalam 4 kolom (tanggal, nama kepala keluarga,
alamat, dan keterangan tambahan)
 Cek Lampiran Template
 Detil Doling
 Berisi fungsi form Tanggal, Jenis Ibadat (Doa Lingkungan, Misa,
Pertemuan, Bakti Sosial, Kegiatan Lainnya), Sub Ibadat (Ibadat Sabda,
Ibadat Sabda Tematik (KAM/Paroki), Prapaskah (APP), BKSN, Bulan
Rosario, Novena Natal, Misa Syukur, Misa Requem, Misa Arwah, Misa
Pelindung), Tema Ibadat, Tuan Rumah (nama Kepala Keluarga), Jumlah
KK Hadir (ambil data dari tab absensi), Bapak, Ibu, OMK, BIR, BIA (0-6
tahun), BIA (7-13 tahun), Kolekte I, Kolekte II, Ucapan Syukur, Pemimpin
Ibadat, Pemimpin Rosario, Pembawa Renungan, Pembawa Lagu, Doa
Umat, Pemimpin Misa, Bacaan I, Pemazmur, Jumlah Peserta.
 Pengaturan tampilan berdasarkan kriteria berikut:
 Jika Jenis Ibadat adalah Doa Lingkungan, munculkan pilihan Sub
Ibadat adalah Ibadat Sabda, Ibadat Sabda Tematik (KAM/Paroki),
Prapaskah (APP), BKSN, Bulan Rosario, Novena Natal.
Sembunyikan Pemimpin Rosario, Pemimpin Misa, Bacaan I,
Pemazmur, Jumlah Peserta
 Jika Jenis Ibadat adalah Misa, munculkan pilihan Sub Ibadat
adalah Misa Syukur, Misa Requem, Misa Arwah, Misa Pelindung.
Sembunyikan Tema Ibadat, Bapak, Ibu, OMK, BIR, BIA, Pemimpin
Ibadat, Pemimpin Rosario, Pembawa Renungan.
 Jika Jenis Ibadat adalah Pertemuan, Bakti Sosial, dan Kegiatan
Lainnya maka sembunyikan Sub Ibadat, Tema Ibadat, Tuan
Rumah, Jumlah KK, Bapak, Ibu, OMK, BIA, BIR, Ucapan Syukur,
Pemimpin Ibadat, Pemimpin Rosario, Pembawa Renungan,
Pembawa Lagu, Doa Umat, Pemimpin Misa, Bacaan I, Pemazmur.
 Buat notif pop-up untuk setiap tindakan
 Absensi
 Form absensi dengan pilihan hadir/tidak hadir. ini menjadi tidak aktif jika
Jenis Ibadat yang dipilih pada tab Detil Doling adalah Bakti Sosial,
Kegiatan Lainnya
 Buat notif pop-up untuk setiap tindakan
 Riwayat Doling
 Menampilkan rincian Detil Doling dan Absensi.
 Ditampilkan berdasarkan filter tanggal sesuai jadwal pada jadwal doling
(apabila tanggal tertentu di pilih baru datanya keluar)
 Tambahkan fitur print pdf untuk mencetak Detil Doling dan Absensi
sesuai dengan tanggal yang disediakan.
 Cek Lampiran Template
 Buat notif pop-up untuk setiap tindakan
 Kaleidoskop
 Merupakan mini dashboard
 Menampilkan rekapitulasi (data yang ditampilkan adalah jumlah
doling yang sudah dilakukan selama rentang bulan s.d. bulan
tahun tertentu.
 Ditampilkan berkelompok berdasarkan Jenis Ibadat. Lalu jenis
ibadat tersebut dirincikan berdasarkan sub ibadatnya.
 Fitur filter bedasarkan rentang bulan dan tahun.
 Buat notif pop-up untuk setiap tindakan
 Submenu Agenda
 Berisi List Permohonan yang berasal dari akun dengan role “umat”
 Terdapat tombol “Pengajuan” yang hanya muncul pada akun dengan role
“umat”
 Tombol “pengajuan” berisi kotak dialog tentang Tanggal Pengajuan, Perihal,
Tujuan Pengajuan (DPL, Stasi / DPS, Paroki / DPP.
 Akun dengan role umat hanya dapat membuat “Pengajuan”
 Akun dengan role ketua dan wakilnya, sekretaris dan wakilnya, bendahara dan
wakilnya hanya dapat menindaklanjuti data pengajuan tersebut.
 Tindaklanjutnya berupa tombol aksi pada list pengajuan yang masih berstatus
“open”.
 Jenis Tindaklanjut adalah Diproses di Lingkungan, Diproses di Stasi, Diproses di
Paroki, dan Ditolak.
 Apabila jenis tindaklanjut : ditolak munculkan form Alasan Penolakan (input
manual)  case closed.
 Setelah jenis tindaklanjut dipilih (Diproses di Lingkungan, Diproses di Stasi,
Diproses di Paroki), munculkan tombol aksi update status berisi pilihan
(Diteruskan ke Paroki, Selesai, dan Ditolak).
 Apabila Update status yang dipilih adalah Tolak munculkan form alasan
penolakan (input manual)  case closed.
 Apabila Update status yang dipilih adalah Selesai  case closed.
 Apabila jenis Update status dipilih Diteruskan ke Paroki, tambahkan tombol aksi
hasil akhir (Selesai dan Ditolak)
 Apabila Hasil akhir dipilih Ditolak munculkan form alasan penolakan (input
manual)  case closed.
 Apabila Hasil Akhir yang dipilih adalah Selesai  case closed.
 Tambahkan fitur hapus otomatis Agenda dengan status cas closed tiap minggu
pada hari Minggu jam 00.00
 Kirimkan notifikasi kepada akun pemilik Pengajuan untuk setiap tindakan yang
dilakukan atas pengajuan tersebut.
 Kirimkan notifikasi pengingat kepada role ketua dan wakilnya, sekretaris dan
wakilnya, bendahara dan wakilnya untuk menindaklanjuti “Pengajuan” dengan
status Open setiap 3 hari sekali jam 00.00.
 Buat notif pop-up untuk setiap tindakan
8. PUBLIKASI
a. Submenu Pengumuman
o Menampilkan pengumuman yang digenerate dari submenu Buat
Publikasi.
o Tambahkan fitur input laporan
o Fitur hapus otomatis pengumuman yang telah kadaluarsa (yang
apabila telah lewat dari 3 bulan dari tanggal posting akan terhapus
otomatis dari tampilan dan database).
o Tambahkan fitur unduh (untuk mengunduh seluruh data yang
dilampirkan pada penguman tersebut, baik gambar, file excel, pdf,
word.
o Tambahkan fitur filter untuk mempermudah pencarian.
o Buat notif pop-up untuk setiap tindakan
o Tampilan yang ramah pembaca
b. Submenu Buat Publikasi
 Terdapat pilihan target penerima notifikasi (centang)
 Targer penerima notifikasi adalah ketua dan wakilnya, sekretaris dan
wakilnya, bendahara dan wakilnya, dan umat.
 Fitur dapat mengupload file (gambar, excel, pdf, word)
 Klasifikasi Publikasi (Penting, Umum, Rahasia, Segera)
 Tambahkan fitur publikasi yang memiliki batas waktu (deadline).
 Buat Tampilan pengumuman semenarik dan seindah mungkin
 Integrasikan dengan notifikasi untuk memberitahukan target
penerima terdapat pengumuman yang ditujukan kepada akun yang
bersangkutan.
 Buat notif pop-up untuk setiap tindakan
9. PENGATURAN
a. Submenu Profil
Form input:
 Data Kepala Keluarga: Tempat dan Tanggal Lahir, Nomor telepon / WA,
Status (Hidup, Meninggal), Kota Domisili, Pendidikan Terakhir, Tanggal
Babtis, Tanggal Krisma, Tanggal Meninggal (Jika Status Meninggal), Status
Pernikahan (Menikah / Tidak Menikah)
 Jika Menikah lanjut ke form: Nama Pasangan, Tempat dan Tanggal Lahir
Pasangan, Nomor Telepon / WA, Pendidikan Terakhir, Agama Pasangan (5
agama diakui Indonesia), Jika katolik (maka tampilkan form “No. Biduk,
Tanggal baptis, Tanggal Krisma), Status (Hidup atau Meninggal), Tanggal
Meninggal (jika status meninggal), Memiliki Tanggungan (Ada / Tidak)
 Jika memiliki Tanggungan lanjut ke form: Jenis Tangunggan (anak / kerabat
lain), Nama, tanggal lahir, Pendidikan Terakhir, Agama, Jika agama katolik
maka (Tanggal Baptis & Tanggal Krisma), Status Pernikahan. Form dapat
ditambahkan otomatis sebanyak jumlah inputan Submenu Data Umat.
 Buat notif pop-up untuk setiap tindakan
 role “Umat” dapat melakukan pembaharuan data setiap saat.
b. Submenu Ubah Password:
 Sistem Ganti Password dengan validasi password lama.
 password baru, konfirmasi password baru.
 Tidak terintegrasi dengan email.
 Buat notif pop-up untuk setiap tindakan
10. Approval
o Berfungsi mengintegrasikan beberapa data yang telah di input pada Tab Detil Doling
(tanggal, Kolekte I beserta nilainya, Kolekte II beserta nilainya, dan Ucapan Syukur
beserta nilainya) ke submenu KAS LINGKUNGAN
o Data tanggal, Kolekte I beserta nilainya, Kolekte II beserta nilainya, dan Ucapan
Syukur beserta nilainya pada Tab Detil Doling akan dibaca pada submenu KAS
LINGKUNGAN sebagai Tanggal, Jenis Transaksi adalah Uang Masuk, Tipe Transaksi
(Kolekte I atau Kolekte II, atau Ucapan Syukur) dan nilai inputan Kolekte I, Kolekte II,
dan Ucapan Syukur menjadi sebagai debit, untuk Keterangan dan Kredit (kosong).
o Data hasil integrasi Detil Doling dan KAS LINGKUNGAN ditampilkan pada modul
Approval dan dapat dilakukan editing untuk penyempurnaan data.
o Untuk melakukan perekaman pada database dibutuhkan persetujuan atas data yang
ditampilkan pada modul Approval
o Apabila telah mendapatkan persetujuan, maka data otomatis akan ditambahkan ke
dalam database KAS LINGKUNGAN dan proses selesai.
o Tambahkan kotak dialog lanjutan yang berfungsi sebagai warning sebelum data
disetujui.
o Buat notifikasi kepada role ketua dan wakilnya, sekretaris dan wakilnya bahwa data
sudah disetujui dan direkam ke database kas lingkungan. (real time)
o Buat notif pop-up untuk setiap tindakan
11. Histori Pembayaran
o Berfungsi mengintegrasikan modul Dana Mandiri dan Monitoring “IKATA” dengan
modul Histori Pembayaran
o Data dana mandri yang masuk ke histori pembayaran adalah yang sudah berstatus
setor ke paroki
o Data Iuran IKATA yang masuk ke histori pembayaran adalah yang sudah terkunci
(sudah dilakukan print).
o Memberikan kemudahan pemilik akun yang terdaftar (sesuai nama kepala keluarga)
untuk melakukan pengecekan status pembayaran
o Tambahkan fitur filter tahun.
o Hanya ditampilkan kepada role Umat
12. Tombol Log Out
13. Notifikasi
 Buat fitur hapus otomatis notifikasi pada database dan tampilan pengguna apabila
telah berstatus dibaca oleh user yang bersangkutan atau 3 bulan sejak notifikasi
dikirimkan.
14. Otorisasi
o Terdapat 8 jenis pengguna yang terdiri dari SuperUser, Ketua, Wakil Ketua, Bendahara,
Wakil Bendahara, Sekretaris, Wakil Sekretaris, Umat
o Setiap jenis pengguna (Ketua, Wakil Ketua, Bendahara, Wakil Bendahara, Sekretaris, Wakil
Sekretaris, Umat) memiliki batasan akses atas menu kecuali SuperUser
15. FITUR/TOMBOL WIPE DATA
a. Hanya dapat diakses oleh akun role “SuperUser”
b. Memberikan pilihan untuk menghapus seluruh data dan/atau tabel pada database
berdasarkan rentang bulan dan tahun yang dipilih dan jenis data dan/atau table
yang akan dihapus.
c. Tambahkan kotak dialog tambahan untuk mengkonfirmasi perintah tersebut.
16. USERNAME DAN PASSWORD AWAL
a. Buatkan akun role superuser, role ketua dan wakilnya, sekretaris dan wakilnya, dan
bendahara dan wakilnya dengan password dan passphrase default pengurus123.
b. Akun dengan role superuser, role ketua dan wakilnya, sekretaris dan wakilnya, dan
bendahara dan wakilnya bukan bagian dari Umat.
TEMPLATE SUBMENU KAS LINGKUNGAN
LAPORAN KAS LINGKUNGAN ST. AGATHA
01 Januari s.d. 31 Januari 2025
Jenis Transaksi Tipe Transaksi Nominal
Uang Masuk Kolekte I Rp. 10.000
Kolekte II Rp. 10.000
Uang Keluar Pembelian Rp. 10.000
Penyelenggaraan Kegiatan Rp. 10.000
Saldo, Awal 1 Januari 2025 Rp. 500
Total Pemasukan Rp. 20.000
Total Pengeluaran Rp. 20.000
Saldo Akhir, 30 Januari 2025 Rp. 500
Dibuat oleh, Disetujui Oleh,
…………………………….. ………………………
Bendahara Lingkungan Ketua / Wakil Ketua Lingkungan
Template Bukti Penerimaan Dana Mandiri
BUKTI PENERIMAAN DANA MANDIRI
Tanggal Nama Kepala
Keluarga
Bulan / Tahun
Pembayaran
Nominal Diterima
xxxx xxxx xxxx xxx
Telah Diterima Oleh,
………………………………………
Bendahara Lingkungan
Template Surat Setor Dana Mandiri
SLIP PENYETORAN DANA MANDIRI
Tanggal Nama Kepala
Keluarga
Bulan / Tahun
Disetor
Nominal Disetorkan
xxxx xxxx xxx xxx
Disetorkan Oleh, Telah Diterima Oleh,
……………………………………. ………………………………………
Bendahara Lingkungan an. Paroki
TEMPLATE SUBMENU KAS IKATA
LAPORAN KAS IKATA LINGKUNGAN ST. AGATHA
01 Januari s.d. 31 Januari 2025
Jenis Transaksi Tipe Transaksi Nominal
Uang Masuk Kolekte I Rp. 10.000
Kolekte II Rp. 10.000
Uang Keluar Pembelian Rp. 10.000
Penyelenggaraan Kegiatan Rp. 10.000
Saldo, Awal 1 Januari 2025 Rp. 500
Total Pemasukan Rp. 20.000
Total Pengeluaran Rp. 20.000
Saldo Akhir, 30 Januari 2025 Rp. 500
Dibuat oleh, Disetujui Oleh,
…………………………….. ………………………
Wakil Bendahara Lingkungan Ketua / Wakil Ketua Lingkungan
TEMPLATE JADWAL DOLING
JADWAL TUAN RUMAH DOA LINGKUNGAN ST. AGATHA
01 Januari s.d. 31 Januari 2025
Calon Tuan
Rumah
Tanggal Di
Jadwalkan
Alamat Keterangan
xxxx xxxx xxxx xxxx
Disusun Oleh, Dipublikasikan Oleh,
……………………… ……………………………..
Ketua / Wakil Ketua Lingkungan Sekretaris/Wakil Sekretaris Lingkungan
TEMPLATE RIWAYAT DOLING (2 HALAMAN)
HALAMAN 1
LEMBAR ADMINISTRASI DOA LINGKUNGAN ST. AGATHA
1. Tanggal
2. Jenis Ibadat
3. Sub Ibadat
4. Tema Ibadat
5. Tuan Rumah (nama Kepala Keluarga)
6. Statistik Umat
a. Jumlah KK Hadir
b. Bapak
c. Ibu
d. OMK
e. BIR
f. BIA ( 0 s.d. 6 tahun)
g. BIA (7-13 tahun)
7. Penerimaan
a. Kolekte I
b. Kolekte II
c. Ucapan Syukur
8. Keibadatan (disesuaikan dengan klausul diatas)
a. Pemimpin Ibadat
b. Pemimpin Rosario
c. Pembawa Renungan
d. Pembawa Lagu
e. Doa Umat
f. Pemimpin Misa
g. Bacaan I
h. Pemazmur
Disusun Oleh, Disetujui Oleh,
……………………… ……………………………..
Sekretaris / Wakil Sekretaris Lingkungan Ketua/Wakil Ketua
Lingkungan
HALAMAN 2
LAMPIRAN LEMBAR ADMINISTRASI
DOA LINGKUNGAN ST. AGATHA (ABSENSI)
DAFTAR KEHADIRAN UMAT LINGKUNGAN:
NAMA KEPALA KELUARGA KEHADIRAN (SUAMI + ISTRI)
xxxxx Suami – istri hadir
Xxx Hanya Suami
xxxccccccx Hanya Istri
xxxxssssssss Tidak Hadir