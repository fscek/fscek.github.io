fetch('../assets/data/mixes.json')
.then(response => response.json())
.then(mixes => {
    const mixesSection = document.getElementById('mixes-section');
    mixes.forEach(mix => {
        const mixItem = document.createElement('div');
        mixItem.className = 'mix-item';

        let mixContent = `
          <h3 class="mix-title">${mix.title}</h3>
          <p class="mix-date">${mix.date}</p>
          <img src="${mix.image}" alt="${mix.title}" class="mix-image">
          <p>${mix.description}</p>
          <a href="${mix.link}" target="_blank">Listen</a>`;

        mixItem.innerHTML = mixContent;
        mixesSection.appendChild(mixItem);
    });
})
.catch(error => console.error('Error fetching mixes:', error));
