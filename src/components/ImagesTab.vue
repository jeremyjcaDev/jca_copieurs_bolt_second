<template>
  <div class="images-tab">
    <div class="tab-header">
      <h2 class="tab-title">Mapping des Images</h2>
      <div class="header-actions">
        <button @click="generateAutoConfigurations" class="btn btn-secondary">
          <zap-icon class="icon" />
          Générer toutes les configurations ({{
            calculatePossibleConfigurations()
          }})
        </button>
        <button @click="addImageMapping" class="btn btn-primary">
          <plus-icon class="icon" />
          Ajouter une image
        </button>
      </div>
    </div>
    <div data-v-4e04dff7="" class="search-box">
      <svg data-v-4e04dff7="" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon feather feather-search"><circle data-v-4e04dff7="" cx="11" cy="11" r="8"></circle><line data-v-4e04dff7="" x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input data-v-4e04dff7="" v-model="productIdFilter" type="text" placeholder="Rechercher par id produit..." class="search-input">
    </div>
    <div v-if="showWarning" class="warning-banner">
      <alert-triangle-icon class="warning-icon" />
      <span>{{ warningMessage }}</span>
      <button @click="showWarning = false" class="btn-close-warning">
        <x-icon class="icon-small" />
      </button>
    </div>
    <div class="images-content">
      <div
   v-if="filteredConfigurations && filteredConfigurations.length > 0"
  class="images-grid"
      >
        <div
          v-for="configuration in filteredConfigurations"
          :key="configuration.id"
          class="image-card"
          :class="{ 'is-default': configuration.is_default }"
        >
          <div class="image-preview">
            <img
              v-if="configuration.url"
              :src="configuration.url"
              :alt="configuration.alt"
              class="preview-img"
            />
            <div v-else class="placeholder-img">
              <image-icon class="placeholder-icon" />
              <span>Aucune image</span>
            </div>

            <div class="image-overlay">
              <button
                @click="setAsDefault(configuration)"
                class="overlay-btn"
                :class="{ 'is-default': configuration.is_default }"
                title="Définir comme configuration par défaut"
              >
                <star-icon class="icon-small" />
              </button>
              <button @click="editImage(configuration)" class="overlay-btn">
                <edit-icon class="icon-small" />
              </button>
              <button
                @click="removeImage(configuration.id)"
                class="overlay-btn btn-danger"
              >
                <trash-2-icon class="icon-small" />
              </button>
            </div>
            <!-- Badge configuration par défaut -->
            <div v-if="configuration.is_default" class="default-badge">
              <star-icon class="badge-icon" />
              <span>Par défaut</span>
            </div>
          </div>

          <div class="image-info">
            <h4 class="image-name">
              {{ configuration.nom || "Image sans nom" }}
            </h4>
            <div class="config-summary">
              <div class="config-item">
                <div class="config-products">
                  <span
                    v-for="(product, idx) in configuration.products"
                    :key="`${configuration.id}-product-${product.id_product_copieur}-${idx}`"
                    class="product-tag"
                  >
                    {{ getProductName(product.id_product_copieur) }}
                    <span><em class="product-id text-sm">(id: {{ product.id_product_prestashop }})</em></span> 
                    <span v-if="product.quantity > 1" class="quantity-badge">{{
                      product.quantity
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-images">
        <image-icon class="empty-icon" />
        <h3>Aucune image mappée</h3>
        <p>
          Ajoutez des images pour vos différentes configurations de produits
        </p>
        <button @click="addImageMapping" class="btn btn-primary">
          <plus-icon class="icon" />
          Ajouter la première image
        </button>
      </div>
    </div>

    <!-- Image Upload/Edit Modal -->
    <div
      v-if="showImageModal"
      class="modal-copieur-overlay"
      @click="closeImageModal"
    >
      <div class="modal-copieur" @click.stop>
        <div class="modal-copieur-header">
          <h3>{{ editingImage ? "Modifier l'image" : "Ajouter une image" }}</h3>
          <button @click="closeImageModal" class="btn-icon">
            <x-icon class="icon-small" />
          </button>
        </div>

        <div class="modal-copieur-content">
          <div class="upload-section">
            <div
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
              class="upload-zone"
              :class="{ 'drag-over': isDragOver }"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="file-input"
              />

              <div v-if="currentConfigurationData.url" class="uploaded-preview">
                <img
                  :src="currentConfigurationData.url"
                  :alt="currentConfigurationData.alt"
                  class="uploaded-img"
                />
                <button
                  @click="$refs.fileInput.click()"
                  class="btn btn-secondary"
                  style="margin-top: 12px"
                >
                  Changer l'image
                </button>
              </div>

              <div v-else class="upload-placeholder">
                <upload-icon class="upload-icon" />
                <p>Glissez une image ici ou cliquez pour sélectionner</p>
                <button
                  @click="$refs.fileInput.click()"
                  class="btn btn-secondary"
                >
                  Choisir un fichier
                </button>
              </div>
            </div>
          </div>

          <div class="image-details">
            <div class="form-group">
              <label>Nom de l'image</label>
              <input
                v-model="currentConfigurationData.nom"
                type="text"
                placeholder="Ex: Configuration standard"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Texte alternatif</label>
              <input
                v-model="currentConfigurationData.alt"
                type="text"
                placeholder="Description de l'image"
                class="form-input"
              />
            </div>

            <div class="form-group default-config-group">
              <label class="checkbox-label">
                <input
                  v-model="currentConfigurationData.is_default"
                  type="checkbox"
                />
                <span class="checkbox-text">Configuration par défaut</span>
              </label>
              <p class="field-help">
                Cette configuration sera chargée automatiquement lors de
                l'ouverture du configurateur
              </p>
            </div>
          </div>

          <div class="configuration-section">
            <h4>Configuration associée</h4>
            <div class="config-builder">
              <div
                v-for="option in copieur.options"
                :key="`modal-copieur-option-${option.ordre}`"
                class="option-config"
              >
                <h5>{{ option.titre_option || option.nom_option }}</h5>

                <div class="products-selector">
                  <div
                    v-for="product in getOptionProducts(option.id)"
                    :key="`modal-copieur-product-${product.id_product_copieur}`"
                    class="product-selector"
                  >
                    <label class="product-label">
                      <input
                        v-if="option.choix_multiple"
                        type="checkbox"
                        :value="product.id_product_copieur"
                        v-model="selectedProducts[option.id]"
                        @change="updateConfiguration"
                      />
                      <input
                        v-else
                        type="radio"
                        :name="`option-${option.ordre}`"
                        :value="product.id_product_copieur"
                        v-model="selectedProducts[option.id]"
                        @change="updateConfiguration"
                      />
                      <span class="product-name">{{ product.name }}</span>
                    </label>

                    <div
                      v-if="
                        product.case_choix_qte &&
                        isProductSelected(option.id, product.id_product_copieur)
                      "
                      class="quantity-control"
                    >
                      <button
                        @click="decreaseQuantity(product.id_product_copieur)"
                        :disabled="
                          getProductQuantity(product.id_product_copieur) <=
                          product.qte_min
                        "
                        class="qty-btn"
                      >
                        <minus-icon class="icon-tiny" />
                      </button>
                      <span class="qty-display">{{
                        getProductQuantity(product.id_product_copieur)
                      }}</span>
                      <button
                        @click="increaseQuantity(product.id_product_copieur)"
                        :disabled="
                          getProductQuantity(product.id_product_copieur) >=
                          product.qte_max
                        "
                        class="qty-btn"
                      >
                        <plus-icon class="icon-tiny" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-copieur-footer">
          <button @click="closeImageModal" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="saveImageMapping" class="btn btn-primary">
            {{ editingImage ? "Modifier" : "Ajouter" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import {
  PlusIcon,
  ImageIcon,
  UploadIcon,
  EditIcon,
  Trash2Icon,
  XIcon,
  ZapIcon,
  AlertTriangleIcon,
  MinusIcon,
  StarIcon,
} from "vue-feather-icons";

export default Vue.extend({
  name: "ImagesTab",
  components: {
    PlusIcon,
    ImageIcon,
    UploadIcon,
    EditIcon,
    Trash2Icon,
    XIcon,
    ZapIcon,
    AlertTriangleIcon,
    MinusIcon,
    StarIcon,
  },
  data() {
    return {
      showImageModal: false,
      editingImage: null,
      isDragOver: false,
      showWarning: false,
      productIdFilter: '',
      warningMessage: "",
      currentConfigurationData: {
        id: null,
        url: "",
        nom: "",
        alt: "",
        is_default: false,
        products: [],
      },
      selectedProducts: {},
      productQuantities: {},
    };
  },
  computed: {
    ...mapState(["currentCopieur"]),

    copieur() {
      return (
        this.currentCopieur?.Copieur || {
          options: [],
          produits: [],
          configurations: [],
        }
      );
    },
filteredConfigurations() {
  if (!this.productIdFilter.trim()) {
    return this.copieur.configurations || [];
  }
  console.log("Filtering configurations with:", this.productIdFilter);
  // Récupère les ids à filtrer sous forme de chaînes
  const ids = this.productIdFilter
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);

  if (!ids.length) return this.copieur.configurations || [];

  return (this.copieur.configurations || []).filter(cfg => {
    // Récupère les ids des produits de la config sous forme de chaînes
    const configIds = cfg.products.map(prod => String(prod.id_product_prestashop));

    // Vérifie que tous les ids recherchés sont bien présents dans la config
    return ids.every(id => configIds.includes(id));
  });
}
  },
  methods: {
    addImageMapping() {
      this.editingImage = null;
      this.resetImageData();
      this.showImageModal = true;
    },

    editImage(image) {
      this.editingImage = image;
      this.currentConfigurationData = {
        id: image.id,
        url: image.url,
        nom: image.nom,
        alt: image.alt,
        is_default: image.is_default || false,
        products: [...image.products],
      };

      // Restore selected products and quantities
      this.selectedProducts = {};
      this.productQuantities = {};
      if (image.products && image.products.length > 0) {
        image.products.forEach((product) => {
          const productData = this.copieur.produits.find(
            (p) => p.id_product_copieur === product.id_product_copieur
          );
          if (productData) {
            const idOption = productData.id_copieur_option;
            if (
              this.copieur.options.find((o) => o.id === idOption)
                ?.choix_multiple
            ) {
              if (!this.selectedProducts[idOption]) {
                this.selectedProducts[idOption] = [];
              }
              this.selectedProducts[idOption].push(product.id_product_copieur);
            } else {
              this.selectedProducts[idOption] = product.id_product_copieur;
            }
            this.productQuantities[product.id_product_copieur] =
              product.quantity;
          }
        });
      }

      this.showImageModal = true;
    },

    removeImage(imageId) {
      if (confirm("Supprimer cette image et sa configuration ?")) {
        this.copieur.configurations = this.copieur.configurations.filter(
          (img) => img.id !== imageId
        );
      }
    },

    uploadImage(image) {
      this.editImage(image);
    },

    closeImageModal() {
      this.showImageModal = false;
      this.resetImageData();
    },

    resetImageData() {
      this.currentConfigurationData = {
        id: null,
        url: "",
        nom: "",
        alt: "",
        products: [],
      };
      this.selectedProducts = {};
      this.productQuantities = {};
    },

    handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    },

    handleFileSelect(e) {
      const files = e.target.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    },

    processFile(file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentConfigurationData.url = e.target.result;
          if (!this.currentConfigurationData.nom) {
            this.currentConfigurationData.nom = file.name.replace(
              /\.[^/.]+$/,
              ""
            );
          }
          if (!this.currentConfigurationData.alt) {
            this.currentConfigurationData.alt =
              this.currentConfigurationData.nom;
          }
        };
        reader.readAsDataURL(file);
      }
    },
    setAsDefault(configuration) {
      if (
        confirm("Définir cette configuration comme configuration par défaut ?")
      ) {
        this.copieur.configurations.forEach((cfg) => {
          cfg.is_default = false;
        });
        configuration.is_default = true;
        this.showWarningMessage("Configuration définie comme par défaut.");
      }
    },
    updateConfiguration() {
      const products = [];
      Object.keys(this.selectedProducts).forEach((idOption) => {
        const selection = this.selectedProducts[idOption];

        const option = this.copieur.options.find(
          (o) => o.id === Number(idOption)
        );
        if (option?.choix_multiple && Array.isArray(selection)) {
          selection.forEach((productId) => {
            const quantity = this.productQuantities[productId] || 1;
            products.push({
              id_copieur_option: Number(idOption),
              id_product_copieur: productId,
              quantity,
            });
          });
        } else if (selection) {
          const quantity = this.productQuantities[selection] || 1;
          products.push({
            id_copieur_option: Number(idOption),
            id_product_copieur: selection,
            quantity,
          });
        }
      });
      this.currentConfigurationData.products = products;
    },

    isProductSelected(id, productId) {
      const selection = this.selectedProducts[id];
      if (Array.isArray(selection)) {
        return selection.includes(productId);
      }
      return selection === productId;
    },

    getProductQuantity(productId) {
      return this.productQuantities[productId] || 1;
    },

    increaseQuantity(productId) {
      const product = this.copieur.produits.find(
        (p) => p.id_product_copieur === productId
      );
      const current = this.getProductQuantity(productId);
      if (current < product.qte_max) {
        Vue.set(this.productQuantities, productId, current + 1);
        this.updateConfiguration();
      }
    },

    decreaseQuantity(productId) {
      const product = this.copieur.produits.find(
        (p) => p.id_product_copieur === productId
      );
      const current = this.getProductQuantity(productId);
      if (current > product.qte_min) {
        Vue.set(this.productQuantities, productId, current - 1);
        this.updateConfiguration();
      }
    },

    saveImageMapping() {
      if (this.currentConfigurationData.products.length === 0) {
        this.showWarningMessage(
          "Veuillez sélectionner au moins un produit pour cette configuration"
        );
        return;
      }
      // Check for duplicate configuration
      const configSignature = this.getConfigurationSignature({
        products: this.currentConfigurationData.products,
      });

      const existingImage = this.copieur.configurations.find(
        (img) =>
          img.id !== this.currentConfigurationData.id &&
          this.getConfigurationSignature({ products: img.products }) ===
            configSignature
      );

      if (existingImage) {
        this.showWarningMessage(
          `Cette configuration existe déjà pour l'image "${existingImage.name}"`
        );
        return;
      }

      if (this.editingImage) {
        // Update existing image
        const index = this.copieur.configurations.findIndex(
          (img) => img.id === this.editingImage.id
        );
        if (index !== -1) {
          Vue.set(this.copieur.configurations, index, {
            ...this.currentConfigurationData,
          });
        }
      } else {
        // Add new image
        const newImage = {
          ...this.currentConfigurationData,
          id: `temp_${Date.now()}_${Math.random()}`,
        };
        this.copieur.configurations.push(newImage);
      }

      this.closeImageModal();
    },

    getConfigurationSignature(config) {
      // Robust signature: always use id_product_copieur and quantity, fallback to 1 if missing
      if (!config || !Array.isArray(config.products)) {
        console.error(
          "Invalid configuration passed to getConfigurationSignature:",
          config
        );
        return "";
      }
      // Normalise les produits pour éviter les problèmes de structure
      return config.products
        .map((p) => {
          const id = p.id_product_copieur || p.id || "";
          const qty = typeof p.quantity === "number" ? p.quantity : 1;
          return `${id}:${qty}`;
        })
        .sort()
        .join("|");
    },

    showWarningMessage(message) {
      this.warningMessage = message;
      this.showWarning = true;
      setTimeout(() => {
        this.showWarning = false;
      }, 5000);
    },

    getOptionProducts(id) {
      return this.copieur.produits.filter((p) => p.id_copieur_option === id);
    },

    getProductName(idProductCopieur) {
      const product = this.copieur.produits.find(
        (p) => p.id_product_copieur === idProductCopieur
      );
      return product ? product.name : "Produit inconnu";
    },

    calculatePossibleConfigurations() {
      if (!this.copieur.options || this.copieur.options.length === 0) return 0;

      let totalConfigurations = 1;

      this.copieur.options.forEach((option) => {
        const products = this.getOptionProducts(option.id);
        if (products.length === 0) return;

        let optionConfigurations = 0;

        if (option.choix_multiple) {
          // Pour sélection multiple: 2^n - 1 (toutes les combinaisons sauf vide)
          optionConfigurations = Math.pow(2, products.length) - 1;

          // Ajouter les variations de quantité
          products.forEach((product) => {
            if (product.case_choix_qte) {
              const qtyVariations = product.qte_max - product.qte_min + 1;
              optionConfigurations *= qtyVariations;
            }
          });
        } else {
          // Pour sélection simple: nombre de produits
          optionConfigurations = products.length;

          // Ajouter les variations de quantité
          products.forEach((product) => {
            if (product.case_choix_qte) {
              const qtyVariations = product.qte_max - product.qte_min + 1;
              optionConfigurations += qtyVariations - 1;
            }
          });
        }

        // Ajouter "Aucun produit" si activé
        if (option.affiche_aucun_produit) {
          optionConfigurations += 1;
        }

        totalConfigurations *= optionConfigurations;
      });

      return totalConfigurations;
    },

    generateAutoConfigurations() {
      if (!this.copieur.options || this.copieur.options.length === 0) {
        this.showWarningMessage(
          "Aucune option configurée pour générer les configurations"
        );
        return;
      }

      // Génère les signatures existantes
      const existingConfigs = new Set(
        this.copieur.configurations.map((img) => {
          const sig = this.getConfigurationSignature({
            products: img.products,
          });
          return sig;
        })
      );

      const allConfigurations = this.generateAllPossibleConfigurations();
      let addedCount = 0;
      allConfigurations.forEach((config) => {
        const signature = this.getConfigurationSignature({ products: config });
        if (existingConfigs.has(signature)) {
          return;
        }
        // Ajout de la nouvelle configuration
        const newImage = {
          id: "temp_" + Date.now() + Math.random() + addedCount,
          url: "",
          nom: `Configuration ${
            this.copieur.configurations.length + addedCount + 1
          }`,
          alt: "Configuration à mapper",
          products: config,
        };
        this.copieur.configurations.push(newImage);
        existingConfigs.add(signature); // Ajoute la signature pour éviter les doublons dans la même session
        addedCount++;
      });

      if (addedCount > 0) {
        this.showWarningMessage(
          `${addedCount} nouvelles configurations générées`
        );
      } else {
        this.showWarningMessage(
          "Toutes les configurations possibles existent déjà"
        );
      }
    },

    generateAllPossibleConfigurations() {
      const configurations = [];

      const generateCombinations = (optionIndex, currentConfig) => {
        if (optionIndex >= this.copieur.options.length) {
          if (currentConfig.length > 0) {
            configurations.push([...currentConfig]);
          }
          return;
        }

        const option = this.copieur.options[optionIndex];
        const products = this.getOptionProducts(option.id);

        if (products.length === 0) {
          generateCombinations(optionIndex + 1, currentConfig);
          return;
        }

        // Option "Aucun produit"
        if (option.affiche_aucun_produit) {
          generateCombinations(optionIndex + 1, currentConfig);
        }

        if (option.choix_multiple) {
          // Générer toutes les combinaisons possibles (2^n - 1)
          for (let i = 1; i < Math.pow(2, products.length); i++) {
            const combination = [];

            for (let j = 0; j < products.length; j++) {
              if (i & (1 << j)) {
                const product = products[j];

                if (product.case_choix_qte) {
                  // Générer toutes les quantités possibles
                  for (
                    let qty = product.qte_min;
                    qty <= product.qte_max;
                    qty++
                  ) {
                    combination.push({
                      id_product_copieur: product.id_product_copieur,
                      quantity: qty,
                    });
                  }
                } else {
                  combination.push({
                    id_product_copieur: product.id_product_copieur,
                    quantity: 1,
                  });
                }
              }
            }

            generateCombinations(optionIndex + 1, [
              ...currentConfig,
              ...combination,
            ]);
          }
        } else {
          // Sélection simple
          products.forEach((product) => {
            if (product.case_choix_qte) {
              // Générer toutes les quantités possibles
              for (let qty = product.qte_min; qty <= product.qte_max; qty++) {
                generateCombinations(optionIndex + 1, [
                  ...currentConfig,
                  {
                    id_product_copieur: product.id_product_copieur,
                    quantity: qty,
                  },
                ]);
              }
            } else {
              generateCombinations(optionIndex + 1, [
                ...currentConfig,
                { id_product_copieur: product.id_product_copieur, quantity: 1 },
              ]);
            }
          });
        }
      };

      generateCombinations(0, []);
      return configurations;
    },
  },

  mounted() {
    // Initialize configurations array if not exists
    if (!this.copieur.configurations) {
      Vue.set(this.copieur, "configurations", []);
    }
  },
});
</script>

<style scoped>
.images-tab {
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

.header-actions {
  display: flex;
  gap: 12px;
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
}

.btn-secondary {
  background: white;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.icon {
  width: 18px;
  height: 18px;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.icon-tiny {
  width: 12px;
  height: 12px;
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  margin-bottom: 24px;
  color: #856404;
}

.warning-icon {
  width: 20px;
  height: 20px;
}

.btn-close-warning {
  margin-left: auto;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-preview {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #999;
}

.placeholder-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.overlay-btn:hover {
  background: white;
}

.overlay-btn.btn-danger {
  color: #d32f2f;
}

.image-info {
  padding: 16px;
}

.image-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.config-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #eee;
}

.config-products {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.product-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.quantity-badge {
  background: #1976d2;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.empty-images {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin: 0 auto 24px;
}

.modal-copieur-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-copieur {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-copieur-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-copieur-content {
  padding: 20px;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-zone {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone.drag-over {
  border-color: #1976d2;
  background: #f3f9ff;
}

.file-input {
  display: none;
}

.uploaded-preview {
  max-width: 200px;
  margin: 0 auto;
}

.uploaded-img {
  width: 100%;
  border-radius: 8px;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #ccc;
  margin: 0 auto 16px;
}

.image-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.configuration-section h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.config-builder {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-config {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.option-config h5 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.products-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #eee;
}

.product-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-display {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
}

.modal-copieur-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: 1fr;
  }

  .image-details {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}
.image-card.is-default {
  border: 2px solid #ff9800;
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
}

.image-card.is-default:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 152, 0, 0.4);
}
.overlay-btn.is-default {
  background: #ff9800;
  color: white;
}
.overlay-btn.is-default:hover {
  background: #f57c00;
}
.badge-icon {
  width: 12px;
  height: 12px;
}
.default-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
  z-index: 10;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.field-help {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0;
  line-height: 1.4;
}
</style>
