const loginForm = document.querySelector('form');
const emailInput = document.getElementById('input-email');
const passwordInput = document.getElementById('input-password');
const result = document.getElementById('result');

loginForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if(data.status === 'fail' && data.message === 'Input not valid, try again') {
            result.textContent = 'Input not valid, try again';
            result.className = 'result fail';

        } else if(data.status === 'fail' && data.message === 'Email or password are incorrect') {
            result.textContent = 'Incorret username or password';
            result.className = 'result fail';

        } else if(data.status === 'success' && data.message === 'berhasil login') {
            localStorage.setItem('token', data.token);
            window.location.href = '../admin-ui/admin.html'
        }

        emailInput.value = '';
        passwordInput.value =  '';

        setTimeout(() => {
            result.textContent = '';
            result.className = 'result';

        }, 3000);

    } catch(error) {
        result.textContent = 'Terjadi kesalahan dalam menghubungi server';
        result.className = 'result fail';

        emailInput.value = '';
        passwordInput.value = '';

        setTimeout(() => {
            result.textContent = '';
            result.className = 'result';
            
        }, 3000);
    };
});