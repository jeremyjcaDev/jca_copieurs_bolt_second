<template>
  <div class="preview-tab">
    <div class="tab-header">
      <h2 class="tab-title">Aperçu du Configurateur</h2>
      <div class="preview-info">
        <span class="info-badge">Mode Prévisualisation</span>
      </div>
    </div>

    <div class="configurator-container">
      <!-- Image principale et résumé -->
      <div class="product-showcase">
        <div class="main-image">
          <img
            v-if="currentConfiguration && currentConfiguration.url"
            :src="currentConfiguration.url"
            :alt="currentConfiguration.alt || 'Image configuration'"
            class="showcase-img"
          />
          <div v-else class="placeholder-showcase">
            <div class="placeholder-img">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="placeholder-icon feather feather-image"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Aucune image</span>
            </div>
          </div>
        </div>

        <div class="configuration-summary">
          <h3>Configuration actuelle</h3>
          <div class="selected-products">
            <div
              v-for="product in getSelectedProductsDetails()"
              :key="product.id_product_copieur"
              class="selected-product"
              :class="{
                disabled: isProductDisabled(product.id_product_copieur),
                excluded: isProductExcluded(product.id_product_copieur),
                required: isProductRequired(product.id_product_copieur),
              }"
            >
              <img
                :src="
                  product.image_url ||
                  'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=100'
                "
                :alt="product.name"
                class="product-thumb"
              />
              <div class="product-details">
                <span class="product-name">{{ product.name }}</span>
                <span class="product-price">{{
                  formatPrice(product.price + product.variation_price)
                }}</span>
                <span
                  v-if="selectedQuantities[product.id_product_copieur] > 1"
                  class="quantity"
                >
                  Qté: {{ selectedQuantities[product.id_product_copieur] }}
                </span>

                <!-- Ajout des messages de règles -->
                <div
                  v-if="
                    getProductRuleMessages(product.id_product_copieur).length >
                    0
                  "
                  class="rule-messages"
                >
                  <div
                    v-for="message in getProductRuleMessages(
                      product.id_product_copieur
                    )"
                    :key="message.id"
                    :class="['rule-message', message.type]"
                  >
                    <alert-triangle-icon
                      v-if="message.type === 'warning'"
                      class="message-icon"
                    />
                    <x-circle-icon
                      v-if="message.type === 'error'"
                      class="message-icon"
                    />
                    <info-icon
                      v-if="message.type === 'info'"
                      class="message-icon"
                    />
                    <span class="message-text">{{ message.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="price-summary">
            <div class="total-price">
              <span class="price-label">Prix total:</span>
              <span class="price-value">{{
                formatPrice(calculateTotalPrice())
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration des options avec accordéons -->
      <div class="options-configurator">
        <div
          v-for="(option, index) in copieur.options"
          :key="`preview-option-${option.ordre}`"
          class="option-accordion"
          :class="{ 'is-open': openAccordions[index] }"
        >
          <div class="accordion-header" @click="toggleAccordion(index)">
            <div class="accordion-title">
              <h4 class="option-title">
                {{ option.titre_option || option.nom_option }}
              </h4>
              <span
                v-if="!option.choix_multiple && !option.affiche_aucun_produit"
                class="required-badge"
              >
                Obligatoire
              </span>
            </div>
            <chevron-down-icon
              class="accordion-icon"
              :class="{ rotated: openAccordions[index] }"
            />
          </div>

          <div class="accordion-content" v-show="openAccordions[index]">
            <div class="products-list">
              <!-- Option "Aucun produit" si activée -->
              <div
                v-if="option.affiche_aucun_produit"
                class="product-item none-option"
                :class="{
                  selected: selectedConfiguration[option.id] === null,
                }"
                @click="selectNoneOption(option.id)"
              >
                <div class="product-image">
                  <x-circle-icon class="none-icon" />
                  <div
                    v-if="selectedConfiguration[option.id] === null"
                    class="selection-overlay"
                  >
                    <check-circle-icon class="check-icon" />
                  </div>
                </div>
                <div class="product-info">
                  <h5 class="product-name">Aucun produit</h5>
                  <p class="product-description">
                    Ne pas sélectionner de produit pour cette option
                  </p>
                </div>
              </div>

              <!-- Produits de l'option -->
              <div
                v-for="product in getOptionProducts(option.id)"
                :key="`preview-product-${product.id_product_copieur}`"
                class="product-item"
                :class="{
                  selected: isProductSelected(
                    option.id,
                    product.id_product_copieur
                  ),
                  disabled: isProductDisabled(product.id_product_copieur),
                  excluded: isProductExcluded(product.id_product_copieur),
                  required: isProductRequired(product.id_product_copieur),
                }"
                @click="toggleProduct(option, product)"
              >
                <div class="product-image">
                  <img
                    :src="
                      product.image_url ||
                      'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300'
                    "
                    :alt="product.nom_produit_ordinateur"
                    class="product-img"
                  />

                  <!-- Badges de statut -->
                  <div class="product-badges">
                    <span
                      v-if="product.achat_obligatoire"
                      class="badge required"
                      >Obligatoire</span
                    >
                    <span
                      v-if="product.variation_price > 0"
                      class="badge price-up"
                      >+{{ formatPrice(product.variation_price) }}</span
                    >
                    <span
                      v-if="product.variation_price < 0"
                      class="badge price-down"
                      >{{ formatPrice(product.variation_price) }}</span
                    >
                  </div>

                  <!-- Overlay de sélection -->
                  <div
                    v-if="
                      isProductSelected(option.id, product.id_product_copieur)
                    "
                    class="selection-overlay"
                  >
                    <check-circle-icon class="check-icon" />
                  </div>

                  <!-- Overlay de désactivation -->
                  <div
                    v-if="isProductDisabled(product.id_product_copieur)"
                    class="disabled-overlay"
                  >
                    <x-circle-icon class="disabled-icon" />
                  </div>
                </div>

                <div class="product-info">
                  <div class="product-header">
                    <h5 class="product-name">
                      {{ product.name }}
                    </h5>

                    <!-- Messages de règles à droite du nom -->
                    <div
                      v-if="
                        getProductRuleMessages(product.id_product_copieur)
                          .length > 0
                      "
                      class="rule-messages"
                      style="
                        margin-left: 16px;
                        display: inline-flex;
                        align-items: center;
                      "
                    >
                      <div
                        v-for="message in getProductRuleMessages(
                          product.id_product_copieur
                        )"
                        :key="message.id"
                        :class="['rule-message', message.type]"
                        style="margin-left: 8px"
                      >
                        <alert-triangle-icon
                          v-if="message.type === 'warning'"
                          class="message-icon"
                        />
                        <x-circle-icon
                          v-if="message.type === 'error'"
                          class="message-icon"
                        />
                        <info-icon
                          v-if="message.type === 'info'"
                          class="message-icon"
                        />
                        <span class="message-text">{{ message.text }}</span>
                      </div>
                    </div>
                  </div>

                  <p class="product-mobile">{{ product.reference }}</p>
                  <div class="product-price">
                    {{ formatPrice(product.price + product.variation_price) }}
                    <span
                      v-if="product.variation_price !== 0"
                      class="price-variation"
                    >
                      ({{ product.variation_price > 0 ? "+" : ""
                      }}{{ formatPrice(product.variation_price) }})
                    </span>
                    <!-- Contrôles de quantité -->
                    <div
                      v-if="
                        product.case_choix_qte &&
                        isProductSelected(option.id, product.id_product_copieur)
                      "
                      class="quantity-controls"
                      @click.stop
                    >
                      <button
                        @click="decreaseQuantity(product.id_product_copieur)"
                        :disabled="
                          selectedQuantities[product.id_product_copieur] <=
                          product.qte_min
                        "
                        class="qty-btn"
                      >
                        <minus-icon class="icon-tiny" />
                      </button>
                      <span class="qty-display">{{
                        selectedQuantities[product.id_product_copieur] || 1
                      }}</span>
                      <button
                        @click="increaseQuantity(product.id_product_copieur)"
                        :disabled="
                          selectedQuantities[product.id_product_copieur] >=
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
      </div>
    </div>

    <!-- Messages globaux de validation -->
    <div v-if="globalValidationMessages.length > 0" class="global-messages">
      <div
        v-for="message in globalValidationMessages"
        :key="message.id"
        :class="['global-message', message.type]"
      >
        <alert-triangle-icon
          v-if="message.type === 'warning'"
          class="message-icon"
        />
        <x-circle-icon v-if="message.type === 'error'" class="message-icon" />
        <check-circle-icon
          v-if="message.type === 'success'"
          class="message-icon"
        />
        <span>{{ message.text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import {
  XCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  PlusIcon,
  MinusIcon,
  ChevronDownIcon,
} from "vue-feather-icons";

export default Vue.extend({
  name: "PreviewTab",
  components: {
    XCircleIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    InfoIcon,
    PlusIcon,
    MinusIcon,
    ChevronDownIcon,
  },
  data() {
    return {
      selectedConfiguration: {},
      selectedQuantities: {},
      ruleMessages: [],
      openAccordions: {},
    };
  },
  computed: {
    ...mapState(["currentCopieur"]),

    copieur() {
      return this.getDemoData();
    },

    isDemoMode() {
      return true;
    },

    currentConfiguration() {
      if (
        !this.copieur.configurations ||
        this.copieur.configurations.length === 0
      )
        return null;

      // Trouver l'image qui correspond à la configuration actuelle
      const currentConfig = this.getCurrentConfigurationSignature();

      for (const config of this.copieur.configurations) {
        const imageConfig = this.getConfigurationSignature(
          config.products || []
        );
        if (imageConfig === currentConfig) {
          return config;
        }
      }

      // Si aucune correspondance exacte, retourner la première image
      return this.copieur.configurations[0];
    },

    globalValidationMessages() {
      const messages = [];

      // Vérifier les règles globales
      if (this.copieur.rules) {
        this.copieur.rules.forEach((rule) => {
          if (this.isRuleTriggered(rule)) {
            const targetProduct = this.copieur.produits.find(
              (p) => p.id_product_copieur === rule.target_id
            );
            const isTargetSelected = this.getSelectedProductIds().includes(
              rule.target_id
            );

            if (rule.action_type === "exclude" && isTargetSelected) {
              messages.push({
                id: `global-${rule.id}`,
                type: "error",
                text:
                  rule.message ||
                  `${targetProduct?.name} est exclu par une règle`,
              });
            } else if (rule.action_type === "require" && !isTargetSelected) {
              messages.push({
                id: `global-${rule.id}`,
                type: "warning",
                text:
                  rule.message ||
                  `${targetProduct?.name} est requis par une règle`,
              });
            }
          }
        });
      }

      return messages;
    },
  },
  methods: {
    getDemoData() {
      return {
        nom_copieur: "Configurateur PC Gamer",
        titre_copieur: "Créez votre PC Gamer sur mesure",
        options: [
          {
            id: 1,
            nom_option: "Processeur",
            titre_option: "Choisissez votre processeur",
            choix_multiple: false,
            affiche_aucun_produit: false,
            ordre: 1,
          },
          {
            id: 2,
            nom_option: "Carte Graphique",
            titre_option: "Sélectionnez votre carte graphique",
            choix_multiple: false,
            affiche_aucun_produit: false,
            ordre: 2,
          },
          {
            id: 3,
            nom_option: "Mémoire RAM",
            titre_option: "Quantité de RAM",
            choix_multiple: false,
            affiche_aucun_produit: false,
            ordre: 3,
          },
          {
            id: 4,
            nom_option: "Stockage",
            titre_option: "Options de stockage",
            choix_multiple: true,
            affiche_aucun_produit: false,
            ordre: 4,
          },
          {
            id: 5,
            nom_option: "Accessoires",
            titre_option: "Accessoires optionnels",
            choix_multiple: true,
            affiche_aucun_produit: true,
            ordre: 5,
          },
        ],
        produits: [
          {
            id_product_copieur: 101,
            id_copieur_option: 1,
            name: "Intel Core i5-13600K",
            nom_produit_ordinateur: "Intel Core i5-13600K",
            reference: "CPU-I5-13600K",
            price: 329.99,
            variation_price: 0,
            achat_obligatoire: true,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 102,
            id_copieur_option: 1,
            name: "Intel Core i7-13700K",
            nom_produit_ordinateur: "Intel Core i7-13700K",
            reference: "CPU-I7-13700K",
            price: 329.99,
            variation_price: 120,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 103,
            id_copieur_option: 1,
            name: "AMD Ryzen 7 7800X3D",
            nom_produit_ordinateur: "AMD Ryzen 7 7800X3D",
            reference: "CPU-R7-7800X3D",
            price: 329.99,
            variation_price: 150,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 201,
            id_copieur_option: 2,
            name: "NVIDIA RTX 4060 Ti 8GB",
            nom_produit_ordinateur: "NVIDIA RTX 4060 Ti 8GB",
            reference: "GPU-RTX-4060TI",
            price: 449.99,
            variation_price: 0,
            achat_obligatoire: true,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 202,
            id_copieur_option: 2,
            name: "NVIDIA RTX 4070 12GB",
            nom_produit_ordinateur: "NVIDIA RTX 4070 12GB",
            reference: "GPU-RTX-4070",
            price: 449.99,
            variation_price: 200,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 203,
            id_copieur_option: 2,
            name: "NVIDIA RTX 4080 16GB",
            nom_produit_ordinateur: "NVIDIA RTX 4080 16GB",
            reference: "GPU-RTX-4080",
            price: 449.99,
            variation_price: 650,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 301,
            id_copieur_option: 3,
            name: "16GB DDR5 5600MHz",
            nom_produit_ordinateur: "16GB DDR5 5600MHz",
            reference: "RAM-16GB-DDR5",
            price: 89.99,
            variation_price: 0,
            achat_obligatoire: true,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 302,
            id_copieur_option: 3,
            name: "32GB DDR5 6000MHz",
            nom_produit_ordinateur: "32GB DDR5 6000MHz",
            reference: "RAM-32GB-DDR5",
            price: 89.99,
            variation_price: 90,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 401,
            id_copieur_option: 4,
            name: "SSD NVMe 500GB",
            nom_produit_ordinateur: "SSD NVMe 500GB",
            reference: "SSD-500GB",
            price: 59.99,
            variation_price: 0,
            achat_obligatoire: false,
            case_choix_qte: true,
            qte_min: 1,
            qte_max: 4,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 402,
            id_copieur_option: 4,
            name: "SSD NVMe 1TB",
            nom_produit_ordinateur: "SSD NVMe 1TB",
            reference: "SSD-1TB",
            price: 109.99,
            variation_price: 0,
            achat_obligatoire: false,
            case_choix_qte: true,
            qte_min: 1,
            qte_max: 4,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 403,
            id_copieur_option: 4,
            name: "HDD 2TB",
            nom_produit_ordinateur: "HDD 2TB",
            reference: "HDD-2TB",
            price: 69.99,
            variation_price: 0,
            achat_obligatoire: false,
            case_choix_qte: true,
            qte_min: 1,
            qte_max: 3,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 501,
            id_copieur_option: 5,
            name: "Clavier mécanique RGB",
            nom_produit_ordinateur: "Clavier mécanique RGB",
            reference: "KB-RGB-MECH",
            price: 79.99,
            variation_price: 0,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 502,
            id_copieur_option: 5,
            name: "Souris gaming",
            nom_produit_ordinateur: "Souris gaming",
            reference: "MOUSE-GAMING",
            price: 49.99,
            variation_price: 0,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
          {
            id_product_copieur: 503,
            id_copieur_option: 5,
            name: "Casque audio 7.1",
            nom_produit_ordinateur: "Casque audio 7.1",
            reference: "HEADSET-7.1",
            price: 89.99,
            variation_price: 0,
            achat_obligatoire: false,
            case_choix_qte: false,
            qte_min: 1,
            qte_max: 1,
            image_url: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300",
          },
        ],
        configurations: [
          {
            id: 1,
            url: "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800",
            alt: "Configuration PC Gamer",
            is_default: true,
            products: [
              { id_product_copieur: 101, quantity: 1 },
              { id_product_copieur: 201, quantity: 1 },
              { id_product_copieur: 301, quantity: 1 },
              { id_product_copieur: 402, quantity: 1 },
            ],
          },
        ],
        rules: [
          {
            id: 1,
            rule_type: "product_exclusion",
            source_id: 203,
            target_id: 301,
            action_type: "exclude",
            message: "La RTX 4080 nécessite au moins 32GB de RAM",
          },
          {
            id: 2,
            rule_type: "product_obligation",
            source_id: 203,
            target_id: 302,
            action_type: "require",
            message: "La RTX 4080 nécessite 32GB de RAM pour de meilleures performances",
          },
        ],
        remise_copieur: {
          type: "percentage",
          valeur: 5,
        },
      };
    },

    toggleAccordion(index) {
      Vue.set(this.openAccordions, index, !this.openAccordions[index]);
    },

    getOptionProducts(optionId) {
      return this.copieur.produits.filter(
        (p) => p.id_copieur_option === optionId
      );
    },

    isProductSelected(optionId, productId) {
      const selection = this.selectedConfiguration[optionId];
      if (Array.isArray(selection)) {
        return selection.includes(productId);
      }
      return selection === productId;
    },

    isProductDisabled(productId) {
      // Vérifier les règles d'exclusion
      if (this.copieur.rules) {
        for (const rule of this.copieur.rules) {
          if (
            rule.target_id === productId &&
            rule.action_type === "exclude" &&
            this.isRuleTriggered(rule)
          ) {
            return true;
          }
        }
      }
      return false;
    },

    isProductExcluded(productId) {
      return this.isProductDisabled(productId);
    },

    isProductRequired(productId) {
      if (this.copieur.rules) {
        for (const rule of this.copieur.rules) {
          if (
            rule.target_id === productId &&
            rule.action_type === "require" &&
            this.isRuleTriggered(rule)
          ) {
            return true;
          }
        }
      }
      return false;
    },

    isRuleTriggered(rule) {
      const selectedProductIds = this.getSelectedProductIds();

      switch (rule.rule_type) {
        case "option_exclusion":
        case "option_obligation":
          return this.isOptionSelected(rule.source_id);

        case "product_exclusion":
        case "product_obligation":
          return selectedProductIds.includes(rule.source_id);

        case "quantity_rule": {
          if (!selectedProductIds.includes(rule.source_id)) return false;

          const quantity = this.selectedQuantities[rule.source_id] || 1;
          switch (rule.condition_operator) {
            case "=":
              return quantity === rule.condition_value;
            case ">=":
              return quantity >= rule.condition_value;
            case "<=":
              return quantity <= rule.condition_value;
            case ">":
              return quantity > rule.condition_value;
            case "<":
              return quantity < rule.condition_value;
            default:
              return false;
          }
        }

        default:
          return false;
      }
    },

    isOptionSelected(optionId) {
      const option = this.copieur.options.find((o) => o.id === optionId);
      if (!option) return false;

      const optionProducts = this.getOptionProducts(option.id);
      return optionProducts.some((product) =>
        this.getSelectedProductIds().includes(product.id_product_copieur)
      );
    },

    getSelectedProductIds() {
      const productIds = [];
      Object.values(this.selectedConfiguration).forEach((selection) => {
        if (Array.isArray(selection)) {
          productIds.push(...selection);
        } else if (selection !== null && selection !== undefined) {
          productIds.push(selection);
        }
      });
      return productIds;
    },

    selectNoneOption(optionId) {
      Vue.set(this.selectedConfiguration, optionId, null);
      this.updateImage();
    },

    toggleProduct(option, product) {
      if (this.isProductDisabled(product.id_product_copieur)) return;

      const optionId = option.id;

      if (option.choix_multiple) {
        // Sélection multiple
        if (!this.selectedConfiguration[optionId]) {
          Vue.set(this.selectedConfiguration, optionId, []);
        }

        const currentSelection = [...this.selectedConfiguration[optionId]];
        const index = currentSelection.indexOf(product.id_product_copieur);

        if (index > -1) {
          currentSelection.splice(index, 1);
          Vue.delete(this.selectedQuantities, product.id_product_copieur);
        } else {
          currentSelection.push(product.id_product_copieur);
          Vue.set(
            this.selectedQuantities,
            product.id_product_copieur,
            product.qte_min || 1
          );
        }

        Vue.set(this.selectedConfiguration, optionId, currentSelection);
      } else {
        if (
          this.selectedConfiguration[optionId] === product.id_product_copieur
        ) {
          Vue.set(this.selectedConfiguration, optionId, null);
          Vue.delete(this.selectedQuantities, product.id_product_copieur);
        } else {
          Vue.set(
            this.selectedConfiguration,
            optionId,
            product.id_product_copieur
          );
          Vue.set(
            this.selectedQuantities,
            product.id_product_copieur,
            product.qte_min || 1
          );
        }
      }
      console;
      this.updateImage();
    },

    increaseQuantity(productId) {
      const product = this.copieur.produits.find(
        (p) => p.id_product_copieur === productId
      );
      const current = this.selectedQuantities[productId] || 1;
      if (current < product.qte_max) {
        Vue.set(this.selectedQuantities, productId, current + 1);
        this.updateImage();
      }
    },

    decreaseQuantity(productId) {
      const product = this.copieur.produits.find(
        (p) => p.id_product_copieur === productId
      );
      const current = this.selectedQuantities[productId] || 1;
      if (current > product.qte_min) {
        Vue.set(this.selectedQuantities, productId, current - 1);
        this.updateImage();
      }
    },

    getProductRuleMessages(productId) {
      const messages = [];

      if (this.copieur.rules) {
        this.copieur.rules.forEach((rule) => {
          if (rule.target_id === productId && this.isRuleTriggered(rule)) {
            let type = "info";
            let text = rule.message || "Règle appliquée";

            if (rule.action_type === "exclude") {
              type = "error";
              text = rule.message || "Produit exclu par une règle";
            }
            if (rule.action_type === "require") {
              type = "warning";
              text = rule.message || "Produit requis par une règle";
            }

            messages.push({
              id: `rule-${rule.id}`,
              type,
              text,
            });
          }
        });
      }

      return messages;
    },

    getSelectedProductsDetails() {
      const selectedIds = this.getSelectedProductIds();
      return this.copieur.produits.filter((p) =>
        selectedIds.includes(p.id_product_copieur)
      );
    },

    calculateTotalPrice() {
      let total = 0;
      const selectedProducts = this.getSelectedProductsDetails();

      selectedProducts.forEach((product) => {
        const quantity =
          this.selectedQuantities[product.id_product_copieur] || 1;
        const price = (product.price || 0) + (product.variation_price || 0);
        total += price * quantity;
      });
      // Appliquer les remises du copieur
      if (
        this.copieur.remise_copieur &&
        this.copieur.remise_copieur.type &&
        this.copieur.remise_copieur.valeur
      ) {
        if (this.copieur.remise_copieur.type === "percentage") {
          total = total * (1 - this.copieur.remise_copieur.valeur / 100);
        } else if (this.copieur.remise_copieur.type === "fixed") {
          total = Math.max(0, total - this.copieur.remise_copieur.valeur);
        }
      }
      return total;
    },

    getCurrentConfigurationSignature() {
      const products = [];
      const selectedIds = this.getSelectedProductIds();

      selectedIds.forEach((id_product_copieur) => {
        const quantity = this.selectedQuantities[id_product_copieur] || 1;
        products.push({ id_product_copieur, quantity });
      });
      return this.getConfigurationSignature(products);
    },

    getConfigurationSignature(products) {
      return products
        .map((p) => `${p.id_product_copieur}:${p.quantity}`)
        .sort()
        .join("|");
    },

    updateImage() {
      // L'image se met à jour automatiquement via le computed currentImage
      this.$forceUpdate();
    },

    formatPrice(price) {
      if (typeof price !== "number" || isNaN(price)) return "0,00 €";
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    },
  },

  mounted() {
    // Ouvrir le premier accordéon par défaut
    Vue.set(this.openAccordions, 0, true);

    // Pré-sélectionner la configuration par défaut si elle existe
    const defaultConfig = this.copieur.configurations?.find(
      (cfg) => cfg.is_default
    );
    if (defaultConfig && Array.isArray(defaultConfig.products)) {
      // Pour chaque produit de la configuration par défaut
      defaultConfig.products.forEach((product) => {
        // Trouver l'option correspondante à ce produit
        const option = this.copieur.options.find((opt) => {
          // On suppose que l'option contient ce produit
          return this.getOptionProducts(opt.id).some(
            (p) => p.id_product_copieur === product.id_product_copieur
          );
        });
        if (option) {
          if (option.choix_multiple) {
            // Si déjà une sélection, ajouter
            if (!Array.isArray(this.selectedConfiguration[option.id])) {
              Vue.set(this.selectedConfiguration, option.id, []);
            }
            if (
              !this.selectedConfiguration[option.id].includes(
                product.id_product_copieur
              )
            ) {
              this.selectedConfiguration[option.id].push(
                product.id_product_copieur
              );
            }
          } else {
            Vue.set(
              this.selectedConfiguration,
              option.id,
              product.id_product_copieur
            );
          }
          Vue.set(
            this.selectedQuantities,
            product.id_product_copieur,
            product.quantity || 1
          );
        }
      });
    } else {
      // Si pas de configuration par défaut, initialiser avec les produits obligatoires
      this.copieur.options.forEach((option) => {
        const obligatoryProducts = this.getOptionProducts(option.id).filter(
          (p) => p.achat_obligatoire
        );

        if (obligatoryProducts.length > 0) {
          if (option.choix_multiple) {
            Vue.set(
              this.selectedConfiguration,
              option.id,
              obligatoryProducts.map((p) => p.id_product_copieur)
            );
          } else {
            Vue.set(
              this.selectedConfiguration,
              option.id,
              obligatoryProducts[0].id_product_copieur
            );
          }

          obligatoryProducts.forEach((product) => {
            Vue.set(
              this.selectedQuantities,
              product.id_product_copieur,
              product.qte_min || 1
            );
          });
        }
      });
    }
  },
});
</script>

<style scoped>
.preview-tab {
  max-width: 100%;
  padding: 0 16px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.tab-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.info-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.configurator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-showcase {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  order: 1;
}

.main-image {
  margin-bottom: 16px;
}

.showcase-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.placeholder-showcase {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #999;
}

.placeholder-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

.configuration-summary h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.selected-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.selected-product {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 2px solid transparent;
}

.product-thumb {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-size: 12px;
  font-weight: 500;
  color: #1a1a1a;
}

.product-price {
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity {
  font-size: 10px;
  color: #666;
}

.price-summary {
  padding: 12px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border-radius: 8px;
  color: white;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 14px;
  font-weight: 500;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
}

.options-configurator {
  display: flex;
  flex-direction: column;
  gap: 12px;
  order: 2;
}

.option-accordion {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background: #f0f0f0;
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.option-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.required-badge {
  background: #ffebee;
  color: #d32f2f;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.accordion-icon {
  width: 20px;
  height: 20px;
  color: #666;
  transition: transform 0.3s;
}

.accordion-icon.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 16px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.product-item:hover {
  background: white;
  border-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-item.selected {
  background: white;
  border-color: #1976d2;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.2);
}

.product-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f0f0f0;
}

.product-item.excluded,
.selected-product.excluded {
  border-color: #d32f2f;
  background: #ffebee;
}

.product-item.required,
.selected-product.required {
  border-color: #ff9800;
  background: #fff3e0;
}

.none-option {
  border: 2px dashed #ddd;
  justify-content: center;
  text-align: center;
}

.none-option.selected {
  border-color: #1976d2;
  background: #e3f2fd;
}

.product-image {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.none-icon {
  width: 32px;
  height: 32px;
  color: #999;
  margin: 24px auto;
}

.product-badges {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge {
  padding: 2px 4px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.required {
  background: #ffebee;
  color: #d32f2f;
}

.badge.price-up {
  background: #e8f5e8;
  color: #2e7d32;
}

.badge.price-down {
  background: #fff3e0;
  color: #f57c00;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(25, 118, 210, 0.9);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.disabled-icon {
  width: 24px;
  height: 24px;
  color: white;
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
  line-height: 1.3;
}

.rule-messages {
  margin: 4px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-message {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.2;
}

.rule-message.error {
  background: #ffebee;
  color: #d32f2f;
}

.rule-message.warning {
  background: #fff3e0;
  color: #f57c00;
}

.rule-message.info {
  background: #e3f2fd;
  color: #1976d2;
}

.message-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.message-text {
  font-weight: 500;
}

.product-mobile {
  font-size: 11px;
  color: #666;
  margin: 0 0 4px;
}

.product-price {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
}

.price-variation {
  font-size: 11px;
  color: #666;
  font-weight: normal;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 6px;
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
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  border-color: #1976d2;
  background: #f3f9ff;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-tiny {
  width: 12px;
  height: 12px;
}

.qty-display {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.global-messages {
  position: fixed;
  bottom: 20px;
  left: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.global-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

.global-message.error {
  background: #ffebee;
  color: #d32f2f;
  border-left: 4px solid #d32f2f;
}

.global-message.warning {
  background: #fff3e0;
  color: #f57c00;
  border-left: 4px solid #f57c00;
}

.global-message.success {
  background: #e8f5e8;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Desktop adaptations */
@media (min-width: 768px) {
  .preview-tab {
    max-width: 1200px;
    padding: 0 24px;
  }

  .configurator-container {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 32px;
    align-items: start;
  }

  .product-showcase {
    position: sticky;
    top: 24px;
    order: 0;
  }

  .main-image {
    margin-bottom: 20px;
  }

  .showcase-img {
    height: 250px;
  }

  .placeholder-showcase {
    height: 250px;
  }

  .global-messages {
    top: 24px;
    right: 24px;
    left: auto;
    bottom: auto;
    max-width: 400px;
  }

  .global-message {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}
.product-header {
  display: flex;
  align-items: center;
}
</style>
