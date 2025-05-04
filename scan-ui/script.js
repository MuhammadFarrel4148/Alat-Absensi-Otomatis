const input = document.getElementById('scanbarcode');
const result = document.getElementById('result');
const socket = io('http://localhost:3000');

input.addEventListener('input', async() => { 
    const barcode = input.value.trim();

    if(barcode.length === 15) {
        try {
            const response = await fetch('http://localhost:3000/scan', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ barcode }),
            });
    
            const data = await response.json();
            
            if(data.message === 'sesi dan data berhasil diperbarui' || data.message === 'sesi berhasil diperbarui, data berhasil dibuat') {
                result.textContent = `Barcode ${barcode} berhasil discan`;
                result.className = 'result success';
    
            } else if(data.status === 'fail' && data.message === 'input not valid, try again') {
                result.textContent = `Barcode ${barcode} tidak valid`;
                result.className = 'result fail';
    
            } else if(data.status === 'fail' && data.message === 'nim mahasiswa tidak terdaftar, hubungi petugas') {
                result.textContent = `Barcode ${barcode} tidak terdaftar, hubungi petugas`;
                result.className = 'result fail';
            }

            input.value = '';

            setTimeout(() => {                
                result.textContent = '';
                result.className = 'result';
            }, 3000);

        } catch(error) {
            result.textContent = 'Terjadi kesalahan dalam menghubungi server';
            result.className = 'result fail';

            input.value = '';

            setTimeout(() => {
                result.textContent = '';
                result.className = 'result';
            }, 3000);
        };
    };  
});

socket.on('barcode-scanned', (barcode, status, message) => {
    if(message === 'sesi dan data berhasil diperbarui' || message === 'sesi berhasil diperbarui, data berhasil dibuat') {
        result.textContent = `Barcode ${barcode} berhasil discan`;
        result.className = 'result success';

    } else if(status === 'fail' && message === 'input not valid, try again') {
        result.textContent = `Barcode ${barcode} tidak valid`;
        result.className = 'result fail';

    } else if(status === 'fail' && message === 'nim mahasiswa tidak terdaftar, hubungi petugas') {
        result.textContent = `Barcode ${barcode} tidak terdaftar, hubungi petugas`;
        result.className = 'result fail';

    };

    setTimeout(() => {
        result.textContent = '';
        result.className = 'result';
    }, 3000);
});