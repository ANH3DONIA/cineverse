document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('nav-links--open');
      navToggle.classList.toggle('nav-toggle--active');
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-links--open');
      navToggle.classList.remove('nav-toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
});

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const IMG_BASE = 'https://image.tmdb.org/t/p';
const IMG_SIZES = {
  poster: '/w500',
  backdrop: '/w1280',
  small: '/w200'
};

function createMovieCard(movie) {
  const card = document.createElement('article');
  card.className = 'movie-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Ver detalle de ${movie.title}`);
  card.dataset.movieId = movie.id;

  const img = document.createElement('img');
  img.className = 'movie-card__poster';
  img.loading = 'lazy';
  img.alt = `Póster de ${movie.title}`;
  if (movie.poster_path) {
    img.src = `${IMG_BASE}${IMG_SIZES.poster}${movie.poster_path}`;
  } else {
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="%23334155"><rect width="300" height="450" fill="%231e293b"/><text x="150" y="225" text-anchor="middle" fill="%2394a3b8" font-size="20">Sin imagen</text></svg>'
    );
  }

  const info = document.createElement('div');
  info.className = 'movie-card__info';

  const title = document.createElement('h3');
  title.className = 'movie-card__title';
  title.textContent = movie.title;

  const meta = document.createElement('div');
  meta.className = 'movie-card__meta';

  const rating = document.createElement('span');
  rating.className = 'movie-card__rating';
  rating.textContent = `Puntuación: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}`;

  const year = document.createElement('span');
  year.className = 'movie-card__year';
  year.textContent = movie.release_date ? movie.release_date.substring(0, 4) : '';

  meta.appendChild(rating);
  meta.appendChild(year);
  info.appendChild(title);
  info.appendChild(meta);
  card.appendChild(img);
  card.appendChild(info);

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });

  return card;
}

function renderMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!movies || movies.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No se encontraron películas.';
    container.appendChild(empty);
    return;
  }

  movies.forEach(movie => {
    container.appendChild(createMovieCard(movie));
  });
}

async function apiFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

function openMovieModal(movie) {
  const modal = document.getElementById('movie-modal');
  if (!modal) return;

  document.getElementById('modal-title').textContent = movie.title;
  document.getElementById('modal-overview').textContent =
    movie.overview || 'Sin descripción disponible.';
  document.getElementById('modal-rating').textContent =
    `Puntuación: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}`;
  document.getElementById('modal-date').textContent =
    movie.release_date || 'Fecha desconocida';
  document.getElementById('modal-lang').textContent =
    movie.original_language ? movie.original_language.toUpperCase() : '';
  document.getElementById('modal-popularity').textContent =
    movie.popularity ? movie.popularity.toFixed(0) : 'N/A';
  document.getElementById('modal-votes').textContent =
    movie.vote_count ? movie.vote_count.toLocaleString() : 'N/A';

  const poster = document.getElementById('modal-poster');
  if (movie.poster_path) {
    poster.src = `${IMG_BASE}${IMG_SIZES.poster}${movie.poster_path}`;
    poster.alt = `Póster de ${movie.title}`;
  }

  const backdrop = document.getElementById('modal-backdrop');
  if (movie.backdrop_path && backdrop) {
    backdrop.style.backgroundImage =
      `url(${IMG_BASE}${IMG_SIZES.backdrop}${movie.backdrop_path})`;
  }

  modal.showModal();
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('movie-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.close());
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
});
