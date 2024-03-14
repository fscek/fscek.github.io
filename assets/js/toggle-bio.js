function toggleBio() {
    var moreText = document.getElementById("moreText");
    var readMoreBtn = document.getElementById("readMore");

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        readMoreBtn.innerHTML = "read less";
    } else {
        moreText.style.display = "none";
        readMoreBtn.innerHTML = "read more";
    }
}