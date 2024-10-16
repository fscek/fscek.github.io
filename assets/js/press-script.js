let selectedLanguage = "english";
let selectedLength = "shorter";

// Generate and append language filter buttons dynamically
function generateLanguageFiltersPress() {
    const languages = ["english", "croatian"];
    const filtersContainer = document.getElementById('language-filter-container-press');

    languages.forEach(language => {
        const button = document.createElement('button');
        button.className = 'language-filter-button';
        button.textContent = language;

        if (language === selectedLanguage) {
            button.classList.add('active'); // Set the default active language
        }

        button.addEventListener('click', () => {
            // Prevent reloading if the selected language is already active
            if (selectedLanguage === language) return;

            // Update the selected language and set button as active
            document.querySelectorAll('#language-filter-container-press .language-filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedLanguage = language;

            // Render the press content
            fetchAndRenderPress();
        });
        filtersContainer.appendChild(button);
    });
}

// Generate and append length filter buttons dynamically
function generateLengthFiltersPress() {
    const lengths = ["shorter", "longer"];
    const filtersContainer = document.getElementById('length-filter-container-press');

    lengths.forEach(length => {
        const button = document.createElement('button');
        button.className = 'length-filter-button';
        button.textContent = length;

        if (length === selectedLength) {
            button.classList.add('active'); // Set the default active length
        }

        button.addEventListener('click', () => {
            // Prevent reloading if the selected length is already active
            if (selectedLength === length) return;

            // Update the selected length and set button as active
            document.querySelectorAll('#length-filter-container-press .length-filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedLength = length;

            // Render the press content
            fetchAndRenderPress();
        });
        filtersContainer.appendChild(button);
    });
}

// Fetch and render press content based on the selected language and length
function fetchAndRenderPress() {
    fetch('/assets/data/press.json')
    .then(response => response.json())
    .then(pressContent => {
        const contentContainer = document.querySelector('.press-content-container');
        contentContainer.style.opacity = 0; // Start fade-out

        setTimeout(() => {
            contentContainer.innerHTML = ''; // Clear existing press content after fade-out

            const filteredPress = pressContent.filter(press => press.language === selectedLanguage && press.length === selectedLength);
            filteredPress.forEach(press => {
                const pressItem = document.createElement('div');
                pressItem.className = 'press-item';

                // Build HTML string for the press item
                let pressHTML = `<p class="press-content">${press.content}</p>`;
                pressHTML += `<a href="https://cloud.szch.me/s/gEWGGNtjH8s3PYC" target="_blank" class="press-link">download images here</a>`;

                // Set the inner HTML of the press item
                pressItem.innerHTML = pressHTML;

                // Append press item to the container
                contentContainer.appendChild(pressItem);
            });

            // Start fade-in
            contentContainer.style.opacity = 1;
        }, 400); // Delay should match the CSS transition time
    })
    .catch(error => console.error('Error fetching press content:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    generateLanguageFiltersPress();
    generateLengthFiltersPress();

    // Render the default content for "English" and "Shorter"
    fetchAndRenderPress();
});
