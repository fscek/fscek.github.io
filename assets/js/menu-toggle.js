function toggleMenu() {
    var menuContent = document.getElementById("menuContent");
    var overlay = document.getElementById("pageOverlay");
    var menuIcon = document.getElementById("menuIcon");

    // Reduce opacity to start fade out
    menuIcon.style.opacity = 0;

    // Wait for fade out, then switch icon and fade in
    setTimeout(() => {
        if (menuContent.classList.contains('active')) {
            menuContent.classList.remove('active');
            overlay.style.display = "none";
            menuIcon.src = "/assets/images/hamburger-menu-open.png";
        } else {
            menuContent.classList.add('active');
            overlay.style.display = "block";
            menuIcon.src = "/assets/images/hamburger-menu-close-D67DB3.png";
        }
        // Fade icon back in
        menuIcon.style.opacity = 1;
    }, 150); // duration matches the CSS transition duration
}
