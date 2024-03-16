// Generate and append year filter buttons dynamically for releases
function generateYearFiltersReleases() {
    const startYear = 2016; // Starting from the first release year
    const currentYear = new Date().getFullYear();
    const filtersContainer = document.getElementById('year-filter-container-releases');

    for (let year = currentYear; year >= startYear; year--) {
        const button = document.createElement('button');
        button.className = 'year-filter-button';
        button.textContent = year;
        button.onclick = () => {
            document.querySelectorAll('#year-filter-container-releases .year-filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            fetchAndRenderReleases(year);
        };
        filtersContainer.appendChild(button);
    }
}

// Fetch and render releases based on the selected year
function fetchAndRenderReleases(selectedYear) {
    fetch('../assets/data/releases.json')
    .then(response => response.json())
    .then(releases => {
        const contentContainer = document.querySelector('.releases-content-container');
        contentContainer.innerHTML = ''; // Clear existing releases content

        const filteredReleases = releases.filter(release => new Date(release.releaseDate).getFullYear() === selectedYear);
        filteredReleases.forEach(release => {
            const releaseItem = document.createElement('div');
            releaseItem.className = 'release-item';
            let releaseHTML = `<h3 class="release-title">${release.title}</h3>`;
            if (release.image) {
                releaseHTML += `<img src="${release.image}" alt="${release.title}" class="release-image">`;
            }
            releaseHTML += `<p>${release.releaseDate}</p><p>${release.description}</p>`;
            release.links.forEach(link => {
                releaseHTML += `<a href="${link.url}" target="_blank" class="release-link">${link.platform}</a><br>`;
            });
            releaseItem.innerHTML = releaseHTML;
            contentContainer.appendChild(releaseItem);
        });
    })
    .catch(error => console.error('Error fetching releases:', error));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateYearFiltersReleases();
    // Optionally trigger the most recent year's button to display releases
    const recentYearButton = document.querySelector('#year-filter-container-releases .year-filter-button');
    if (recentYearButton) {
        recentYearButton.click();
    }
});
