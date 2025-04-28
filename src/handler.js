require('dotenv').config();
const db = require('./database');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');

const generateToken = (admin) => {
    const token = jwt.sign({ id: admin[0].id_admin, username: admin[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const loginAccount = async(request, response) => {
    const { username, password } = request.body;

    try {
        if(!username || !password) {
            return response.status(400).json({
                status: 'fail',
                message: `Input not valid, try again`
            });
        };

        const [existAdmin] = await db.query(`SELECT * FROM admin WHERE username = ? AND password = ?`, [username, password]);

        if(existAdmin.length > 0) {
            const token = generateToken(existAdmin);

            return response.status(201).json({
               status: 'success',
               message: 'berhasil login',
               token,
               account: {
                    username: existAdmin[0].username
               }
            });
        };

        return response.status(400).json({
            status: 'fail',
            message: 'Username or password are incorrect'
        })

    } catch(error) {
        return response.status(500).json({
            status: 'fail',
            message: `Terjadi error: ${error}`
        });
    };
};

const logoutAccount = async(request, response) => {
    const authorization = request.headers.authorization;

    try {
        if(!authorization) {
            return response.status(401).json({
                status: 'fail',
                message: 'Unauthorized'
            });
        };

        const token = authorization.split(' ')[1];
        
        const [isBlacklist] = await db.query(`SELECT * FROM blacklisttoken WHERE token = ?`, [token]);

        if(isBlacklist.length > 0) {
            return response.status(401).json({
                status: 'fail',
                message: 'Unauthorized'
            });
        };

        const checkValidation = jwt.verify(token, process.env.JWT_SECRET);

        if(checkValidation) {
            const [blacklist] = await db.query(`INSERT INTO blacklisttoken(token) VALUES(?)`, [token]);

            if(blacklist.affectedRows === 1) {
                return response.status(201).json({
                    status: 'success',
                    message: 'logout berhasil'
                });
            };

            return response.status(500).json({
                status: 'fail',
                message: 'gagal memasukkan token, coba lagi'
            });
        };

        return response.status(401).json({
            status: 'fail',
            message: 'Unauthorized'
        });

    } catch(error) {
        return response.status(500).json({
            status: 'fail',
            message: `Terjadi error: ${error}`
        });
    };
};

const scanBarcode = async(request, response) => {
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

const statisticMahasiswa = async(request, response) => {
    try {
        const { day, month, year } = request.query;

        let sqlQuery = `SELECT * FROM data_pengunjung WHERE 1=1`;
        let sqlParams = [];

        if(day) {
            sqlQuery += ` AND DAY(waktu_masuk) = ?`;
            sqlParams.push(day);
        };

        if(month) {
            sqlQuery += ` AND MONTH(waktu_masuk) = ?`;
            sqlParams.push(month);
        };

        if(year) {
            sqlQuery += ` AND YEAR(waktu_masuk) = ?`;
            sqlParams.push(year);
        };

        const [getStatistic] = await db.query(sqlQuery, sqlParams);

        return response.status(200).json({
            status: 'success',
            result: getStatistic
        });

    } catch(error) {
        return response.status(500).json({
            status: 'fail',
            message: `Invalid statistic mahasiswa: ${error}`
        });
    };
};

module.exports = { scanBarcode, statisticMahasiswa, loginAccount, logoutAccount };
