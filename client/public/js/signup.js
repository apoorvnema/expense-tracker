const form = document.querySelector("form");

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const signup = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value
    }
    axios.post("http://127.0.0.1:3000/user/signup", signup)
        .then(result => {
            alert(result.data.message);
            window.location.href = "login.html";
        })
        .catch(err => alert(err.response.data.errors[0].message))
})

const login = document.getElementById("login");
login.addEventListener("click", () => {
    window.location.href = "login.html"
})