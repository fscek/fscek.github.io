function toggleMenu() {
    var menuContent = document.getElementById("menuContent");
    var menuIcon = document.getElementById("menuIcon");
    var overlay = document.getElementById("pageOverlay"); // Get the overlay element

    if (menuContent.style.display === "block") {
        menuContent.style.display = "none";
        overlay.style.display = "none"; // Hide the overlay when the menu is closed
        menuIcon.src = "assets/images/hamburger-menu-open.png"; // Switch back to open icon
    } else {
        menuContent.style.display = "block";
        overlay.style.display = "block"; // Show the overlay when the menu is open
        menuIcon.src = "assets/images/hamburger-menu-close.png"; // Switch to close icon
    }
}
