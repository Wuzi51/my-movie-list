const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMoves = []
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')
const changeButton = document.querySelector('#change-button')


function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `})
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class="card list-group list-group-flush mb-3">`
    data.forEach(item => {
      rawHTML += `
      <li class="list-group-item card-body d-flex justify-content-between">
        <h5>${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
       </div>
      </li>
    `
    })
    rawHTML += `</ul>`
    dataPanel.innerHTML = rawHTML
  }
    }

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesPage(page) {
  const data = filteredMoves.length ? filteredMoves : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalData = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(res => {
    const data = res.data.results
    modalTitle.textContent = data.title
    modalData.textContent = `Releasr date: ${data.release_date}`
    modalDescription.textContent = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid">`
  })
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
 if (event.target.tagName !== 'A') return
    currentPage = Number(event.target.dataset.page)
    renderMovieList(getMoviesPage(currentPage))
})


function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 使用data-mode切換顯示模式
function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}

// 切換監聽事件
changeButton.addEventListener('click', function onButtonClicked(event) {
  if (event.target.matches('.fa-th')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesPage(currentPage)) 
  } else if (event.target.matches('.fa-bars')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesPage(currentPage)) 
  }
})


const searchInput = document.querySelector('#search-input')

searchForm.addEventListener('submit', function onSearchFormSubnit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMoves = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  // if(!keyword.length) {
  //   return alert('請輸入關鍵字!')
  // }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMoves.push(movie)
  //   }
  // }
    if (filteredMoves.length === 0) {
      return alert('找不到這部電影:' + keyword)
    }
  currentPage = 1
  renderPaginator(filteredMoves.length)
  renderMovieList(getMoviesPage(currentPage))
})

axios.get(INDEX_URL).then((res) => {
  console.log(res.data.results)
  console.log(res)
  movies.push(...res.data.results)
  console.log(movies)
  renderPaginator(movies.length)
  renderMovieList(getMoviesPage(currentPage))
})
  .catch(err =>  {
    console.log(err);
  })