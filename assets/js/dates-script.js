fetch('assets/data/dates.json')
  .then(response => response.json())
  .then(dates => {
    const datesList = document.getElementById('club-dates-list');
    dates.forEach(date => {
      const listItem = document.createElement('li');
      let venueInfo = date.venue ? ` at ${date.venue}` : ""; // Check if venue exists
      listItem.textContent = `${date.date} - ${date.clubnight}${venueInfo} - ${date.city}`;
      datesList.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error('Error fetching club dates:', error);
    // Optionally handle the error, e.g., display a message to the user
  });
