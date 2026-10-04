// =====================================================
// GLOBAL JAVASCRIPT
// MiRhema Graphics Inc. ERP System
// =====================================================


// =====================================================
// SIDEBAR
// =====================================================

const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.getElementById("sidebar-toggle");


// -----------------------------------------------------
// Toggle Sidebar
// -----------------------------------------------------

function toggleSidebar() {

    if (!sidebar) return;

    sidebar.classList.toggle("close");

}


// -----------------------------------------------------
// Sidebar Button
// -----------------------------------------------------

if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", toggleSidebar);
}



// =====================================================
// PAGE LOADER
// =====================================================

const menuLinks = document.querySelectorAll(".link");
const mainContent = document.getElementById("main-content");


// -----------------------------------------------------
// Page Initializers
// -----------------------------------------------------
// These functions should be defined in their own JS files.
//
// Example:
// marketing.js  → initializeMarketingPage()
// technical.js  → initializeTechnicalPage()
// finance.js    → initializeFinancePage()
// hr.js         → initializeHRPage()
// admin.js      → initializeAdminPage()
// logistics.js  → initializeLogisticsPage()
// -----------------------------------------------------

function initializePage(page) {

    switch (page) {

        case "marketing":

            if (typeof initializeMarketingPage === "function") {
                initializeMarketingPage();
            }

            break;


        case "technical":

            if (typeof initializeTechnicalPage === "function") {
                initializeTechnicalPage();
            }

            break;

        case "production":

            if (typeof initializeProductionPage === "function") {
                initializeProductionPage();
            }

            break;

        case "warehouse":

            if (typeof initializeWarehousePage === "function") {
                initializeWarehousePage();
            }

            break;


        case "finance":

            if (typeof initializeFinancePage === "function") {
                initializeFinancePage();
            }

            break;


        case "hr":

            if (typeof initializeHRPage === "function") {
                initializeHRPage();
            }

            break;


        case "admin":

            if (typeof initializeAdminPage === "function") {
                initializeAdminPage();
            }

            break;


        case "logistics":

            if (typeof initializeLogisticsPage === "function") {
                initializeLogisticsPage();
            }

            break;


        default:

            console.log(`No specific JS for ${page}`);

            break;
    }

}


// -----------------------------------------------------
// Load Page
// -----------------------------------------------------

function loadPage(page) {

    if (!mainContent) {
        console.error("Main content container not found.");
        return;
    }

    // Access check (canAccess comes from auth.js)
    if (!canAccess(page)) {
        mainContent.innerHTML = `
            <div class="page-error">
                <h2>403 - Access Denied</h2>
                <p>You don't have permission to open this module.</p>
            </div>
        `;
        return;
    }

    // Show loading message
    mainContent.innerHTML = `
        <div class="page-loading">
            Loading...
        </div>
    `;

    fetch(`../main-content/${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`${page}.html not found (${response.status})`);
            }
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
            initializePage(page);
            console.log(`${page}.html loaded successfully.`);
        })
        .catch(error => {
            console.error("Page loading error:", error);
            mainContent.innerHTML = `
                <div class="page-error">
                    <h2>404 - Page Not Found</h2>
                    <p>The page <strong>${page}.html</strong> could not be loaded.</p>
                </div>
            `;
        });
}


// =====================================================
// MENU LINKS
// =====================================================

menuLinks.forEach(link => {

    link.addEventListener("click", function (event) {

        event.preventDefault();


        // Remove active class from all links
        menuLinks.forEach(item => {
            item.classList.remove("active-link");
        });


        // Add active class to clicked link
        this.classList.add("active-link");


        // Get page name
        const page = this.dataset.page;


        if (!page) {
            console.error("Menu link has no data-page attribute.");
            return;
        }


        // Load page
        loadPage(page);

    });

});



// =====================================================
// DEFAULT PAGE
// =====================================================

// =====================================================
// DEFAULT PAGE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // First module this user is allowed to open (from auth.js)
    const startPage = getDefaultPage();

    if (!startPage) {
        mainContent.innerHTML = `
            <div class="page-error">
                <h2>No Access</h2>
                <p>Your account has no module access. Please contact an administrator.</p>
            </div>
        `;
        return;
    }

    // Find the sidebar link for that page
    const startLink = document.querySelector(
        `.link[data-page="${startPage}"]`
    );

    // Set it as active
    menuLinks.forEach(item => {
        item.classList.remove("active-link");
    });

    if (startLink) {
        startLink.classList.add("active-link");
    }

    // Load default page
    loadPage(startPage);

});



// =====================================================
// PROFILE MENU
// =====================================================

const subMenu = document.getElementById("subMenu");


// -----------------------------------------------------
// Toggle Profile Menu
// -----------------------------------------------------

function toggleMenu() {

    if (!subMenu) return;

    subMenu.classList.toggle("open-menu");

}


// -----------------------------------------------------
// Close Profile Menu When Clicking Outside
// -----------------------------------------------------

document.addEventListener("click", function (event) {

    if (!subMenu) return;


    const clickedInsideHeader =
        event.target.closest(".header-right");

    const clickedInsideMenu =
        event.target.closest(".sub-menu-wrap");


    if (!clickedInsideHeader && !clickedInsideMenu) {

        subMenu.classList.remove("open-menu");

    }

});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./SW_CachedSite.js')
            .then(reg => console.log('Service Worker: Registered'))
            .catch(err => console.log(`Service Worker: Error: ${err}`));
            
    });
}
