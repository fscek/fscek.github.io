fetch('assets/data/dates.json')
  .then(response => response.json())
  .then(dates => {
    const datesList = document.getElementById('club-dates-list');
    dates.forEach(date => {
      const listItem = document.createElement('li');

      // If there's a URL, make the entire line a hyperlink
      if (date.url) {
        listItem.innerHTML = `<a href="${date.url}" target="_blank" style="text-decoration: underline;">${date.date} - ${date.clubnight} at ${date.venue ? date.venue : ""} - ${date.city}</a>`;
      } else {
        listItem.textContent = `${date.date} - ${date.clubnight}${date.venue ? ` at ${date.venue}` : ""} - ${date.city}`;
      }

      datesList.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error('Error fetching club dates:', error);
  });
