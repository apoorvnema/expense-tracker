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
                await axios.post(window.location.pathname, { password });
                alert('Password reset successful.');
                window.location.reload();
            }
            catch (err) {
                console.log(err);
            }
        }
    });
});
