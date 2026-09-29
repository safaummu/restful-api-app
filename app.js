require('dotenv').config(); // baris pertama

	const express = require('express');// import express
	const cors = require('cors');// import cors
	const app = express();// buat instance express
	const PORT = process.env.PORT || 3000;// ambil PORT dari .env, default 3000
	
	function logger(req, res, next) {
  const waktu = new Date().toISOString();
  console.log(`[${waktu}] ${req.method} ${req.url}`);
  next(); // wajib, agar request lanjut ke handler berikutnya
}

    function cekApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'API key tidak valid' });
    }

    next();
    }

    function errorHttp(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

    // Didaftarkan sebelum route agar mencatat seluruh request
    app.use(logger);
    // cors didaftarkan
    app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }));
    

	// Middleware agar req.body (JSON) dapat dibaca
	app.use(express.json());	

	// Data sementara (disimpan di memori, hilang saat server restart)
	let mahasiswa = [
  		{ id: 1, nama: 'Safa Ummu', jurusan: 'Sistem Informasi' },
  		{ id: 2, nama: 'Haidir', jurusan: 'Informatika' },
	];
	let nextId = 3; // penghitung id untuk data baru
	
	app.get('/', (req, res) => {
	  res.send('Server Express.js berjalan pada PORT 3000!');
	});

	// GET /mahasiswa -> seluruh data, bisa difilter: /mahasiswa?jurusan=Informatika
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

  		if (!data) return next(errorHttp(404, 'Data tidak ditemukan'));
        res.json(data);
});

	// POST /mahasiswa
    // Body: { "nama": "Citra", "jurusan": "Sistem Informasi" }
    app.post('/mahasiswa', (req, res, next) => {
        const { nama, jurusan} = req.body;

        if (!nama || !jurusan) {
            return next(errorHttp(400, 'nama dan jurusan wajib diisi'));
        }

        const baru = { id: nextId++, nama, jurusan };

        mahasiswa.push(baru);
        res.status(201).json(baru);
    });

// PUT /mahasiswa/2
// Body: { "nama": "Budi Santoso", "jurusan": "Informatika" }
app.put('/mahasiswa/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = mahasiswa.findIndex((m) => m.id === id);

    if (index === -1) return next(errorHttp(404, 'Data tidak ditemukan'));

  mahasiswa[index] = { ...mahasiswa[index], ...req.body, id };
  res.json(mahasiswa[index]);
});

	// DELETE /mahasiswa/2
app.delete('/mahasiswa/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = mahasiswa.findIndex((m) => m.id === id);

    if (index === -1) return next(errorHttp(404, 'Data tidak ditemukan'));

  mahasiswa.splice(index, 1);
  res.status(204).send();
});

    // Handler 404: rute yang tidak ada
app.use((req, res) => {
  res.status(404).json({ message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// Error handler: WAJIB 4 parameter
app.use((err, req, res, next) => {
  // Body JSON yang rusak (dilempar oleh express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err.stack); // detail hanya dicatat di server
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }

  res.status(status).json({ message: err.message });
});

	app.listen(PORT, () => {
	  console.log(`Server berjalan di http://localhost:${PORT}`);
	});