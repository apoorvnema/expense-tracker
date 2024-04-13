const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const login = {
        email: e.target.email.value,
        password: e.target.password.value
    }
    axios.post("http://127.0.0.1:3000/user/login", login)
        .then(result => {
            alert(result.data.message);
            localStorage.setItem("token", result.data.token);
            window.location.href = "index.html"
        })
        .catch(err => alert(err.response.data.message))
})

const signup = document.getElementById("signup");
signup.addEventListener("click", () => {
    window.location.href = "signup.html"
})