// This function generates the year filters for mixes
function generateMixesYearFilters() {
    const startYear = 2016;
    const currentYear = new Date().getFullYear();
    const filtersContainer = document.getElementById('year-filter-container-mixes');

    for (let year = currentYear; year >= startYear; year--) {
        const button = document.createElement('button');
        button.className = 'year-filter-button';
        button.textContent = year;
        button.addEventListener('click', function() {
            document.querySelectorAll('#year-filter-container-mixes .year-filter-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            fetchAndRenderMixes(year);
        });
        filtersContainer.appendChild(button);
    }
}

// This function fetches and renders the mixes based on the selected year
function fetchAndRenderMixes(selectedYear) {
    fetch('../assets/data/mixes.json')
    .then(response => response.json())
    .then(mixes => {
        const filteredMixes = mixes.filter(mix => new Date(mix.date).getFullYear() === selectedYear);
        const mixesContainer = document.querySelector('.mixes-content-container');
        mixesContainer.innerHTML = ''; // Clear existing content

        filteredMixes.forEach(mix => {
            const mixDiv = document.createElement('div');
            mixDiv.className = 'mix-item';
            let mixHTML = `<h3 class="mix-title">${mix.title}</h3><p>${mix.date}</p><p>${mix.description}</p>`;
            if (mix.image) {
                mixHTML += `<img src="${mix.image}" alt="${mix.title}" class="mix-image">`;
            }
            if (mix.link) {
                mixHTML += `<a href="${mix.link}" target="_blank" class="underline-link">Listen</a>`;
            }
            mixDiv.innerHTML = mixHTML;
            mixesContainer.appendChild(mixDiv);
        });
    })
    .catch(error => console.error('Error fetching mixes:', error));
}

// Initialize the script for mixes
document.addEventListener('DOMContentLoaded', () => {
    generateMixesYearFilters();
    // Optionally trigger the most recent year's button to show the mixes
    const mostRecentYearButton = document.querySelector('#year-filter-container-mixes .year-filter-button');
    if (mostRecentYearButton) {
        mostRecentYearButton.click();
    }
});
