function toggleBio() {
    var moreText = document.getElementById("moreText");
    var readMoreBtn = document.getElementById("readMore");

    if (moreText.classList.contains("show")) {
        moreText.classList.remove("show");
        setTimeout(() => { moreText.style.display = "none"; }, 500); // ensures display:none is applied after the transition
        readMoreBtn.innerHTML = "read more";
    } else {
        moreText.style.display = "block";
        setTimeout(() => { moreText.classList.add("show"); }, 10); // slight delay to ensure display:block is applied before adding opacity
        readMoreBtn.innerHTML = "read less";
    }
}
