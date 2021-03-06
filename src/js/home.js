/*console.log('hola mundo!');
const noCambia = "Leonidas";

let cambia = "@LeonidasEsteban"

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre
}

const getUserAll = new Promise((ok, fail) => {
  setTimeout(() => {
    ok('mensaje a enviar all');
  }, 5000);
});

const getUser = new Promise((ok, fail) => {
  setTimeout(() => {
    ok('mensaje a enviar');
  }, 3000);
});*/

/*getUser
  .then((menssage) => console.log(menssage))
  .catch(() => console.log('algo va mal chamaco perro'))
*/

/*Promise.all([
  getUserAll,
  getUser
])
  .then((message) => console.log(message))
  .catch((message) => console.log(message))

$.ajax('https://randomuser.me/api/', {
  method: 'GET',
  success: function(data) {
    console.log(data);
  },
  error: function(error) {
    console.log(error);
  }
})*/

/*fetch('https://randomuser.me/api/')
  .then((response) => {
    return response.json()
  })
  .then((user) => {
    console.log('user', user.results[0])
  })
  .catch(() => console.log('algo va mal'))
*/
(async function load(){
  async function getData(url) {
    const response = await fetch(url)
    const data = await response.json()
    if(data.data.movie_count > 0){
      return data
    }
    throw new Error('No se encontró ningun resultado');
  }
  
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
  const $featuringContainer = document.getElementById('featuring');

  function setAttributes($element, attributes) {
    for (const key in attributes) {
      $element.setAttribute(key, attributes[key])
    }
  }

  const BASE_API = 'https://yts.am/api/v2/';

  function featuredTemplate(movie) {
    return(
     `<div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${movie.title}</p>
        </div>
      </div>`
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active')
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50
    })
    $featuringContainer.append($loader);

    const data = new FormData($form);
    try {
      const {
        data: {
          movies
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
      const HTMLString = featuredTemplate(movies[0]);
      $featuringContainer.innerHTML = HTMLString;
      
    } catch (error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  });
  
  function videoItemTemplate(movie, category) {
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    );
  }
  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];    
  }

  function addEventClick($element) {
    $element.addEventListener('click', () => {
      showModal($element);
    })
  }
  function renderMovieList(list, $container, category) {
    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(movieElement);
    })
  }
  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList= window.localStorage.getItem(listName);
    if(cacheList){
      return JSON.parse(cacheList);
    }else{
      const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`)
      window.localStorage.setItem(listName, JSON.stringify(data))
      return data
    }
  }

  const actionList = await cacheExist('action');
  const $actionContainer = document.getElementById('action');
  renderMovieList(actionList, $actionContainer, 'action');
  
  const dramaList = await cacheExist('drama');
  const $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');
  
  const animationList = await cacheExist('animation');
  const $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, 'animation');
  
  const $modal = document.getElementById('modal');
  const $hideModal = document.getElementById('hide-modal') 
  const $overlay = document.getElementById('overlay');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');

  function findById(list, id) {
    return list.find((movie) => movie.id === parseInt(id, 10))
  }
  function findMovie(id, category) {
    switch (category) {
      case 'action': {
        return findById(actionList, id);
      }
      case 'drama' : {
        return findById(dramaList, id);
      }
      default: {
        return findById(animationList, id);
      }
    
    }
  }

  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = "modalIn .8s forwards";
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image); 
    $modalDescription.textContent = data.description_full;
  }

  $hideModal.addEventListener('click', hideModal);
  
  function hideModal(){
    $overlay.classList.remove('active');
    $modal.style.animation = "modalOut .8s forwards"
  }

  async function getDataFriends(url) {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }

  function friendTemplate(friend) {
    return(
      `<li class="playlistFriends-item">
        <img src="${friend.picture.medium}" alt="${friend.name.first} Picture" />
        <span>
        ${friend.name.title}. ${friend.name.first} ${friend.name.last}
        </span>
      </li>`
    )
  }
  
  function renderFriendList(list, $container) {
    $container.children[0].remove();
    list.forEach((friend) => {
      const HTMLString = friendTemplate(friend);
      const friendElement = createTemplate(HTMLString);
      $container.append(friendElement);
      const image = friendElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(friendElement);
    })
  }

  async function cacheExistFriends(){
    const localData = window.localStorage.getItem('friendList');
    if(localData){
      return JSON.parse(localData);
    }else{
      const { results: friends } = await getDataFriends(friendsUrl);
      window.localStorage.setItem('friendList', JSON.stringify(friends));
      return friends;
    }
  }
  const friendsUrl = "https://randomuser.me/api/?results=10&?nat=us?inc=name,picture"
  const $playlistFriendsContainer = document.getElementById('playlistFriends');
  const friends = await cacheExistFriends(friendsUrl);
  renderFriendList(friends, $playlistFriendsContainer);
  
})()



