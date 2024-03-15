fetch('../assets/data/releases.json')
.then(response => response.json())
.then(releases => {
    const releasesSection = document.getElementById('releases-section');
    releases.forEach(release => {
        const releaseItem = document.createElement('div');
        releaseItem.className = 'release-item';

        let releaseContent = `
          <h3 class="release-title">${release.title}</h3>
          <p class="release-date">${release.releaseDate}</p>
          <img src="${release.image}" alt="${release.title}" class="release-image">
          <p>${release.description}</p>
          <div class="release-links">`;

        release.links.forEach(link => {
            releaseContent += `<a href="${link.url}" target="_blank">${link.platform}</a><br>`;
        });

        releaseContent += `</div>`;
        releaseItem.innerHTML = releaseContent;
        releasesSection.appendChild(releaseItem);
    });
})
.catch(error => console.error('Error fetching releases:', error));
