document.addEventListener('DOMContentLoaded', () => {
  // Add buttons for filtering upcoming and past events
  const datesSection = document.getElementById('dates');

  const filterContainer = document.createElement('div');
  filterContainer.id = 'filter-container';

  const upcomingButton = document.createElement('button');
  upcomingButton.textContent = 'upcoming dates';
  upcomingButton.classList.add('filter-button', 'date-filter-button');
  upcomingButton.addEventListener('click', () => {
    setActiveFilterButton(upcomingButton);
    filterDates(true);
  });

  const pastButton = document.createElement('button');
  pastButton.textContent = 'past dates';
  pastButton.classList.add('filter-button', 'date-filter-button');
  pastButton.addEventListener('click', () => {
    setActiveFilterButton(pastButton);
    filterDates(false);
  });

  filterContainer.appendChild(upcomingButton);
  filterContainer.appendChild(pastButton);
  datesSection.insertBefore(filterContainer, datesSection.querySelector('ul'));

  let allDates = [];

  // Fetch and render the initial list of dates (showing upcoming by default)
  fetch('assets/data/dates.json')
    .then(response => response.json())
    .then(dates => {
      allDates = dates;
      filterDates(true); // Initially show upcoming dates
      setActiveFilterButton(upcomingButton); // Set the upcoming button as active initially
    })
    .catch(error => {
      console.error('Error fetching club dates:', error);
    });

  // Function to filter and render dates
  function filterDates(showUpcoming) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set currentDate to start of the day to compare dates only

    const filteredDates = allDates.filter(date => {
      const eventDate = new Date(date.date);
      eventDate.setHours(0, 0, 0, 0); // Set eventDate to start of the day to compare dates only

      if (isNaN(eventDate)) {
        return false; // Skip dates that cannot be parsed
      }
      return showUpcoming ? eventDate >= currentDate : eventDate < currentDate;
    });
    smoothRenderDates(filteredDates);
  }

  // Function to render dates smoothly with transition
  function smoothRenderDates(dates) {
    const datesList = document.getElementById('club-dates-list');

    // Fade-out effect before clearing the content
    datesList.style.opacity = 0;

    setTimeout(() => {
      // Clear existing content
      datesList.innerHTML = '';

      if (dates.length === 0) {
        // Display a placeholder if there are no dates
        const placeholderItem = document.createElement('li');
        placeholderItem.textContent = "no shows at the moment, check back later!";
        datesList.appendChild(placeholderItem);
      } else {
        // Render dates if available
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
      }

      // Fade-in effect after content is updated
      datesList.style.opacity = 1;
    }, 300); // Delay should match the CSS transition time
  }

  // Set active state for filter buttons
  function setActiveFilterButton(activeButton) {
    document.querySelectorAll('.filter-button').forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }
});
