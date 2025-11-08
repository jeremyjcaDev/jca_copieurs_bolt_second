<template>
  <div class="modal-copieur-overlay" @click="$emit('close')">
    <div class="modal-copieur" @click.stop>
      <div class="modal-copieur-header">
        <h3>Ajouter un produit à "{{ option.nom_option }}"</h3>
        <button @click="$emit('close')" class="btn-icon">
          <x-icon class="icon-small" />
        </button>
      </div>

      <div class="modal-copieur-content">
        <div class="search-box">
          <search-icon class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom ou référence..."
            class="search-input"
            @input="performSearch"
          />
        </div>

        <div class="products-results">
          <div
            v-for="product in filteredProducts"
            :key="product.id + '-' + (product.id_product_attribute || '0')"
            class="product-result"
          >
            <div class="product-image">
              <img
                :src="product.image || 'https://via.placeholder.com/100'"
                :alt="product.name"
                class="product-img"
              />
            </div>

            <div class="product-details">
              <h4 class="product-name">{{ product.name }}</h4>
            </div>

            <button
              @click="selectProduct(product)"
              :disabled="isProductInOption(product)"
              class="btn-select"
            >
              <plus-icon
                v-if="!isProductInOption(product)"
                class="icon-small"
              />
              <check-icon v-else class="icon-small" />
              {{ isProductInOption(product) ? "Ajouté" : "Ajouter" }}
            </button>
          </div>

          <div v-if="filteredProducts.length === 0" class="no-results">
            <package-icon class="empty-icon" />
            <p>Aucun produit trouvé</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import {
  SearchIcon,
  XIcon,
  PlusIcon,
  CheckIcon,
  PackageIcon,
} from "vue-feather-icons";

export default Vue.extend({
  name: "ProductSearch",
  components: {
    SearchIcon,
    XIcon,
    PlusIcon,
    CheckIcon,
    PackageIcon,
  },
  props: {
    option: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: "",
      searchResults: [],
    };
  },
  computed: {
    ...mapState(["productCatalog"]),

    filteredProducts() {
      return this.searchResults;
    },
  },
  methods: {
    performSearch() {
      if (this.searchQuery.length < 3) {
        this.searchResults = []; // Réinitialiser les résultats si la recherche est trop courte
        return;
      }
      this.$store
        .dispatch("searchProducts", {
          query: this.searchQuery, // Passez la valeur de recherche ici
          limit: 50, // Limite par défaut
          category: null, // Catégorie par défaut
        })
        .then((results) => {
          this.searchResults = results.data; // Mettez à jour les résultats après la résolution de la Promise
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche des produits :", error);
        });
    },

    isProductInOption(product) {
      if (!this.option.id_produit_selectionne) return false;
      if (!this.option.id_produit_selectionne[product.id]) return false;
      const attr =
        product.id_product_attribute == null ? 0 : product.id_product_attribute;
      return this.option.id_produit_selectionne[product.id].includes(attr);
    },

    selectProduct(product) {
      if (!this.isProductInOption(product)) {
        this.$emit("select", this.option, product);
      }
    },

    formatPrice(price) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    },
  },

  mounted() {
    this.performSearch();
  },
});
</script>

<style scoped>
.modal-copieur-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Fond semi-transparent */
  display: flex;
  align-items: center; /* Centre verticalement */
  justify-content: center; /* Centre horizontalement */
  z-index: 1000;
}

.modal-copieur {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Ajout d'une ombre */
}

.modal-copieur-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-copieur-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.modal-copieur-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #999;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.products-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.product-result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.2s;
}

.product-result:hover {
  background: white;
  border-color: #1976d2;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.product-reference {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px;
}

.product-category {
  font-size: 12px;
  color: #1976d2;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin-right: 16px;
}

.btn-select {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #1976d2;
  border-radius: 6px;
  background: white;
  color: #1976d2;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-select:hover:not(:disabled) {
  background: #1976d2;
  color: white;
}

.btn-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e0e0e0;
  border-color: #e0e0e0;
  color: #999;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #ccc;
  margin: 0 auto 16px;
}
</style>
