const db = require("./database");
const { nanoid } = require('nanoid');

const scanBarcode = async(request, response) => {
    const { barcode } = request.body;

    try {
        if(!barcode || !barcode.length(15)) {
            return response.status(400).json({
                status: 'fail',
                message: 'input not valid, try again'
            });
        };

        const [existMahasiswa] = await db.query(`SELECT * FROM mahasiswa WHERE nim = ?`, [barcode]);

        if(existMahasiswa.length > 0) {
            const [activeSession] = await db.query(`UPDATE mahasiswa SET status = CASE WHEN status = 'online' THEN 'offline' ELSE 'online' END WHERE nim = ?`, [existMahasiswa[0].nim]);

            if(activeSession.affectedRows === 1) {
                const id_data = nanoid(16);
                const waktu_masuk = new Date().toISOString();

                const [addDataPengunjung] = await db.query(`INSERT INTO data_pengunjung(id_data, nim, waktu_masuk) VALUES(?, ?, ?)`, [id_data, existMahasiswa[0].nim, waktu_masuk]);

                if(addDataPengunjung.affectedRows === 1) {
                    return response.status(201).json({
                        status: 'success',
                        message: 'absensi berhasil dibuat'
                    });
                };
            };

            const [addSession] = await db.query(`INSERT INTO session(nim, status)`);
        };

    } catch(error) {
        return response.status(500).json({
            status: 'fail',
            message: `Invalid scan barcode : ${error}`
        });
    };
};
