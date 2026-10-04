const API_ROOT = "http://localhost:5073/api";
const MODULE_PAGES = ["analytics", "marketing", "technical", "production", "warehouse", "admin"];
const _originalFetch = window.fetch.bind(window);

window.fetch = async function (input, options = {}) {
  const url = typeof input === "string" ? input : input.url;

  if (url.startsWith(API_ROOT) && !url.includes("/auth/login")) {
    const headers = new Headers(options.headers || {});
    const token = sessionStorage.getItem("token");
    if (token) headers.set("Authorization", "Bearer " + token);
    options = { ...options, headers };
  }

  const response = await _originalFetch(input, options);

  // Token expired or invalid: send back to login
  if (response.status === 401 && url.startsWith(API_ROOT)) {
    sessionStorage.clear();
    window.location.href = "LoginPage.html";
  }

  return response;
};
function getUser() {
  return JSON.parse(sessionStorage.getItem("user") || "null");
}

// Runs immediately: kick out anyone who isn't logged in
(function requireLogin() {
  if (!sessionStorage.getItem("token") || !getUser()) {
    window.location.href = "LoginPage.html";   // your login page path
  }
})();

// Can this user open this page? Non-module pages (like profile-settings) are always allowed.
function canAccess(page) {
  if (!MODULE_PAGES.includes(page)) return true;
  const user = getUser();
  return !!user && user.modules.includes(page);
}

// First page the user is allowed to see (use for your default page)
function getDefaultPage() {
  const user = getUser();
  return user && user.modules.length ? user.modules[0] : null;
}

// Remove sidebar items the user has no access to
function applyModuleAccess() {
  const user = getUser();
  if (!user) return;
  document.querySelectorAll(".menu-item [data-page]").forEach(link => {
    if (!user.modules.includes(link.dataset.page)) {
      link.closest("li").remove();
    }
  });
}

// Show the real user in the header
function applyUserInfo() {
  const user = getUser();
  if (!user) return;
  document.getElementById("headerName").textContent = "Hello, " + user.username;
  document.getElementById("headerRole").textContent = user.role;
  document.getElementById("subMenuName").textContent = user.username;
}

// Use this for every API call so the token is attached
async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + sessionStorage.getItem("token"),
      ...(options.headers || {})
    }
  });
  if (res.status === 401) { logout(); }
  if (res.status === 403) { alert("You don't have access to this."); }
  return res;
}

function logout() {
  sessionStorage.clear();
  window.location.href = "LoginPage.html";
}

document.addEventListener("DOMContentLoaded", () => {
  applyModuleAccess();
  applyUserInfo();
});