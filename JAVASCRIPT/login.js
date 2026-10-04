const API_BASE_URL = "http://localhost:5073/api";

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const passwordToggle = document.querySelector(".password-toggle");

if (passwordInput && passwordToggle) {
    passwordToggle.addEventListener("click", function () {
        const showPassword = passwordInput.type === "password";
        passwordInput.type = showPassword ? "text" : "password";
        passwordToggle.setAttribute("aria-pressed", String(showPassword));
        passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");

        const icon = passwordToggle.querySelector("ion-icon");
        if (icon) {
            icon.name = showPassword ? "eye-off-outline" : "eye-outline";
        }
    });
}

loginForm.addEventListener("submit", async function (event) {

    // Prevent normal HTML form submission
    event.preventDefault();

    // Get the values from the inputs
    const username = document.getElementById("text").value.trim();
    const password = document.getElementById("password").value;

    const loginMessage = document.getElementById("loginMessage");

    // Show loading message
    loginMessage.textContent = "Logging in...";

    try {

        // Send login information to ASP.NET Core
        const response = await fetch(
            `${API_BASE_URL}/Auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const data = await response.json();

        // Login failed
        if (!response.ok) {

            loginMessage.textContent =
                data.message || "Invalid email or password.";

            return;
        }

               // Login successful
        console.log("Login successful:", data);

        // Store token and user info
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify({
            username: data.username,
            role: data.role,
            department: data.department,
            modules: data.modules
        }));

        // Go to main system
        window.location.href = "HTML.html";
    } catch (error) {

        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server.";
    }
});