fetch('../assets/data/mixes.json')
.then(response => response.json())
.then(mixes => {
    const mixesSection = document.getElementById('mixes-section');
    mixes.forEach(mix => {
        const mixItem = document.createElement('div');
        mixItem.className = 'mix-item';

        let mixContent = `<h3 class="mix-title">${mix.title}</h3>`;
        if (mix.image) {
            mixContent += `<img src="${mix.image}" alt="${mix.title}" class="mix-image" style="width:100%;max-width:600px;height:auto;">`;
        }
        mixContent += `<p>${mix.date}</p><p>${mix.description}</p>`;
        mixContent += `<a href="${mix.link}" target="_blank" class="underline-link">Listen</a>`;

        mixItem.innerHTML = mixContent;
        mixesSection.appendChild(mixItem);
    });
})
.catch(error => console.error('Error fetching mixes:', error));
