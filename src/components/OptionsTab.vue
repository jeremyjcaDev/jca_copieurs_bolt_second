<template>
  <div class="options-tab">
    <div class="tab-header">
      <h2 class="tab-title">Options et Produits</h2>
      <button @click="addOption" class="btn btn-primary">
        <plus-icon class="icon" />
        Ajouter une option
      </button>
    </div>

    <div class="options-list">
      <draggable
        v-model="copieur.options"
        :animation="200"
        class="drag-container"
        handle=".drag-handle"
        @change="updateOrder"
      >
        <div
          v-for="(option, index) in copieur.options"
          :key="`option-${option.ordre}`"
          class="option-card"
        >
          <div class="option-header">
            <div class="drag-handle">
              <move-icon class="icon-small" />
            </div>
            <div class="option-info">
              <h3 class="option-name">
                {{ option.nom_option || `Option ${index + 1}` }}
              </h3>
              <p class="option-title">{{ option.titre_option }}</p>
            </div>
            <div class="option-actions">
              <button @click="toggleOptionExpanded(index)" class="btn-icon">
                <chevron-down-icon
                  :class="['icon-small', { expanded: expandedOptions[index] }]"
                />
              </button>
              <button @click="removeOption(index)" class="btn-icon">
                <trash-2-icon class="icon-small" />
              </button>
            </div>
          </div>

          <div v-if="expandedOptions[index]" class="option-content">
            <div class="option-config">
              <div class="config-row">
                <div class="form-group">
                  <label>Nom de l'option</label>
                  <input
                    v-model="option.nom_option"
                    type="text"
                    placeholder="Ex: Copieur"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Titre affiché</label>
                  <input
                    v-model="option.titre_option"
                    type="text"
                    placeholder="Ex: Choisissez votre copieur"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="config-row">
                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      v-model="option.affiche_aucun_produit"
                      type="checkbox"
                      :true-value="1"
                      :false-value="0"
                    />
                    <span class="checkbox-text"
                      >Afficher l'option "Aucun produit"</span
                    >
                  </label>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      v-model="option.choix_multiple"
                      type="checkbox"
                      :true-value="1"
                      :false-value="0"
                    />
                    <span class="checkbox-text"
                      >Permettre la sélection multiple</span
                    >
                  </label>
                </div>
              </div>
            </div>

            <div class="products-section">
              <div class="products-header">
                <h4>Produits de cette option</h4>
                <button
                  @click="showProductSearch = option"
                  class="btn btn-secondary btn-small"
                >
                  <plus-icon class="icon-small" />
                  Ajouter un produit
                </button>
              </div>

              <div class="products-list">
                <draggable
                  v-model="copieur.produits"
                  :group="{ name: 'products', pull: true, put: true }"
                  :animation="200"
                  class="drag-container"
                  handle=".product-drag-handle"
                  @change="updateProductOrder"
                >
                  <div
                    v-for="product in getOptionProducts(option.id)"
                    :key="product.id_product_copieur"
                    class="product-item"
                  >
                    <div class="product-drag-handle">
                      <move-icon class="icon-small" />
                    </div>

                    <div class="product-image">
                      <img
                        :src="
                          product.image_url ||
                          'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=100'
                        "
                        :alt="product.name"
                        class="product-img"
                      />
                    </div>

                    <div class="product-info">
                      <h5 class="product-name">
                        {{ product.name }}
                      </h5>
                      <p class="product-mobile">
                        {{ product.reference }}
                      </p>
                      <div class="product-price">
                        {{
                          formatPrice(
                            (product.price || 0) + product.variation_price
                          )
                        }}
                        <span
                          v-if="product.variation_price !== 0"
                          class="price-variation"
                        >
                          ({{ product.variation_price > 0 ? "+" : ""
                          }}{{ formatPrice(product.variation_price) }})
                        </span>
                      </div>
                    </div>

                    <div class="product-controls">
                      <div
                        v-if="product.case_choix_qte"
                        class="quantity-controls"
                      >
                        <label>Quantité min/max</label>
                        <div class="quantity-inputs">
                          <input
                            v-model.number="product.qte_min"
                            type="number"
                            min="0"
                            class="quantity-input"
                          />
                          <span>à</span>
                          <input
                            v-model.number="product.qte_max"
                            type="number"
                            min="1"
                            class="quantity-input"
                          />
                        </div>
                      </div>

                      <div class="product-toggles">
                        <label class="toggle-label">
                          <input
                            v-model="product.achat_obligatoire"
                            type="checkbox"
                            :true-value="1"
                            :false-value="0"
                          />
                          <span>Achat obligatoire</span>
                        </label>
                        <label class="toggle-label">
                          <input
                            v-model="product.case_choix_qte"
                            type="checkbox"
                            :true-value="1"
                            :false-value="0"
                          />
                          <span>Choix de quantité</span>
                        </label>
                      </div>
                    </div>

                    <button
                      @click="removeProduct(product.id_product_copieur)"
                      class="btn-remove"
                    >
                      <trash-2-icon class="icon-small" />
                    </button>
                  </div>
                </draggable>

                <div
                  v-if="getOptionProducts(option.id).length === 0"
                  class="empty-products"
                >
                  <package-icon class="empty-icon" />
                  <p>Aucun produit dans cette option</p>
                  <button
                    @click="showProductSearch = option"
                    class="btn btn-primary btn-small"
                  >
                    Ajouter le premier produit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </draggable>

      <div v-if="copieur.options.length === 0" class="empty-options">
        <settings-icon class="empty-icon" />
        <h3>Aucune option configurée</h3>
        <p>
          Créez votre première option pour commencer à configurer le copieur
        </p>
        <button @click="addOption" class="btn btn-primary">
          <plus-icon class="icon" />
          Créer la première option
        </button>
      </div>
    </div>

    <!-- Product Search Modal -->
    <product-search
      v-if="showProductSearch"
      :option="showProductSearch"
      @close="showProductSearch = null"
      @select="addProductToOption"
    />
  </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import draggable from "vuedraggable";
import {
  PlusIcon,
  MoveIcon,
  ChevronDownIcon,
  Trash2Icon,
  SettingsIcon,
  PackageIcon,
} from "vue-feather-icons";
import ProductSearch from "./ProductSearch.vue";

export default Vue.extend({
  name: "OptionsTab",
  components: {
    draggable,
    PlusIcon,
    MoveIcon,
    ChevronDownIcon,
    Trash2Icon,
    SettingsIcon,
    PackageIcon,
    ProductSearch,
  },
  data() {
    return {
      showProductSearch: null,
      expandedOptions: {},
      tempIdOptionCounter: 1, // Compteur pour les IDs temporaires options
      tempIdProductCounter: 1, // Compteur pour les IDs temporaires produits
    };
  },
  computed: {
    ...mapState(["currentCopieur"]),

    copieur() {
      return this.currentCopieur?.Copieur || { options: [], produits: [] };
    },
  },
  methods: {
    async addOption() {
      const newOption = {
        id: `temp_${this.tempIdOptionCounter++}`, // ID temporaire basé sur le compteur
        ordre: this.copieur.options.length + 1,
        nom_option: "",
        titre_option: "",
        affiche_aucun_produit: 0,
        exclusion_si_affich_est_1: [],
        obligation_si_affich_est_1: [],
        choix_multiple: 0,
        id_produit_selectionne: [],
      };
      // Ajouter l'option dans le store Vuex
      this.$store.commit("ADD_OPTION", newOption);

      try {
        // Sauvegarder le copieur et récupérer les données mises à jour
        const response = await this.$store.dispatch("saveCopieur");

        if (response && response.success && response.data) {
          // Remplacer les données locales par celles du backend
          this.$store.commit("SET_CURRENT_COPIEUR", response.data);
        } else {
          console.error("La sauvegarde du copieur a échoué.");
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du copieur :", error);
      }

      // this.copieur.options.push(newOption);
      this.$set(this.expandedOptions, this.copieur.options.length - 1, true);
    },

    removeOption(index) {
      const option = this.copieur.options[index];
      if (
        confirm(
          `Supprimer l'option "${
            option.nom_option || "Sans nom"
          }" et tous ses produits ?`
        )
      ) {
        this.$store.dispatch("deleteOption", option.id);

        // Remove products from this option
        this.copieur.produits = this.copieur.produits.filter(
          (p) => p.id_copieur_option !== option.id
        );
        // Remove the option
        this.copieur.options.splice(index, 1);
        // Update order
        this.updateOrder();
      }
    },

    updateOrder() {
      this.copieur.options.forEach((option, index) => {
        option.ordre = index + 1;
      });
    },
    updateProductOrder() {
      // Mettre à jour l'ordre des produits dans l'option correspondante
      this.copieur.options.forEach((option) => {
        const optionProducts = this.getOptionProducts(option.id);
        optionProducts.forEach((product, index) => {
          product.ordre = index + 1;
        });
      });
    },

    toggleOptionExpanded(index) {
      this.$set(this.expandedOptions, index, !this.expandedOptions[index]);
    },

    getOptionProducts(id_copieur_option) {
      return this.copieur.produits.filter(
        (p) => p.id_copieur_option === id_copieur_option
      );
    },

    addProductToOption(option, product) {
      // Effectuer une requête pour récupérer les informations détaillées du produit
      this.$store
        .dispatch("fetchProductDetails", {
          productId: product.id,
          productAttributeId: product.id_product_attribute,
        })
        .then((response) => {
          const details = response; // Accédez à la clé `data` de la réponse

          const newProduct = {
            id_product_copieur: `temp_${this.tempIdProductCounter++}`, // ID temporaire basé sur le compteur
            id_product_prestashop: product.id,
            id_product_attribute_prestashop: product.id_product_attribute || 0,
            ordre: this.getOptionProducts(option.id).length + 1,
            dans_quel_option: option.nom_option,
            id_copieur_option: option.id,
            name: product.name,
            variation_price: 0,
            achat_obligatoire: 0,
            case_choix_qte: 0,
            qte_min: 1,
            qte_max: 1,
            accessoire_exclu: [],
            accessoire_obligatoire: [],
            price: details.price, // Ajouter le prix récupéré
            reference: details.reference, // Ajouter la référence récupérée
            image_url: product.image,
          };
          this.copieur.produits.push(newProduct);
          if (!option.id_produit_selectionne)
            option.id_produit_selectionne = {};
          const attr =
            product.id_product_attribute == null
              ? 0
              : product.id_product_attribute;
          if (!option.id_produit_selectionne[product.id]) {
            this.$set(option.id_produit_selectionne, product.id, []);
          }
          if (!option.id_produit_selectionne[product.id].includes(attr)) {
            option.id_produit_selectionne[product.id].push(attr);
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des détails du produit :",
            error
          );
        });
    },

    removeProduct(productIdCopieur) {
      // Trouver le produit correspondant dans copieur.produits
      const productToRemove = this.copieur.produits.find(
        (p) => p.id_product_copieur === productIdCopieur
      );

      if (!productToRemove) {
        console.warn(`Produit avec ID ${productIdCopieur} non trouvé.`);
        return;
      }

      // Supprimer le produit de la liste des produits
      // this.copieur.produits = this.copieur.produits.filter(
      //   (p) => p.id_product_copieur !== productIdCopieur
      // );

      // Supprimer l'id_product_prestashop correspondant des options
      // const productIdPrestashop = productToRemove.id_product_prestashop;
      // this.copieur.options.forEach((option) => {
      //   option.id_produit_selectionne = option.id_produit_selectionne.filter(
      //     (id) => id !== productIdPrestashop
      //   );
      // });

      // Appeler l'action Vuex pour supprimer le produit côté serveur
      this.$store.dispatch("deleteProduct", productIdCopieur);
    },

    formatPrice(price) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    },
  },

  mounted() {
    // Initialize expanded state for existing options
    this.copieur.options.forEach((_, index) => {
      if (this.expandedOptions[index] === undefined) {
        this.$set(this.expandedOptions, index, index === 0);
      }
    });
  },
});
</script>

<style scoped>
.options-tab {
  max-width: 1200px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tab-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-secondary {
  background: white;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}

.icon {
  width: 18px;
  height: 18px;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.drag-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.option-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.option-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.drag-handle {
  cursor: grab;
  padding: 8px;
  margin-right: 12px;
  color: #999;
}

.drag-handle:active {
  cursor: grabbing;
}

.option-info {
  flex: 1;
}

.option-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.option-title {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.option-actions {
  display: flex;
  gap: 8px;
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
  background: #e0e0e0;
}

.btn-danger:hover {
  background: #ffebee;
  color: #d32f2f;
}

.expanded {
  transform: rotate(180deg);
}

.option-content {
  padding: 20px;
}

.option-config {
  margin-bottom: 24px;
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-text {
  color: #333;
}

.products-section {
  border-top: 1px solid #eee;
  padding-top: 24px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.products-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.product-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-drag-handle {
  cursor: grab;
  color: #999;
}

.product-drag-handle:active {
  cursor: grabbing;
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

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-mobile {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px;
}

.product-price {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
}

.price-variation {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.product-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.quantity-controls label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.quantity-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.product-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-label {
  display: flex !important;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.btn-remove {
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ffebee;
}

.empty-products,
.empty-options {
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

.empty-options h3 {
  margin: 0 0 8px;
}

.empty-options p,
.empty-products p {
  margin: 0 0 24px;
}

@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }

  .product-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .product-controls {
    min-width: auto;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
