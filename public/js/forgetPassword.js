document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetPasswordForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        if (!password || !confirmPassword) {
            alert('Please fill in both password fields.');
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
        } else {
            try {
                const response = await fetch("http://localhost:3000" + window.location.pathname, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });

                if (response.ok) {
                    alert('Password reset successful.');
                    window.location.reload();
                } else {
                    const errorMessage = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorMessage}`);
                }
            }
            catch (err) {
                console.error(err);
            }
        }
    });
});
