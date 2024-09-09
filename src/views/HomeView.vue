<template>
    <div>
      <!-- Header -->
      <div class="p-5 bg-blue-100">
        <p class="text-center text-3xl font-bold text-blue-700">News App using Vue</p>
        <p class="text-center text-xl mt-2">
          Total News
          <span class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-600 text-white">{{ totalResults }}</span>
        </p>
      </div>
  
      <!-- Search and Filter -->
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col gap-y-4 md:flex-row md:gap-x-4 md:items-center">
          <!-- Search Input -->
          <div class="flex-grow">
            <input
              v-model="localSearchQuery"
              type="text"
              placeholder="Search news..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <!-- Filter Dropdown -->
          <div class="mt-4 md:mt-0">
            <select
              v-model="localSelectedCategory"
              class="w-full md:w-56 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select category</option>
              <option value="">All</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <!-- Submit Button -->
          <div class="mt-4 md:mt-0">
            <button
              @click="applyFilters"
              class="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
            >
              Submit
              <svg v-if="loading" class="absolute inset-0 w-6 h-6 mx-auto my-auto text-blue-200 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></circle>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Loading Spinner -->
      <div v-if="showSpinner" class="flex justify-center items-center py-6">
        <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></circle>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </div>
  
      <!-- News Cards -->
      <div class="container mx-auto px-4 py-6">
        <div v-if="paginatedArticles.length === 0" class="text-center text-2xl text-gray-500">News not found.</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="article in paginatedArticles" :key="article.url" class="bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Image -->
            <img
              :src="article.urlToImage"
              :alt="article.title"
              class="w-full h-48 object-cover"
            />
            <!-- Card Content -->
            <div class="p-4">
              <p class="text-gray-500 text-sm mb-2">
                By {{ article.author || 'Unknown' }} | {{ new Date(article.publishedAt).toLocaleDateString() }} |
                <a :href="article.source.url" target="_blank" class="text-blue-500 hover:underline">{{ article.source.name }}</a>
              </p>
              <h3 class="text-xl font-semibold mb-2">{{ article.title }}</h3>
              <!-- Display trimmed content -->
              <p class="text-gray-600 mb-4">{{ article.content.length > 90 ? article.content.substring(0, 90) + '...' : article.content }}</p>
              <!-- Button -->
              <button
                @click="openModal(article)"
                class="w-full py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
  
        <!-- Pagination -->
        <div class="flex justify-between items-center py-4">
          <button 
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <span class="text-lg font-medium">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next
          </button>
        </div>
      </div>
  
      <!-- Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 md:mx-auto overflow-hidden">
          <!-- Modal Header -->
          <div class="p-4 bg-blue-600 text-white flex justify-between items-center">
            <h3 class="text-xl font-bold">{{ currentArticle.title }}</h3>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto max-h-[75vh]">
            <img :src="currentArticle.urlToImage" :alt="currentArticle.title" class="w-full h-64 object-cover mb-4 rounded-lg shadow-sm"/>
            <p class="text-gray-500 mb-2">
              <span class="font-semibold">By:</span> {{ currentArticle.author || 'Unknown' }}
            </p>
            <p class="text-gray-500 mb-2">
              <span class="font-semibold">Published on:</span> {{ new Date(currentArticle.publishedAt).toLocaleDateString() }}
            </p>
            <p class="text-blue-600 hover:underline mb-4">
              <a :href="currentArticle.url" target="_blank">Read full article</a>
            </p>
            <p class="text-gray-700 leading-relaxed mb-4">{{ currentArticle.description }}</p>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p v-for="(paragraph, index) in splitContent(currentArticle.content)" :key="index">{{ paragraph }}</p>
            </div>
          </div>
          <!-- Modal Footer -->
          <div class="p-4 bg-gray-100 flex justify-end">
            <button @click="closeModal" class="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  data() {
    return {
      localSearchQuery: '',
      localSelectedCategory: '',
      categories: ['Business', 'Technology', 'Entertainment', 'Health', 'Sports'], // Static categories
      showSpinner: false, // Control spinner visibility
    };
  },
  computed: {
    ...mapState(['searchQuery', 'selectedCategory', 'currentPage', 'loading', 'isModalOpen', 'currentArticle']),
    ...mapGetters(['filteredArticles', 'paginatedArticles', 'totalPages', 'totalResults']),
  },
  methods: {
    ...mapMutations(['SET_SEARCH_QUERY', 'SET_CATEGORY', 'SET_CURRENT_PAGE', 'OPEN_MODAL', 'CLOSE_MODAL']),
    ...mapActions(['fetchNews']),
    async applyFilters() {
      this.showSpinner = true;
      setTimeout(async () => {
        this.SET_SEARCH_QUERY(this.localSearchQuery.trim());
        this.SET_CATEGORY(this.localSelectedCategory);
        this.SET_CURRENT_PAGE(1); 
        await this.fetchNews();
        this.showSpinner = false;
      }, 300); // Adjust delay as needed 300ms
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.SET_CURRENT_PAGE(this.currentPage + 1);
        this.fetchNews();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.SET_CURRENT_PAGE(this.currentPage - 1);
        this.fetchNews();
      }
    },
    openModal(article) {
      this.OPEN_MODAL(article);
    },
    closeModal() {
      this.CLOSE_MODAL();
    },
    splitContent(content) {
      return content ? content.split('\n').filter(paragraph => paragraph.trim() !== '') : [];
    }
  },
  watch: {
    searchQuery(newVal) {
      this.localSearchQuery = newVal;
    },
    selectedCategory(newVal) {
      this.localSelectedCategory = newVal;
    }
  },
  created() {
    this.fetchNews();
  }
};

  </script>
  
  <style scoped>
  /* spinner animation */
  .custom-spinner {
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  