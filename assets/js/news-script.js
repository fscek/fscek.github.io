fetch('../assets/data/news.json')
.then(response => response.json())
.then(newsItems => {
    const newsSection = document.getElementById('news-section');
    newsSection.innerHTML = ''; // Clear existing content

    newsItems.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        // Start with the title
        let newsContent = `<h3 class="news-title">${item.title}</h3>`;
        
        // Add the date here, before the image
        newsContent += `<p>${item.date}</p>`;

        // Then add the image, if it exists
        if (item.image) {
            newsContent += `<img src="${item.image}" alt="${item.title}" class="news-image">`;
        }

        // Finally, add the content
        newsContent += `<p>${item.content}</p>`;

        // Handling multiple links, if any
        if (item.links && item.links.length > 0) {
            item.links.forEach(link => {
                newsContent += `<a href="${link.url}">${link.text}</a><br>`;
            });
        }

        newsItem.innerHTML = newsContent;
        newsSection.appendChild(newsItem);
    });
})
.catch(error => {
    console.error('Error fetching news:', error);
});
