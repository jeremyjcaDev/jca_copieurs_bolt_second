<template>
  <div class="copieur-editor" v-if="currentCopieur">
    <div class="editor-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">
          <arrow-left-icon class="icon" />
          Retour à la liste
        </button>
        <h1 class="editor-title">
          {{ currentCopieur.Copieur.nom_copieur || "Nouveau copieur" }}
        </h1>
      </div>
      <div class="header-actions">
        <button @click="previewCopieur" class="btn btn-secondary">
          <eye-icon class="icon" />
          Aperçu
        </button>
        <button @click="saveCopieur" class="btn btn-primary">
          <save-icon class="icon" />
          Sauvegarder
        </button>
        <button @click="addCopieurToCatalogue" class="btn btn-success">
          <plus-icon class="icon" />
          Ajouter au catalogue
        </button>
      </div>
    </div>

    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="setSelectedTab(tab.id)"
        :class="['tab', { active: selectedTab === tab.id }]"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span v-if="getTabBadge(tab.id)" class="tab-badge">{{
          getTabBadge(tab.id)
        }}</span>
      </button>
    </div>

    <div class="editor-content">
      <GeneralTab v-if="selectedTab === 'general'" />
      <OptionsTab v-if="selectedTab === 'options'" />
      <RulesTab v-if="selectedTab === 'rules'" />
      <ImagesTab v-if="selectedTab === 'images'" />
      <PreviewTab v-if="selectedTab === 'preview'" />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import {
  ArrowLeftIcon,
  SaveIcon,
  EyeIcon,
  SettingsIcon,
  PackageIcon,
  ShieldIcon,
  ImageIcon,
  MonitorIcon,
  PlusIcon, // Ajout de l'icône pour le bouton
} from "vue-feather-icons";
import GeneralTab from "./GeneralTab.vue";
import OptionsTab from "./OptionsTab.vue";
import RulesTab from "./RulesTab.vue";
import ImagesTab from "./ImagesTab.vue";
import PreviewTab from "./PreviewTab.vue";

export default Vue.extend({
  name: "CopieurEditor",
  components: {
    ArrowLeftIcon,
    SaveIcon,
    EyeIcon,
    PlusIcon, // Enregistrement de l'icône
    SettingsIcon,
    PackageIcon,
    ShieldIcon,
    ImageIcon,
    MonitorIcon,
    GeneralTab,
    OptionsTab,
    RulesTab,
    ImagesTab,
    PreviewTab,
  },
  computed: {
    ...mapState(["currentCopieur", "selectedTab"]),

    tabs() {
      return [
        { id: "general", label: "Général", icon: "SettingsIcon" },
        { id: "options", label: "Options & Produits", icon: "PackageIcon" },
        { id: "rules", label: "Règles", icon: "ShieldIcon" },
        { id: "images", label: "Configurations", icon: "ImageIcon" },
        { id: "preview", label: "Aperçu", icon: "MonitorIcon" },
      ];
    },
  },
  methods: {
    ...mapActions([
      "saveCopieur",
      "setSelectedTab",
      "setCurrentCopieur",
      "addCopieurToCatalogue",
    ]),

    getTabBadge(tabId) {
      if (!this.currentCopieur) return "";

      switch (tabId) {
        case "options": {
          return this.currentCopieur.Copieur.options.length.toString();
        }
        case "rules": {
          return this.currentCopieur.Copieur.rules.length.toString();
        }
        case "configurations": {
          return this.currentCopieur.Copieur.configurations.length.toString();
        }
        default: {
          return "";
        }
      }
    },

    previewCopieur() {
      this.setSelectedTab("preview");
    },

    goBack() {
      this.setCurrentCopieur(null);
    },
  },
});
</script>

<style scoped>
.pack-editor {
  background: #f5f5f5;
  min-height: 100vh;
}

.editor-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f0f0f0;
  color: #1976d2;
}

.editor-title {
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

.icon {
  width: 18px;
  height: 18px;
}

.editor-tabs {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  padding: 0 24px;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  color: #1976d2;
  background: #f8f9fa;
}

.tab.active {
  color: #1976d2;
  border-bottom-color: #1976d2;
  background: #f8f9fa;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-badge {
  background: #1976d2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.tab.active .tab-badge {
  background: white;
  color: #1976d2;
}

.editor-content {
  padding: 24px;
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-content {
    justify-content: flex-start;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .editor-tabs {
    overflow-x: auto;
    padding: 0 16px;
  }

  .tab {
    white-space: nowrap;
    padding: 16px 20px;
  }
}
</style>
