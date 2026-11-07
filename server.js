require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  return passRegex.test(password);
}

function isOldEnough(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 13;
}

app.get('/api/movies/trending', async (req, res) => {
  try {
    const response = await fetch(
      `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=es-MX`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener películas en tendencia' });
  }
});

app.get('/api/movies/top_rated', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const response = await fetch(
      `${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}&language=es-MX&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener películas mejor valoradas' });
  }
});

app.get('/api/movies/upcoming', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const response = await fetch(
      `${TMDB_BASE}/movie/upcoming?api_key=${TMDB_API_KEY}&language=es-MX&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener próximos estrenos' });
  }
});

app.get('/api/movies/popular', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const response = await fetch(
      `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=es-MX&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener películas populares' });
  }
});

app.get('/api/movies/now_playing', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const response = await fetch(
      `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&language=es-MX&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cartelera' });
  }
});

app.get('/api/movies/search', async (req, res) => {
  try {
    const query = sanitize(req.query.q || '');
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'La búsqueda debe tener al menos 2 caracteres' });
    }
    const page = parseInt(req.query.page) || 1;
    const response = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar películas' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'ID de película inválido' });
    }
    const response = await fetch(
      `${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-MX`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalle de película' });
  }
});

app.post('/api/register', (req, res) => {
  const { fullname, email, password, birthdate, genre_pref, terms, website } = req.body;

  if (website) {
    return res.status(200).json({ success: true });
  }

  const errors = [];

  if (!fullname || sanitize(fullname).trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('El correo electrónico no es válido');
  }

  if (!password || !isValidPassword(password)) {
    errors.push('La contraseña no cumple los requisitos de seguridad');
  }

  if (!birthdate || !isOldEnough(birthdate)) {
    errors.push('Debes tener al menos 13 años para registrarte');
  }

  if (!genre_pref) {
    errors.push('Selecciona un género favorito');
  }

  if (!terms) {
    errors.push('Debes aceptar los términos y condiciones');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  res.json({
    success: true,
    message: 'Registro exitoso. Tu cuenta ha sido creada.'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/registro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/catalogo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'catalogo.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor CineVerse corriendo en http://localhost:${PORT}`);
});
