fetch('assets/data/dates.json')
  .then(response => response.json())
  .then(dates => {
    const datesList = document.getElementById('club-dates-list');
    dates.forEach(date => {
      const listItem = document.createElement('li');
      // Check if clubnight is not empty and append a comma for separation
      const clubnight = date.clubnight ? `${date.clubnight}${date.venue ? ' at ' : date.city ? ' - ' : ''}` : '';
      const venue = date.venue ? `${date.venue}` : '';
      const venueCitySeparator = date.venue && date.city ? ' - ' : '';
      const city = date.city;

      // Construct the display text
      const displayText = `${date.date} - ${clubnight}${venue}${venueCitySeparator}${city}`;

      // If there's a URL, make the entire line a hyperlink
      if (date.url) {
        listItem.innerHTML = `<a href="${date.url}" target="_blank" style="text-decoration: underline;">${displayText}</a>`;
      } else {
        listItem.textContent = displayText;
      }

      datesList.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error('Error fetching club dates:', error);
  });
