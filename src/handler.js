const db = require('./database');
const { nanoid } = require('nanoid');

const scanBarcode = async (request, response) => {
    const { barcode } = request.body;

    try {
        if(!barcode || barcode.length !== 15) {
            return response.status(400).json({
                status: 'fail',
                message: 'input not valid, try again'
            });
        };

        const [existMahasiswa] = await db.query(`SELECT * FROM mahasiswa WHERE nim = ?`, [barcode]);

        if (existMahasiswa.length === 0) {
            return response.status(404).json({
                status: 'fail',
                message: 'nim mahasiswa tidak terdaftar, hubungi petugas'
            });
        };

        const [activeSession] = await db.query(`SELECT * FROM session WHERE nim = ?`, [existMahasiswa[0].nim]);
        const statusSession = activeSession.length > 0 ? (activeSession[0].status === 'online' ? 'offline' : 'online') : 'online';

        if(activeSession.length > 0) {
            const [updateSession] = await db.query(`UPDATE session SET status = ? WHERE nim = ?`, [statusSession, existMahasiswa[0].nim]);

            if(updateSession.affectedRows !== 1) {
                return response.status(500).json({
                    status: 'fail',
                    message: 'update session error, try again'
                });
            };

        } else {
            const [addSession] = await db.query(`INSERT INTO session(nim, status) VALUES(?, ?)`, [existMahasiswa[0].nim, statusSession]);

            if (addSession.affectedRows !== 1) {
                return response.status(500).json({
                    status: 'fail',
                    message: 'create session error, try again'
                });
            };
        };

        if (statusSession === 'offline') {
            const waktu_keluar = new Date().toISOString();

            const [updateWaktuKeluar] = await db.query(`UPDATE data_pengunjung SET waktu_keluar = ? WHERE nim = ? AND waktu_keluar IS NULL`, [waktu_keluar, existMahasiswa[0].nim]);

            if (updateWaktuKeluar.affectedRows !== 1) {
                return response.status(500).json({
                    status: 'fail',
                    message: 'update data_pengunjung error, try again'
                });
            };

            return response.status(201).json({
                status: 'success',
                message: 'sesi dan data berhasil diperbarui'
            });
        };

        const id_data = nanoid(16);
        const waktu_masuk = new Date().toISOString();

        const [addDataPengunjung] = await db.query(`INSERT INTO data_pengunjung(id_data, nim, waktu_masuk) VALUES(?, ?, ?)`, [id_data, existMahasiswa[0].nim, waktu_masuk]);

        if (addDataPengunjung.affectedRows !== 1) {
            return response.status(500).json({
                status: 'fail',
                message: 'add data_pengunjung error, try again'
            });
        };

        return response.status(201).json({
            status: 'success',
            message: 'sesi berhasil diperbarui, data berhasil dibuat'
        });

    } catch (error) {
        return response.status(500).json({
            status: 'fail',
            message: `Invalid scan barcode : ${error}`
        });
    }
};

module.exports = { scanBarcode };
