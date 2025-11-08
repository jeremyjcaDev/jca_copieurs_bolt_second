<template>
  <div class="copieur-list">
    <div class="header">
      <h1 class="title">Liste des copieurs</h1>
      <div class="actions">
        <button @click="importCopieur" class="btn btn-secondary">
          <upload-icon class="icon" />
          Importer
        </button>
        <button @click="createCopieur()" class="btn btn-primary">
          <plus-icon class="icon" />
          Nouveau copieur
        </button>
      </div>
    </div>

    <h2 class="title">Copieurs actifs</h2>
    <div class="copieur-grid" v-if="copieursActifs.length > 0">
      <div v-for="copieur in copieursActifs" :key="copieur.id" class="copieur-card">
        <div class="copieur-card-header">
          <h3 class="copieur-name">{{ copieur.Copieur.nom_copieur }}</h3>
          <div class="copieur-actions">
            <button @click="exportCopieurData(copieur)" class="btn-icon" title="Exporter"><download-icon class="icon-small" /></button>
            <button @click="duplicateCopieur(copieur)" class="btn-icon" title="Dupliquer"><copy-icon class="icon-small" /></button>
            <button @click="editCopieur(copieur)" class="btn-icon" title="Éditer"><edit-icon class="icon-small" /></button>
            <button @click="deleteCopieurConfirm(copieur)" class="btn-icon" title="Supprimer"><trash-2-icon class="icon-small" /></button>
          </div>
        </div>
        <div class="copieur-card-content">
          <p class="copieur-title">{{ copieur.Copieur.titre_copieur }}</p>
          <div class="copieur-stats">
            <div class="stat"><settings-icon class="icon-small" /><span>{{ copieur.Copieur.options.length }} options</span></div>
            <div class="stat"><package-icon class="icon-small" /><span>{{ copieur.Copieur.produits.length }} produits</span></div>
            <div class="stat"><image-icon class="icon-small" /><span>{{ copieur.Copieur.configurations.length }} configurations</span></div>
          </div>
          <div class="copieur-price"><span class="price-label">Prix de base:</span><span class="price-value">{{ formatPrice(getCopieurPrice(copieur)) }}</span></div>
        </div>
        <div class="copieur-card-footer"><span class="date">Modifié le {{ formatDate(copieur.updated_at) }}</span></div>
      </div>
    </div>
    <div v-else class="empty-state"><h3>Aucun copieur actif</h3></div>

    <h2 class="title" style="margin-top:32px;">Copieurs inactifs</h2>
    <div class="copieur-grid" v-if="copieursInactifs.length > 0">
      <div v-for="copieur in copieursInactifs" :key="copieur.id" class="copieur-card">
        <div class="copieur-card-header">
          <h3 class="copieur-name">{{ copieur.Copieur.nom_copieur }}</h3>
          <div class="copieur-actions">
            <button @click="exportCopieurData(copieur)" class="btn-icon" title="Exporter"><download-icon class="icon-small" /></button>
            <button @click="duplicateCopieur(copieur)" class="btn-icon" title="Dupliquer"><copy-icon class="icon-small" /></button>
            <button @click="editCopieur(copieur)" class="btn-icon" title="Éditer"><edit-icon class="icon-small" /></button>
            <button @click="deleteCopieurConfirm(copieur)" class="btn-icon" title="Supprimer"><trash-2-icon class="icon-small" /></button>
          </div>
        </div>
        <div class="copieur-card-content">
          <p class="copieur-title">{{ copieur.Copieur.titre_copieur }}</p>
          <div class="copieur-stats">
            <div class="stat"><settings-icon class="icon-small" /><span>{{ copieur.Copieur.options.length }} options</span></div>
            <div class="stat"><package-icon class="icon-small" /><span>{{ copieur.Copieur.produits.length }} produits</span></div>
            <div class="stat"><image-icon class="icon-small" /><span>{{ copieur.Copieur.configurations.length }} configurations</span></div>
          </div>
          <div class="copieur-price"><span class="price-label">Prix de base:</span><span class="price-value">{{ formatPrice(getCopieurPrice(copieur)) }}</span></div>
        </div>
        <div class="copieur-card-footer"><span class="date">Modifié le {{ formatDate(copieur.updated_at) }}</span></div>
      </div>
    </div>
    <div v-else class="empty-state"><h3>Aucun copieur inactif</h3></div>

    <div v-if="copieursActifs.length === 0 && copieursInactifs.length === 0" class="empty-state">
      <package-icon class="empty-icon" />
      <h2>Aucun copieur configuré</h2>
      <p>Créez votre premier produit pour commencer</p>
      <button @click="createCopieur()" class="btn btn-primary">
        <plus-icon class="icon" />
        Créer un copieur
      </button>
    </div>

    <!-- Import Modal -->
    <div
      v-if="showImportModal"
      class="modal-overlay"
      @click="showImportModal = false"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Importer un copieur</h3>
          <button @click="showImportModal = false" class="btn-icon">
            <x-icon class="icon-small" />
          </button>
        </div>
        <div class="modal-content">
          <label for="json-input">Collez le JSON du copieur :</label>
          <textarea
            id="json-input"
            v-model="importData"
            rows="10"
            placeholder="Collez votre JSON ici..."
            class="import-textarea"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button @click="showImportModal = false" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="handleImport" class="btn btn-primary">
            Importer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import {
  PlusIcon,
  UploadIcon,
  DownloadIcon,
  CopyIcon,
  EditIcon,
  Trash2Icon,
  SettingsIcon,
  PackageIcon,
  ImageIcon,
  XIcon,
} from "vue-feather-icons";

export default Vue.extend({
  name: "CopieurList",
  components: {
    PlusIcon,
    UploadIcon,
    DownloadIcon,
    CopyIcon,
    EditIcon,
    Trash2Icon,
    SettingsIcon,
    PackageIcon,
    ImageIcon,
    XIcon,
  },
  data() {
    return {
      showImportModal: false,
      importData: "",
    };
  },
  computed: {
    ...mapState(["copieurs"]),
    ...mapGetters(["calculateCopieurPriceFromState"]),
    copieursActifs() {
      return this.copieurs.filter(c => c.Copieur.active === 1);
    },
    copieursInactifs() {
      return this.copieurs.filter(c => c.Copieur.active !== 1);
    },
  },
  methods: {
    loadCopieurs() {
      this.$store.dispatch("loadCopieurs");
console.log("Copieurs loaded:", JSON.parse(JSON.stringify(this.copieurs)));      
    },

    createCopieur() {
      this.$store.dispatch("createCopieur");
    },

    duplicateCopieur(copieur) {
      this.$store.dispatch("duplicateCopieur", copieur);
    },

    editCopieur(copieur) {
      this.$store.dispatch("editCopieur", copieur);
    },

    deleteCopieur(id) {
      this.$store.dispatch("deleteCopieur", id);
    },

    exportCopieur(copieur) {
      return this.$store.dispatch("exportCopieur", copieur);
    },

    importCopieur(data) {
      return this.$store.dispatch("importCopieur", data);
    },

    formatPrice(price) {
      if (typeof price !== "number" || isNaN(price)) {
        return "0,00 €";
      }
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    },

    getCopieurPrice(copieur) {
      if (!copieur || !copieur.Copieur) return 0;
      return this.calculateCopieurPriceFromState(copieur.Copieur);
    },
    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("fr-FR");
    },

    exportCopieurData(copieur) {
      const jsonData = this.exportCopieur(copieur);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `copieur-${copieur.Copieur.nom_copieur.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importCopieurHandler() {
      this.showImportModal = true;
      this.importData = "";
    },

    handleImport() {
      const result = this.importCopieur(this.importData);
      if (result) {
        this.showImportModal = false;
        this.importData = "";
      } else {
        alert("Erreur lors de l'import. Vérifiez le format JSON.");
      }
    },

    deleteCopieurConfirm(copieur) {
      if (
        confirm(
          `Êtes-vous sûr de vouloir supprimer le copieur "${copieur.Copieur.nom_copieur}" ?`
        )
      ) {
        this.deleteCopieur(copieur.id);
      }
    },
  },

  mounted() {
    this.loadCopieurs();
    console.log("Copieurs loaded:", JSON.parse(JSON.stringify(this.copieurs)));      

  },
});
</script>

<style scoped>
.copieur-list {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.actions {
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
  text-decoration: none;
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

.btn-secondary:hover {
  background: #f3f9ff;
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

.btn-danger:hover {
  background: #ffebee;
  color: #d32f2f;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.copieur-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.copieur-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: hidden;
}

.copieur-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.copieur-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0;
}

.copieur-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.copieur-actions {
  display: flex;
  gap: 4px;
}

.copieur-card-content {
  padding: 16px 20px;
}

.copieur-title {
  color: #666;
  margin: 0 0 16px;
  line-height: 1.5;
}

.copieur-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.copieur-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.price-label {
  font-size: 14px;
  color: #666;
}

.price-value {
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
}

.copieur-card-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.date {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin: 0 auto 24px;
}

.empty-state h2 {
  font-size: 24px;
  color: #666;
  margin: 0 0 8px;
}

.empty-state p {
  color: #999;
  margin: 0 0 32px;
}

.modal-overlay {
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

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-content {
  padding: 20px;
}

.modal-content label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.import-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .copieur-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
