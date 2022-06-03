const { default: axios } = require('axios');

export default class ImgService {
  constructor() {
    this.query = '';
    this.page = 1;
  }

  fetchImgs() {
    const KEY = '27771322-fd7e9c7da20f52548d5baeacc';
    const URL = `https://pixabay.com/api/?key=${KEY}&q=${this.query}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=40`;

    return axios
      .get(URL)
      .then(({ data }) => {
        this.increment();
        return data;
      })
      .catch(error => console.log(error));
  }

  reset() {
    this.page = 1;
  }

  increment() {
    this.page += 1;
  }

  get searchQuery() {
    return this.query;
  }

  set searchQuery(newQuery) {
    this.query = newQuery;
  }
}
