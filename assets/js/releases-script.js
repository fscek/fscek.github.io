fetch('../assets/data/releases.json')
.then(response => response.json())
.then(releases => {
    const releasesSection = document.getElementById('releases-section');
    releases.forEach(release => {
        const releaseItem = document.createElement('div');
        releaseItem.className = 'release-item';

        let releaseContent = `<h3 class="release-title">${release.title}</h3>`;
        if (release.image) {
            releaseContent += `<img src="${release.image}" alt="${release.title}" class="release-image" style="width:100%;max-width:600px;height:auto;">`;
        }
        releaseContent += `<p>${release.releaseDate}</p><p>${release.description}</p><div class="release-links">`;

        release.links.forEach(link => {
            releaseContent += `<a href="${link.url}" target="_blank" class="underline-link">${link.platform}</a><br>`;
        });

        releaseContent += `</div>`;
        releaseItem.innerHTML = releaseContent;
        releasesSection.appendChild(releaseItem);
    });
})
.catch(error => console.error('Error fetching releases:', error));
