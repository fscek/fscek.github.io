// Fetch and render visuals
function fetchAndRenderVisuals() {
  fetch('../assets/data/visuals.json')
    .then(response => response.json())
    .then(visuals => {
      const visualsContainer = document.querySelector('.visuals-container');
      
      visuals.forEach(visual => {
        const visualDiv = document.createElement('div');
        visualDiv.className = 'visual-item';

        let visualHTML = `<h3 class="visual-title">${visual.title}</h3>`;
        if (visual.images && visual.images.length) {
          visual.images.forEach(image => {
            visualHTML += `<img src="${image}" alt="${visual.title}" class="visual-image">`;
          });
        }
        if (visual.date) {
          visualHTML += `<p>${visual.date}</p>`;
        }
        visualHTML += `<p class="visual-description">${visual.description}</p>`; // Use the class for padding
        if (visual.links) {
          visual.links.forEach(link => {
            visualHTML += `<a href="${link.url}" target="_blank" class="visuals-link">${link.platform}</a><br>`;
          });
        }

        visualDiv.innerHTML = visualHTML;
        visualsContainer.appendChild(visualDiv);
      });
    })
    .catch(error => console.error('Error fetching visuals:', error));
}

// Initialize the script when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchAndRenderVisuals);
