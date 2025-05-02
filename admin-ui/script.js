const ctx = document.getElementById('chart');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Laki-Laki', 'Perempuan'],
        datasets: [{
            label: 'Banyaknya Pengunjung',
            data: [12, 19],
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