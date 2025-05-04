const ctx = document.getElementById('chart');
const datePicker = document.getElementById('date-picker');
const result = document.getElementById('result');
const totalPengunjung = document.getElementById('total-pengunjung');
const profileImg = document.getElementById('profile-img');
const logoutMenu = document.getElementById('logout-menu');
const logoutButton = document.getElementById('logout-button');
const nameAdmin = document.getElementById('name-admin');

let currentChart = null;

profileImg.addEventListener('click', (event) => {
    logoutMenu.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
    if(!document.getElementById('profile-container').contains(event.target)) {
        logoutMenu.classList.add('hidden');
    };
});

logoutButton.addEventListener('click', async(event) => {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    const data = await response.json();

    if(data.status === 'success' && data.message === 'logout berhasil') {
        localStorage.removeItem('token');
        window.location.href = '../login-ui/login.html';
    };
});

datePicker.addEventListener('change', async(event) => {
    const token = localStorage.getItem('token');

    const selectedDate = new Date(event.target.value);

    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    try {
        const response = await fetch(`http://localhost:3000/statistic?day=${day}&month=${month}&year=${year}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        if(currentChart) {
            currentChart.destroy();
        };

        if(data.status === 'success') {
            result.textContent = 'Data statistik berhasil diambil';
            result.className = 'result success';
            totalPengunjung.textContent = `Total Pengunjung: ${data.total_pengunjung}`;

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

        } else {
            result.textContent = 'Data statistik gagal diambil, coba lagi';
            result.className = 'result fail';

        };

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

document.addEventListener('DOMContentLoaded', async(event) => {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/profile', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    const data = await response.json();

    nameAdmin.textContent = data.username;
});