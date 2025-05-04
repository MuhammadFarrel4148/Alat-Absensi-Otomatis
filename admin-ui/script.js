const ctx = document.getElementById('chart');
const datePicker = document.getElementById('date-picker');
const result = document.getElementById('result');
const totalPengunjung = document.getElementById('total-pengunjung');

let currentChart = null;

datePicker.addEventListener('change', async(event) => {
    const selectedDate = new Date(event.target.value);

    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    try {
        const response = await fetch(`http://localhost:3000/statistic?day=${day}&month=${month}&year=${year}`, {
            method: 'GET'
        });

        const data = await response.json();

        if(currentChart) {
            currentChart.destroy();
        };

        if(data.status === 'success') {
            result.textContent = 'Data statistik berhasil diambil';
            result.className = 'result success';
            totalPengunjung.textContent = `Total Pengunjung: ${data.total_pengunjung}`;

        } else {
            result.textContent = 'Data statistik gagal diambil, coba lagi';
            result.className = 'result fail';

        };

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Laki-Laki', 'Perempuan'],
                datasets: [{
                    label: 'Banyaknya Pengunjung',
                    data: [data.pengunjung_pria, data.pengunjung_wanita],
                    backgroundColor: ['#4A90E2','#FE7743'], 
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },

                    title: {
                        display: true,
                        text: 'Statistik Pengunjung',
                        font: {
                            size: 20,
                            family: 'Poppins'
                        },
                        color: '#273F4F'
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        setTimeout(() => {
            result.textContent = '';
            result.className = 'result';

        }, 3000);

    } catch(error) {
        result.textContent = 'Gagal menghubungi server, coba lagi';
        result.className = 'result fail';

        setTimeout(() => {
            result.textContent = '';
            result.className = 'result';
            
        }, 3000);
    };
});

