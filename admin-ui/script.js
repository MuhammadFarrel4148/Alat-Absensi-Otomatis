const ctx = document.getElementById('chart');
const datePicker = document.getElementById('date-picker');
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
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch(error) {

    };
});

