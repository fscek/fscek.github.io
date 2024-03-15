fetch('../assets/data/news.json')
.then(response => response.json())
.then(newsItems => {
    const newsSection = document.getElementById('news-section');
    
    // clears existing content in the news section
    newsSection.innerHTML = '';

    newsItems.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        let newsContent = `<h3>${item.title}</h3>`;
        if (item.image) {
            newsContent += `<img src="${item.image}" alt="${item.title}" style="width:100%;max-width:600px;height:auto;">`;
        }
        newsContent += `<p>${item.date}</p><p>${item.content}</p>`;
        if (item.link) {
            newsContent += `<a href="${item.link}">Read More</a>`;
        }

        newsItem.innerHTML = newsContent;
        newsSection.appendChild(newsItem);
    });
})
.catch(error => {
    console.error('Error fetching news:', error);
});
