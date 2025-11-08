<template>
  <div class="rules-tab">
    <div class="tab-header">
      <h2 class="tab-title">Règles et Conditions</h2>
      <div class="rules-stats">
        <div class="stat-item">
          <span class="stat-number">{{ getTotalRules() }}</span>
          <span class="stat-label">Règles totales</span>
        </div>
      </div>
    </div>

    <div class="rules-content">
      <!-- Règles par Options -->
      <div class="rules-section">
        <div class="section-header">
          <h3 class="section-title">
            <settings-icon class="section-icon" />
            Règles par Options
          </h3>
          <p class="section-description">
            Configurez les exclusions et obligations basées sur le choix d'une
            option
          </p>
        </div>

        <div class="rules-cards">
          <!-- Exclusions par Options -->
          <div class="rule-card">
            <div class="rule-header">
              <h4 class="rule-title">
                <x-circle-icon class="rule-icon exclusion" />
                Exclusions par Options
              </h4>
              <button
                @click="addRule('option_exclusion')"
                class="btn btn-small btn-secondary"
              >
                <plus-icon class="icon-small" />
                Ajouter
              </button>
            </div>

            <div class="rule-list">
              <div
                v-for="(rule, index) in getRulesByType('option_exclusion')"
                :key="`option-exclusion-${index}`"
                class="rule-item"
              >
                <div class="rule-config">
                  <div class="rule-condition">
                    <label>Si l'option</label>
                    <select v-model="rule.source_id" class="rule-select">
                      <option value="">Choisir une option</option>
                      <option
                        v-for="option in copieur.options"
                        :key="option.id"
                        :value="option.id"
                      >
                        {{ option.nom_option || "Option sans nom" }}
                      </option>
                    </select>
                  </div>

                  <div class="rule-arrow">→</div>

                  <div class="rule-action">
                    <label>Exclure le produit</label>
                    <select v-model="rule.target_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template
                        v-if="getGroupedFilteredProducts(rule.source_id)"
                      >
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts(rule.source_id)"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div class="rule-message">
                  <label>Message personnalisé</label>
                  <input
                    v-model="rule.message"
                    type="text"
                    placeholder="Ce produit n'est pas compatible avec votre choix"
                    class="rule-input"
                  />
                </div>

                <button
                  @click="removeRule('option_exclusion', index)"
                  class="btn-remove"
                >
                  <trash-2-icon class="icon-small" />
                </button>
              </div>

              <div
                v-if="getRulesByType('option_exclusion').length === 0"
                class="empty-rules"
              >
                <x-circle-icon class="empty-icon" />
                <p>Aucune exclusion par option configurée</p>
              </div>
            </div>
          </div>

          <!-- Obligations par Options -->
          <div class="rule-card">
            <div class="rule-header">
              <h4 class="rule-title">
                <check-circle-icon class="rule-icon obligation" />
                Obligations par Options
              </h4>
              <button
                @click="addRule('option_obligation')"
                class="btn btn-small btn-secondary"
              >
                <plus-icon class="icon-small" />
                Ajouter
              </button>
            </div>

            <div class="rule-list">
              <div
                v-for="(rule, index) in getRulesByType('option_obligation')"
                :key="`option-obligation-${index}`"
                class="rule-item"
              >
                <div class="rule-config">
                  <div class="rule-condition">
                    <label>Si l'option</label>
                    <select v-model="rule.source_id" class="rule-select">
                      <option value="">Choisir une option</option>
                      <option
                        v-for="option in copieur.options"
                        :key="option.id"
                        :value="option.id"
                      >
                        {{ option.nom_option || "Option sans nom" }}
                      </option>
                    </select>
                  </div>

                  <div class="rule-arrow">→</div>

                  <div class="rule-action">
                    <label>Rendre obligatoire</label>
                    <select v-model="rule.target_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div class="rule-message">
                  <label>Message personnalisé</label>
                  <input
                    v-model="rule.message"
                    type="text"
                    placeholder="Ce produit est requis avec votre choix"
                    class="rule-input"
                  />
                </div>

                <button
                  @click="removeRule('option_obligation', index)"
                  class="btn-remove"
                >
                  <trash-2-icon class="icon-small" />
                </button>
              </div>

              <div
                v-if="getRulesByType('option_obligation').length === 0"
                class="empty-rules"
              >
                <check-circle-icon class="empty-icon" />
                <p>Aucune obligation par option configurée</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Règles par Produits -->
      <div class="rules-section">
        <div class="section-header">
          <h3 class="section-title">
            <package-icon class="section-icon" />
            Règles par Produits
          </h3>
          <p class="section-description">
            Configurez les interactions entre produits (exclusions, obligations,
            conditions)
          </p>
        </div>

        <div class="rules-tabs">
          <button
            v-for="tab in productRuleTabs"
            :key="tab.id"
            @click="activeProductTab = tab.id"
            :class="['tab-btn', { active: activeProductTab === tab.id }]"
          >
            <component :is="tab.icon" class="tab-icon" />
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Exclusions Simples -->
          <div
            v-if="activeProductTab === 'product-exclusions'"
            class="rule-card"
          >
            <div class="rule-header">
              <h4 class="rule-title">Exclusions Simples</h4>
              <button
                @click="addRule('product_exclusion')"
                class="btn btn-small btn-secondary"
              >
                <plus-icon class="icon-small" />
                Ajouter
              </button>
            </div>

            <div class="rule-list">
              <div
                v-for="(rule, index) in getRulesByType('product_exclusion')"
                :key="`product-exclusion-${index}`"
                class="rule-item"
              >
                <div class="rule-config">
                  <div class="rule-condition">
                    <label>Si le produit</label>
                    <select v-model="rule.source_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>

                  <div class="rule-arrow">→</div>

                  <div class="rule-action">
                    <label>Exclure le produit</label>
                    <select v-model="rule.target_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div class="rule-message">
                  <label>Message personnalisé</label>
                  <input
                    v-model="rule.message"
                    type="text"
                    placeholder="Ces produits ne sont pas compatibles"
                    class="rule-input"
                  />
                </div>

                <button
                  @click="removeRule('product_exclusion', index)"
                  class="btn-remove"
                >
                  <trash-2-icon class="icon-small" />
                </button>
              </div>

              <div
                v-if="getRulesByType('product_exclusion').length === 0"
                class="empty-rules"
              >
                <x-circle-icon class="empty-icon" />
                <p>Aucune exclusion simple configurée</p>
              </div>
            </div>
          </div>

          <!-- Obligations Simples -->
          <div
            v-if="activeProductTab === 'product-obligations'"
            class="rule-card"
          >
            <div class="rule-header">
              <h4 class="rule-title">Obligations Simples</h4>
              <button
                @click="addRule('product_obligation')"
                class="btn btn-small btn-secondary"
              >
                <plus-icon class="icon-small" />
                Ajouter
              </button>
            </div>

            <div class="rule-list">
              <div
                v-for="(rule, index) in getRulesByType('product_obligation')"
                :key="`product-obligation-${index}`"
                class="rule-item"
              >
                <div class="rule-config">
                  <div class="rule-condition">
                    <label>Si le produit</label>
                    <select v-model="rule.source_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>

                  <div class="rule-arrow">→</div>

                  <div class="rule-action">
                    <label>Rendre obligatoire</label>
                    <select v-model="rule.target_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div class="rule-message">
                  <label>Message personnalisé</label>
                  <input
                    v-model="rule.message"
                    type="text"
                    placeholder="Ce produit est requis avec votre choix"
                    class="rule-input"
                  />
                </div>

                <button
                  @click="removeRule('product_obligation', index)"
                  class="btn-remove"
                >
                  <trash-2-icon class="icon-small" />
                </button>
              </div>

              <div
                v-if="getRulesByType('product_obligation').length === 0"
                class="empty-rules"
              >
                <check-circle-icon class="empty-icon" />
                <p>Aucune obligation simple configurée</p>
              </div>
            </div>
          </div>

          <!-- Règles de Quantité -->
          <div v-if="activeProductTab === 'quantity-rules'" class="rule-card">
            <div class="rule-header">
              <h4 class="rule-title">Règles de Quantité</h4>
              <button
                @click="addRule('quantity_rule')"
                class="btn btn-small btn-secondary"
              >
                <plus-icon class="icon-small" />
                Ajouter
              </button>
            </div>

            <div class="rule-list">
              <div
                v-for="(rule, index) in getRulesByType('quantity_rule')"
                :key="`quantity-rule-${index}`"
                class="rule-item"
              >
                <div class="rule-config">
                  <div class="rule-condition">
                    <label>Si le produit</label>
                    <select v-model="rule.source_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>

                  <div class="quantity-condition">
                    <select
                      v-model="rule.condition_operator"
                      class="rule-select-small"
                    >
                      <!-- eslint-disable-next-line vue/no-parsing-error -->
                      <option value="=">==</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                    </select>
                    <input
                      v-model.number="rule.condition_value"
                      type="number"
                      min="0"
                      class="quantity-input"
                    />
                  </div>

                  <div class="rule-arrow">→</div>

                  <div class="rule-action">
                    <select v-model="rule.action_type" class="rule-select">
                      <option value="exclude">Exclure</option>
                      <option value="require">Rendre obligatoire</option>
                    </select>
                    <select v-model="rule.target_id" class="rule-select">
                      <option value="">Choisir un produit</option>
                      <template v-if="getGroupedFilteredProducts()">
                        <optgroup
                          v-for="(
                            products, groupName
                          ) in getGroupedFilteredProducts()"
                          :key="groupName"
                          :label="groupName"
                        >
                          <option
                            v-for="product in products"
                            :key="product.id_product_copieur"
                            :value="product.id_product_copieur"
                          >
                            {{ product.name }}
                          </option>
                        </optgroup>
                      </template>
                      <template v-else>
                        <option disabled>Aucun produit disponible</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div class="rule-message">
                  <label>Message personnalisé</label>
                  <input
                    v-model="rule.message"
                    type="text"
                    placeholder="Condition de quantité non respectée"
                    class="rule-input"
                  />
                </div>

                <button
                  @click="removeRule('quantity_rule', index)"
                  class="btn-remove"
                >
                  <trash-2-icon class="icon-small" />
                </button>
              </div>

              <div
                v-if="getRulesByType('quantity_rule').length === 0"
                class="empty-rules"
              >
                <hash-icon class="empty-icon" />
                <p>Aucune règle de quantité configurée</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Résumé des Règles -->
      <div class="rules-summary">
        <h3 class="summary-title">Résumé de la Configuration</h3>
        <div class="summary-stats">
          <div class="summary-item">
            <x-circle-icon class="summary-icon exclusion" />
            <span class="summary-number">{{
              getRulesByType("option_exclusion").length +
              getRulesByType("product_exclusion").length
            }}</span>
            <span class="summary-label">Exclusions</span>
          </div>
          <div class="summary-item">
            <check-circle-icon class="summary-icon obligation" />
            <span class="summary-number">{{
              getRulesByType("option_obligation").length +
              getRulesByType("product_obligation").length
            }}</span>
            <span class="summary-label">Obligations</span>
          </div>
          <div class="summary-item">
            <hash-icon class="summary-icon quantity" />
            <span class="summary-number">{{
              getRulesByType("quantity_rule").length
            }}</span>
            <span class="summary-label">Règles de quantité</span>
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
  PlusIcon,
  Trash2Icon,
  SettingsIcon,
  PackageIcon,
  XCircleIcon,
  CheckCircleIcon,
  HashIcon,
} from "vue-feather-icons";

export default Vue.extend({
  name: "RulesTab",
  components: {
    PlusIcon,
    Trash2Icon,
    SettingsIcon,
    PackageIcon,
    XCircleIcon,
    CheckCircleIcon,
    HashIcon,
  },
  data() {
    return {
      activeProductTab: "product-exclusions",
      expandedRules: {},
      productRuleTabs: [
        {
          id: "product-exclusions",
          label: "Exclusions Simples",
          icon: "x-circle-icon",
        },
        {
          id: "product-obligations",
          label: "Obligations Simples",
          icon: "check-circle-icon",
        },
        {
          id: "quantity-rules",
          label: "Règles de Quantité",
          icon: "hash-icon",
        },
      ],
    };
  },
  computed: {
    ...mapState(["currentCopieur"]),

    copieur() {
      return (
        this.currentCopieur?.Copieur || {
          options: [],
          produits: [],
          rules: {},
        }
      );
    },
  },
  methods: {
    // Initialisation des règles
    initializeRules() {
      if (!this.copieur.rules) {
        Vue.set(this.copieur, "rules", []);
      }
    },

    // Récupérer les règles par type
    getRulesByType(ruleType) {
      this.initializeRules();
      return (
        this.copieur.rules.filter((rule) => rule.rule_type === ruleType) || []
      );
    },

    // Récupérer tous les produits
    getAllProducts() {
      return this.copieur.produits || [];
    },

    // Compter le total des règles
    getTotalRules() {
      this.initializeRules();
      return this.copieur.rules.length;
    },
    // Ajouter une règle selon le modèle DB
    addRule(ruleType) {
      this.initializeRules();
      console.warn("Adding rule of type:", ruleType);
      console.warn("Current rules before adding:", this.copieur);

      const baseRule = {
        id: "temp_" + Date.now() + Math.random(), // Temporaire, sera remplacé par l'ID DB
        copieur_id: this.copieur.id,
        rule_type: ruleType,
        source_type: this.getSourceType(ruleType),
        source_id: "",
        target_type: "product", // Par défaut, peut être changé
        target_id: "",
        condition_type: ruleType === "quantity_rule" ? "quantity" : "simple",
        condition_operator: ruleType === "quantity_rule" ? ">=" : null,
        condition_value: ruleType === "quantity_rule" ? 1 : null,
        action_type: this.getActionType(ruleType),
        message: "",
        priority: 0,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Ajouter la règle dans le store Vuex
      this.$store.commit("ADD_COPIEUR_RULE", baseRule);

      // this.copieur.rules.push(baseRule);
    },

    // Supprimer une règle
    removeRule(ruleType, index) {
      const rules = this.getRulesByType(ruleType);
      if (rules[index]) {
        const ruleIndex = this.copieur.rules.findIndex(
          (rule) => rule === rules[index]
        );
        if (ruleIndex !== -1) {
          this.copieur.rules.splice(ruleIndex, 1);
        }
        this.$store.dispatch("deleteRule", rules[index].id);
      }
    },

    // Déterminer le type de source selon le type de règle
    getSourceType(ruleType) {
      switch (ruleType) {
        case "option_exclusion":
        case "option_obligation":
          return "option";
        case "product_exclusion":
        case "product_obligation":
        case "quantity_rule":
          return "product";
        default:
          return "product";
      }
    },
    // Déterminer le type d'action selon le type de règle
    getActionType(ruleType) {
      switch (ruleType) {
        case "option_exclusion":
        case "product_exclusion":
          return "exclude";
        case "option_obligation":
        case "product_obligation":
          return "require";
        case "quantity_rule":
          return "exclude"; // Par défaut, peut être changé
        default:
          return "exclude";
      }
    },
    // Méthode pour filtrer les produits en fonction de l'option sélectionnée
    getFilteredProducts(selectedOptionId) {
      if (!selectedOptionId) {
        return this.getAllProducts(); // Retourne tous les produits si aucune option n'est sélectionnée
      }

      // Trouver l'option sélectionnée
      const selectedOption = this.copieur.options.find(
        (option) => option.id === parseInt(selectedOptionId)
      );

      if (!selectedOption) {
        return this.getAllProducts(); // Retourne tous les produits si l'option n'existe pas
      }

      // Vérifier que id_produit_selectionne est un tableau
      const produitsSelectionnes = Array.isArray(
        selectedOption.id_produit_selectionne
      )
        ? selectedOption.id_produit_selectionne
        : [];

      // Filtrer les produits qui ne sont pas dans l'option sélectionnée
      return this.getAllProducts().filter(
        (product) => !produitsSelectionnes.includes(product.id_product_copieur)
      );
    },

    // Méthode mise à jour pour regrouper les produits par id_copieur_option et selectedOptionId
    getGroupedFilteredProducts(selectedOptionId) {
      const filteredProducts = this.getFilteredProducts(selectedOptionId);

      if (filteredProducts.length === 0) {
        return null; // Aucun produit disponible
      }

      // Regrouper les produits par id_copieur_option
      const groupedProducts = {};
      filteredProducts.forEach((product) => {
        // Filtrer uniquement les produits qui correspondent à l'id_copieur_option
        if (product.id_copieur_option !== parseInt(selectedOptionId)) {
          const optionName = product.dans_quel_option || "Autres";
          if (!groupedProducts[optionName]) {
            groupedProducts[optionName] = [];
          }
          groupedProducts[optionName].push(product);
        }
      });

      return groupedProducts;
    },
  },

  mounted() {
    this.initializeRules();
  },
});
</script>

<style scoped>
.rules-tab {
  max-width: 1200px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.tab-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.rules-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1976d2;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rules-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.rules-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #1976d2;
}

.section-description {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.rules-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.rule-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eee;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.rule-icon {
  width: 18px;
  height: 18px;
}

.rule-icon.exclusion {
  color: #d32f2f;
}

.rule-icon.obligation {
  color: #388e3c;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-secondary {
  background: white;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.btn-secondary:hover {
  background: #1976d2;
  color: white;
}

.icon-small {
  width: 14px;
  height: 14px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ddd;
  position: relative;
}

.rule-config {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.rule-condition,
.rule-action {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.rule-condition label,
.rule-action label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.rule-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.rule-select-small {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 60px;
}

.rule-arrow {
  font-size: 18px;
  color: #1976d2;
  font-weight: bold;
  margin: 0 8px;
}

.quantity-condition {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.rule-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-message label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.rule-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.btn-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ffebee;
}

.empty-rules {
  text-align: center;
  padding: 32px 16px;
  color: #999;
}

.empty-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #ccc;
}

.rules-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.tab-btn.active {
  background: white;
  color: #1976d2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.tab-content {
  min-height: 200px;
}

.rules-summary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  text-align: center;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.summary-icon {
  width: 24px;
  height: 24px;
}

.summary-icon.exclusion {
  color: #ffcdd2;
}

.summary-icon.obligation {
  color: #c8e6c9;
}

.summary-icon.quantity {
  color: #fff3e0;
}

.summary-number {
  font-size: 24px;
  font-weight: 700;
}

.summary-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .rules-cards {
    grid-template-columns: 1fr;
  }

  .rule-config {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-arrow {
    align-self: center;
    transform: rotate(90deg);
  }

  .summary-stats {
    flex-direction: column;
    gap: 16px;
  }

  .rules-tabs {
    flex-direction: column;
  }
}
.feedback-container {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 9999;
  min-width: 220px;
  max-width: 350px;
  pointer-events: none;
}
.feedback-message {
  padding: 14px 20px;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  font-size: 15px;
  pointer-events: all;
}
.feedback-message.success {
  background: #43a047;
}
.feedback-message.error {
  background: #e53935;
}
.feedback-message.info {
  background: #1976d2;
}
</style>
