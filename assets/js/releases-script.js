// Generate and append year filter buttons dynamically for releases
function generateYearFiltersReleases() {
    const startYear = 2015; // starting from the first release year
    const currentYear = new Date().getFullYear();
    const filtersContainer = document.getElementById('year-filter-container-releases');

    for (let year = currentYear; year >= startYear; year--) {
        const button = document.createElement('button');
        button.className = 'year-filter-button';
        button.textContent = year;
        button.addEventListener('click', () => {
            document.querySelectorAll('#year-filter-container-releases .year-filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            fetchAndRenderReleases(year);
        });
        filtersContainer.appendChild(button);
    }
}
// Fetch and render releases based on the selected year with fade transition
function fetchAndRenderReleases(selectedYear) {
    fetch('../assets/data/releases.json')
    .then(response => response.json())
    .then(releases => {
        const contentContainer = document.querySelector('.releases-content-container');
        contentContainer.style.opacity = 0; // Start fade-out

        setTimeout(() => {
            contentContainer.innerHTML = ''; // Clear existing releases content after fade-out

            const filteredReleases = releases.filter(release => release.year === selectedYear);
            filteredReleases.forEach(release => {
                const releaseItem = document.createElement('div');
                releaseItem.className = 'release-item';

                // Image handling
                const imageUrl = release.image ? release.image : null;
                const imageElement = imageUrl ? `<img src="${imageUrl}" alt="${release.title}" loading="lazy" class="release-image">` : '';

                // Date handling
                const dateElement = release.releaseDate ? `<p>${release.releaseDate}</p>` : '';

                // Links handling
                const linksHtml = release.links.map(link => `<a href="${link.url}" target="_blank" class="release-link">${link.platform}</a>`).join('<br>');

                // Build HTML string for the release item
                let releaseHTML = `<h3 class="release-title">${release.title}</h3>`;
                releaseHTML += imageElement + dateElement + `<p class="release-description">${release.description}</p>` + linksHtml;

                // Set the inner HTML of the release item
                releaseItem.innerHTML = releaseHTML;
                contentContainer.appendChild(releaseItem);
            });

            // Start fade-in
            contentContainer.style.opacity = 1;
        }, 400); // Delay should match the CSS transition time
    })
    .catch(error => console.error('Error fetching releases:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    generateYearFiltersReleases();
    const recentYearButton = document.querySelector('#year-filter-container-releases .year-filter-button');
    if (recentYearButton) {
        recentYearButton.click();
    }
});