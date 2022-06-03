import './sass/main.scss';
import { Notify } from 'notiflix';
import ImgService from './js/img-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const galleryItem = document.querySelector('.gallery');
const load = document.querySelector('.loader');

form.addEventListener('submit', onSearch);

let query = '';

const imgService = new ImgService();

function handleObserver(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      fetchAndRender();
    }
  });
}

const observer = new IntersectionObserver(handleObserver, {
  threshold: 0.5,
});

let gallery = new SimpleLightbox('.photo-card a', {
  showCounter: false,
  enableKeyboard: true,
});
function showLoader(ref) {
  ref.classList.remove('hidden');
}

function hideLoader(ref) {
  ref.classList.add('hidden');
}
function onSearch(e) {
  e.preventDefault();
  hideLoader(load);

  const value = e.currentTarget.elements.searchQuery.value.trim();

  if (!value) {
    Notify.failure('There is nothing to find', {
      clickToClose: true,
    });
    return;
  }

  query = value;
  clearGalleryMarkup();

  imgService.reset();

  fetchAndRender().then(result => {
    if (result) {
      Notify.success(`Hooray! We found ${result} images.`, {
        clickToClose: true,
        timeout: 2000,
      });
    }

    form.reset();
  });
}

async function fetchAndRender() {
  try {
    imgService.searchQuery = query;
    const response = await imgService.fetchImgs(query);
    gallery.refresh();

    if (response.total === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          clickToClose: true,
        }
      );

      clearGalleryMarkup();
    } else {
      renderGallery(response.hits);
      showLoader(load);
      return response.totalHits;
    }
  } catch (error) {
    hideLoader(load);
    Notify.info("We're sorry, but you've reached the end of search results.", {
      clickToClose: true,
      timeout: 5000,
    });
  }
}

function renderGallery(hits) {
  const card = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
          <a class="photo-card__item" href="${largeImageURL}">
            <img class="photo-card__image" src="${webformatURL}" alt="${tags} loading="lazy"/></a>
              <div class="info">
                <p class="info-item">
                  <b>Likes</b><br>
                  ${likes}
                </p>
                <p class="info-item">
                  <b>Views</b><br>
                  ${views}
                </p>
                <p class="info-item">
                  <b>Comments</b><br>
                  ${comments}
                </p>
                <p class="info-item">
                  <b>Downloads</b><br>
                  ${downloads}
                </p>
              </div>
        </div>`
    )
    .join('');

  galleryItem.insertAdjacentHTML('beforeend', card);

  if (load) {
    observer.observe(load);
    gallery.refresh();
  }
}

function clearGalleryMarkup() {
  galleryItem.innerHTML = '';
}
