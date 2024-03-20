// Generate and append year filter buttons dynamically for mixes
function generateMixesYearFilters() {
    const startYear = 2015;
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

// Fetch and render mixes based on the selected year with fade transition
function fetchAndRenderMixes(selectedYear) {
    fetch('../assets/data/mixes.json')
    .then(response => response.json())
    .then(mixes => {
        const mixesContainer = document.querySelector('.mixes-content-container');
        mixesContainer.style.opacity = 0;

        setTimeout(() => {
            mixesContainer.innerHTML = ''; // Clear existing mixes content

            mixes.forEach(mix => {
                if (!mix.date || new Date(mix.date).getFullYear() === selectedYear) {
                    const mixDiv = document.createElement('div');
                    mixDiv.className = 'mix-item';
                    let mixHTML = `<h3 class="mix-title">${mix.title}</h3>`;

                    // Append the image right after the title
                    if (mix.image) {
                        mixHTML += `<img src="${mix.image}" alt="${mix.title}" class="mix-image">`;
                    }

                    // Append the date if it exists
                    if (mix.date) {
                        mixHTML += `<p>${mix.date}</p>`;
                    }

                    // Append the description
                    mixHTML += `<p class="mix-description">${mix.description}</p>`;

                    // Iterate over the links array and append each link to mixHTML
                    mix.links.forEach(link => {
                        mixHTML += `<a href="${link.url}" target="_blank" class="mixes-link">${link.platform}</a><br>`;
                    });

                    mixDiv.innerHTML = mixHTML;
                    mixesContainer.appendChild(mixDiv);
                }
            });

            requestAnimationFrame(() => {
                mixesContainer.style.opacity = 1;
            });
        }, 400); // Matches the CSS transition duration
    })
    .catch(error => console.error('Error fetching mixes:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    generateMixesYearFilters();
    const mostRecentYearButton = document.querySelector('#year-filter-container-mixes .year-filter-button');
    if (mostRecentYearButton) {
        mostRecentYearButton.click();
    }
});
