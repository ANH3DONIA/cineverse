document.addEventListener('DOMContentLoaded', () => {
  let currentCategory = 'popular';
  let currentPage = 1;
  let currentQuery = '';
  let totalPages = 1;

  const catalogContainer = document.getElementById('catalog-movies');
  const paginationContainer = document.getElementById('pagination');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const filterTabs = document.querySelectorAll('.filter-tab');

  async function loadMovies(category, page = 1) {
    currentCategory = category;
    currentPage = page;
    currentQuery = '';

    catalogContainer.innerHTML = `
      <div class="loading-skeleton" aria-label="Cargando películas...">
        ${'<div class="skeleton-card"></div>'.repeat(8)}
      </div>
    `;

    const data = await apiFetch(`/api/movies/${category}?page=${page}`);

    if (data && data.results) {
      totalPages = Math.min(data.total_pages, 20);
      renderMovies(data.results, 'catalog-movies');
      addCatalogListeners();
      renderPagination();
    }
  }

  async function searchMovies(query, page = 1) {
    currentQuery = query;
    currentPage = page;

    catalogContainer.innerHTML = `
      <div class="loading-skeleton" aria-label="Buscando películas...">
        ${'<div class="skeleton-card"></div>'.repeat(8)}
      </div>
    `;

    const data = await apiFetch(
      `/api/movies/search?q=${encodeURIComponent(query)}&page=${page}`
    );

    if (data && data.results) {
      totalPages = Math.min(data.total_pages, 20);
      renderMovies(data.results, 'catalog-movies');
      addCatalogListeners();
      renderPagination();
    }
  }

  function renderPagination() {
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn btn-page';
      prevBtn.textContent = 'Anterior';
      prevBtn.addEventListener('click', () => {
        if (currentQuery) {
          searchMovies(currentQuery, currentPage - 1);
        } else {
          loadMovies(currentCategory, currentPage - 1);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      paginationContainer.appendChild(prevBtn);
    }

    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    paginationContainer.appendChild(pageInfo);

    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-page';
      nextBtn.textContent = 'Siguiente';
      nextBtn.addEventListener('click', () => {
        if (currentQuery) {
          searchMovies(currentQuery, currentPage + 1);
        } else {
          loadMovies(currentCategory, currentPage + 1);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      paginationContainer.appendChild(nextBtn);
    }
  }

  function addCatalogListeners() {
    catalogContainer.addEventListener('click', async (e) => {
      const card = e.target.closest('.movie-card');
      if (!card) return;

      const movieId = card.dataset.movieId;
      const data = await apiFetch(`/api/movies/${movieId}`);
      if (data && !data.error) {
        openMovieModal(data);
      }
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      searchInput.value = '';
      currentQuery = '';

      loadMovies(tab.dataset.category);
    });
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      searchMovies(query);
    }
  });

  loadMovies('popular');
});
