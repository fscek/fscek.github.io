fetch('../assets/data/news.json')
.then(response => response.json())
.then(newsItems => {
    const newsSection = document.getElementById('news-section');
    newsSection.innerHTML = ''; // Clear existing content

    newsItems.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        let newsContent = `<h3>${item.title}</h3>`;
        if (item.image) {
            newsContent += `<img src="${item.image}" alt="${item.title}" style="width:100%;max-width:600px;height:auto;">`;
        }
        newsContent += `<p>${item.date}</p><p>${item.content}</p>`;

        // Handling multiple links
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
