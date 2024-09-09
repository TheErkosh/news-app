import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state() {
    return {
      searchQuery: '',
      selectedCategory: '',
      currentPage: 1,
      articlesPerPage: 6,
      loading: true,
      isModalOpen: false,
      currentArticle: {}
    };
  },
  getters: {
    filteredArticles(state) {
      const query = state.searchQuery.toLowerCase();
      return state.articles.filter(article => {
        const title = article.title?.toLowerCase() || '';
        const description = article.description?.toLowerCase() || '';
        const category = article.category?.toLowerCase() || '';

        const matchesSearchQuery = !state.searchQuery || title.includes(query) || description.includes(query);
        const matchesCategory = !state.selectedCategory || category === state.selectedCategory.toLowerCase();

        return matchesSearchQuery && matchesCategory;
      });
    },
    paginatedArticles(state, getters) {
      const start = (state.currentPage - 1) * state.articlesPerPage;
      return getters.filteredArticles.slice(start, start + state.articlesPerPage);
    },
    totalPages(state, getters) {
      return Math.ceil(getters.filteredArticles.length / state.articlesPerPage);
    },
    totalResults(state, getters) {
      return getters.filteredArticles.length;
    }
  },
  mutations: {
    SET_ARTICLES(state, articles) {
      state.articles = articles;
    },
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query;
    },
    SET_CATEGORY(state, category) {
      state.selectedCategory = category;
    },
    SET_CURRENT_PAGE(state, page) {
      state.currentPage = page;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    OPEN_MODAL(state, article) {
      state.currentArticle = article;
      state.isModalOpen = true;
    },
    CLOSE_MODAL(state) {
      state.isModalOpen = false;
      state.currentArticle = {};
    }
  },
  actions: {
    async fetchNews({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await axios.get('/news.json');
        commit('SET_ARTICLES', response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
});
