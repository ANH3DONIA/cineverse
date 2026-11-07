document.addEventListener('DOMContentLoaded', async () => {
  const [trending, topRated, upcoming] = await Promise.all([
    apiFetch('/api/movies/trending'),
    apiFetch('/api/movies/top_rated'),
    apiFetch('/api/movies/upcoming')
  ]);

  if (trending && trending.results) {
    renderMovies(trending.results.slice(0, 8), 'trending-movies');
    addCardListeners('trending-movies');
  }

  if (topRated && topRated.results) {
    renderMovies(topRated.results.slice(0, 8), 'toprated-movies');
    addCardListeners('toprated-movies');
  }

  if (upcoming && upcoming.results) {
    renderMovies(upcoming.results.slice(0, 8), 'upcoming-movies');
    addCardListeners('upcoming-movies');
  }

  if (trending && trending.results && trending.results[0] && trending.results[0].backdrop_path) {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.style.backgroundImage =
        `url(${IMG_BASE}${IMG_SIZES.backdrop}${trending.results[0].backdrop_path})`;
    }
  }
});

function addCardListeners(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const card = e.target.closest('.movie-card');
    if (!card) return;

    const movieId = card.dataset.movieId;
    const data = await apiFetch(`/api/movies/${movieId}`);
    if (data && !data.error) {
      openMovieModal(data);
    }
  });
}
