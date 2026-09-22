const express = require('express');
const app = express(); // instansiasi
const PORT = 3000; //port yg akan digunakan

// Middleware agar req.body (JSON) dapat dibaca
app.use(express.json());

// Data sementara (disimpan di memori, hilang saat server restart)
let mahasiswa = [
    { id: 1, nama: 'safa', jurusan: 'Sistem Informasi' },
    { id: 2, nama: 'haidir', jurusan: 'Informatika' },
];
let nextId = 3; // penghitung id untuk data baru

// route/
app.get('/', (req, res) => {
    res.send('Server Express.js berjalan pada port 3000 *safa imut kiyut cantik!');
});

app.get('/mahasiswa', (req, res) => {
    const { jurusan } = req.query;

    if (jurusan) {
        const hasil = mahasiswa.filter((m) => m.jurusan === jurusan);
        return res.json(hasil);
    }

    res.json(mahasiswa);
});

// GET /mahasiswa/:id -> menampilkan satu data berdasarkan id
app.get('/mahasiswa/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = mahasiswa.find((m) => m.id === id);

    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(data);
});

// POST /mahasiswa
// Body: { "nama": "Citra", "jurusan": "Sistem Informasi" }
app.post('/mahasiswa', (req, res) => {
    const { nama, jurusan } = req.body;

    if (!nama || !jurusan) {
        return res.status(400).json({ message: 'nama dan jurusan wajib diisi' });
    }

    const baru = { id: nextId++, nama, jurusan };

    mahasiswa.push(baru);
    res.status(201).json(baru);
});

app.put('/mahasiswa/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mahasiswa.findIndex((m) => m.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    mahasiswa[index] = { ...mahasiswa[index], ...req.body, id };
    res.json(mahasiswa[index]);
});

// DELETE /mahasiswa/2
app.delete('/mahasiswa/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mahasiswa.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Data tidak ditemukan' });
  }

  mahasiswa.splice(index, 1);
  res.status(204).send();
});

// menjalankan apk pada port 3000
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

