<template>
  <div class="general-tab">
    <div class="tab-header">
      <h2 class="tab-title">Informations Générales</h2>
    </div>
    <div class="container-general-tab">
      <div class="general-content">
        <div class="copieur-form">
          <div class="form-section">
            <h3 class="section-title">Configuration du Copieur</h3>

            <div class="form-grid">
              <div class="form-group">
                <label class="label-copieur" for="copieur-name"
                  >Nom du copieur</label
                >
                <input
                  id="copieur-name"
                  v-model="copieur.nom_copieur"
                  type="text"
                  placeholder="Ex: Copieur Bureau Standard"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="label-copieur" for="copieur-title"
                  >Titre du copieur</label
                >
                <input
                  id="copieur-title"
                  v-model="copieur.titre_copieur"
                  type="text"
                  placeholder="Ex: Configuration complète pour bureau"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="copieur-description">Description</label>
              <textarea
                id="copieur-description"
                v-model="copieur.description"
                rows="4"
                placeholder="Décrivez votre copieur..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="copieur.active"
                  type="checkbox"
                  :true-value="1"
                  :false-value="0"
                />
                <span class="checkbox-text">Copieur actif</span>
              </label>
              <p class="field-help">
                Un copieur inactif ne sera pas visible sur le site
              </p>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Tarification et Remises</h3>

            <div class="pricing-tabs">
              <button
                v-for="tab in pricingTabs"
                :key="tab.id"
                @click="activePricingTab = tab.id"
                :class="[
                  'pricing-tab',
                  { active: activePricingTab === tab.id },
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Remise sur le copieur -->
            <div
              v-if="activePricingTab === 'copieur-discount'"
              class="pricing-content"
            >
              <div class="form-grid">
                <div class="form-group">
                  <label class="label-copieur">Type de remise</label>
                  <select
                    v-model="copieur.remise_copieur.type"
                    class="form-input"
                  >
                    <option value="">Aucune remise</option>
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div class="form-group" v-if="copieur.remise_copieur.type">
                  <label class="label-copieur">{{
                    copieur.remise_copieur.type === "percentage"
                      ? "Pourcentage"
                      : "Montant"
                  }}</label>
                  <input
                    v-model.number="copieur.remise_copieur.valeur"
                    type="number"
                    :min="0"
                    :max="
                      copieur.remise_copieur.type === 'percentage'
                        ? 100
                        : undefined
                    "
                    :step="
                      copieur.remise_copieur.type === 'percentage' ? 1 : 0.01
                    "
                    class="form-input"
                  />
                </div>
              </div>
              <div class="form-group" v-if="copieur.remise_copieur.type">
                <label class="label-copieur">Description de la remise</label>
                <input
                  v-model="copieur.remise_copieur.description"
                  type="text"
                  placeholder="Ex: Remise de lancement"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Remise globale produits -->
            <div
              v-if="activePricingTab === 'global-discount'"
              class="pricing-content"
            >
              <div class="form-grid">
                <div class="form-group">
                  <label class="label-copieur">Type de remise globale</label>
                  <select
                    v-model="copieur.remise_globale.type"
                    class="form-input"
                  >
                    <option value="">Aucune remise globale</option>
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe par produit (€)</option>
                  </select>
                </div>
                <div class="form-group" v-if="copieur.remise_globale.type">
                  <label class="label-copieur">{{
                    copieur.remise_globale.type === "percentage"
                      ? "Pourcentage"
                      : "Montant par produit"
                  }}</label>
                  <input
                    v-model.number="copieur.remise_globale.valeur"
                    type="number"
                    :min="0"
                    :max="
                      copieur.remise_globale.type === 'percentage'
                        ? 100
                        : undefined
                    "
                    :step="
                      copieur.remise_globale.type === 'percentage' ? 1 : 0.01
                    "
                    class="form-input"
                  />
                </div>
              </div>
              <div class="form-group" v-if="copieur.remise_globale.type">
                <label class="label-copieur"
                  >Description de la remise globale</label
                >
                <input
                  v-model="copieur.remise_globale.description"
                  type="text"
                  placeholder="Ex: Remise volume sur tous les produits"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Prix par groupe de clients -->
            <div
              v-if="activePricingTab === 'customer-groups'"
              class="pricing-content"
            >
              <div class="customer-groups-header">
                <p class="section-description">
                  Définissez des prix spécifiques pour chaque groupe de clients
                </p>
                <button
                  @click="addCustomerGroupPrice"
                  class="btn btn-secondary btn-small"
                >
                  Ajouter un groupe
                </button>
              </div>

              <div class="customer-groups-list">
                <div
                  v-for="(groupPrice, index) in copieur.prix_groupes_clients"
                  :key="index"
                  class="customer-group-item"
                >
                  <div class="group-config">
                    <div class="form-group">
                      <label class="label-copieur">Groupe de clients</label>
                      <select v-model="groupPrice.groupe_id" class="form-input">
                        <option value="">Sélectionner un groupe</option>
                        <option
                          v-for="group in customerGroups"
                          :key="group.id"
                          :value="group.id"
                        >
                          {{ group.nom }}
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="label-copieur">Type de modification</label>
                      <select v-model="groupPrice.type" class="form-input">
                        <option value="percentage_discount">Remise en %</option>
                        <option value="fixed_discount">Remise fixe (€)</option>
                        <option value="percentage_markup">
                          Majoration en %
                        </option>
                        <option value="fixed_price">Prix fixe (€)</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="label-copieur">{{
                        getPricingLabel(groupPrice.type)
                      }}</label>
                      <input
                        v-model.number="groupPrice.valeur"
                        type="number"
                        :min="0"
                        :step="
                          groupPrice.type.includes('percentage') ? 1 : 0.01
                        "
                        class="form-input"
                      />
                    </div>
                  </div>

                  <button
                    @click="removeCustomerGroupPrice(index)"
                    class="btn-remove"
                  >
                    <trash-2-icon class="icon-small" />
                  </button>
                </div>

                <div
                  v-if="copieur.prix_groupes_clients.length === 0"
                  class="empty-groups"
                >
                  <p>Aucun prix spécifique configuré</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="general-content">
        <div class="form-section">
          <h3 class="section-title">Statistiques du copieur</h3>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon options">
                <settings-icon class="icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ copieur.options.length }}</div>
                <div class="stat-label">Options configurées</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon products">
                <package-icon class="icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ copieur.produits.length }}</div>
                <div class="stat-label">Produits ajoutés</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon images">
                <image-icon class="icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  {{ copieur.configurations.length }}
                </div>
                <div class="stat-label">Images mappées</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon price">
                <dollar-sign-icon class="icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatPrice(totalPrice) }}</div>
                <div class="stat-label">Prix de base</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import {
  SettingsIcon,
  PackageIcon,
  ImageIcon,
  DollarSignIcon,
} from "vue-feather-icons";

export default Vue.extend({
  name: "GeneralTab",
  components: {
    SettingsIcon,
    PackageIcon,
    ImageIcon,
    DollarSignIcon,
  },
  data() {
    return {
      activePricingTab: "copieur-discount",
      pricingTabs: [
        { id: "copieur-discount", label: "Remise Copieur" },
        { id: "global-discount", label: "Remise Globale" },
        { id: "customer-groups", label: "Prix par Groupe" },
      ],
      customerGroups: [
        { id: 1, nom: "Client par défaut" },
        { id: 2, nom: "Client en compte" },
        { id: 3, nom: "Client EMEIS" },
        { id: 4, nom: "Client VIP" },
        { id: 5, nom: "Client Professionnel" },
      ],
    };
  },
  created() {
    const copieur = this.currentCopieur?.Copieur || {};

    if (copieur.active === undefined) {
      Vue.set(copieur, "active", 1);
    }
    if (!copieur.nom_copieur) {
      Vue.set(copieur, "nom_copieur", "");
    }
    if (!copieur.titre_copieur) {
      Vue.set(copieur, "titre_copieur", "");
    }
    if (!copieur.description) {
      Vue.set(copieur, "description", "");
    }
    if (!copieur.remise_copieur) {
      Vue.set(copieur, "remise_copieur", {
        type: "",
        valeur: 0,
        description: "",
      });
    }
    if (!copieur.remise_globale) {
      Vue.set(copieur, "remise_globale", {
        type: "",
        valeur: 0,
        description: "",
      });
    }
    if (!copieur.prix_groupes_clients) {
      Vue.set(copieur, "prix_groupes_clients", []);
    }
  },
  computed: {
    ...mapState(["currentCopieur"]),
    ...mapGetters(["calculateCopieurPriceFromState"]),

    copieur() {
      return this.currentCopieur?.Copieur || {};
    },
    totalPrice() {
      if (!this.copieur) return 0;
      return this.calculateCopieurPriceFromState(this.copieur);
    },
  },
  methods: {
    setSelectedTab(tab) {
      this.$store.commit("SET_SELECTED_TAB", tab);
    },

    formatPrice(price) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    },

    goToOptions() {
      this.setSelectedTab("options");
    },

    goToRules() {
      this.setSelectedTab("rules");
    },

    goToImages() {
      this.setSelectedTab("images");
    },
  },
});
</script>

<style scoped>
.general-tab {
  max-width: 1000px;
}

.tab-header {
  margin-bottom: 32px;
}

.tab-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.container-general-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.general-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.copieur-form {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #1976d2;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
}

.form-group .label-copieur {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #e3f2fd;
  border-color: #1976d2;
}

.checkbox-text {
  color: #333;
  font-weight: 500;
}

.field-help {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0;
}

.copieur-preview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #eee;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #d32f2f;
}

.preview-title {
  color: #666;
  margin: 0 0 16px;
  font-size: 14px;
}

.preview-description {
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  min-height: 60px;
}

.preview-stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
}

.pricing-tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  text-align: center;
}

.pricing-tab.active {
  background: white;
  color: #1976d2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pricing-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eee;
}

.customer-groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-description {
  color: #666;
  margin: 0;
  font-size: 14px;
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

.btn-secondary {
  background: white;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.btn-secondary:hover {
  background: #1976d2;
  color: white;
}

.btn-small {
  padding: 6px 12px;
  font-size: 14px;
}

.customer-groups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.customer-group-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.group-config {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
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

.icon-small {
  width: 16px;
  height: 16px;
}

.empty-groups {
  text-align: center;
  padding: 32px;
  color: #999;
}

@media (max-width: 768px) {
  .copieur-form {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .general-content {
    padding: 24px;
  }

  .pricing-tabs {
    flex-direction: column;
  }

  .group-config {
    grid-template-columns: 1fr;
  }

  .customer-group-item {
    flex-direction: column;
  }
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eee;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.options {
  background: #e3f2fd;
  color: #1976d2;
}
.stat-icon.products {
  background: #e8f5e8;
  color: #2e7d32;
}
.stat-icon.images {
  background: #fff3e0;
  color: #f57c00;
}
.stat-icon.price {
  background: #f3e5f5;
  color: #7b1fa2;
}

.icon {
  width: 24px;
  height: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  color: #666;
}
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .form-section {
    padding: 16px;
  }
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
</style>
