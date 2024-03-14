function toggleMenu() {
    var menuContent = document.getElementById("menuContent");
    var overlay = document.getElementById("pageOverlay");

    if (menuContent.classList.contains('active')) {
        menuContent.classList.remove('active');
        overlay.style.display = "none";
        menuIcon.src = "assets/images/hamburger-menu-open.png";
    } else {
        menuContent.classList.add('active');
        overlay.style.display = "block";
        menuIcon.src = "assets/images/hamburger-menu-close.png";
    }
}
