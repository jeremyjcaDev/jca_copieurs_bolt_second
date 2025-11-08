<template>
  <div class="app">
    <div class="app-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <settings-icon class="logo-icon" />
          <span class="logo-text">Copieur config</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a
          href="#"
          :class="['nav-item', { active: !currentCopieur }]"
          @click="showCopieurList"
        >
          <list-icon class="nav-icon" />
          <span>Liste des copieurs</span>
          <span class="nav-badge">{{ totalCopieurs }}</span>
        </a>

        <div v-if="currentCopieur" class="nav-divider"></div>

        <template v-if="currentCopieur">
          <div class="nav-section">
            <span class="nav-section-title">Copieur actuel</span>
          </div>

          <a
            v-for="tab in editorTabs"
            :key="tab.id"
            href="#"
            :class="['nav-item', { active: selectedTab === tab.id }]"
            @click="setSelectedTab(tab.id)"
          >
            <component :is="tab.icon" class="nav-icon" />
            <span>{{ tab.label }}</span>
            <span v-if="getTabBadge(tab.id)" class="nav-badge">{{
              getTabBadge(tab.id)
            }}</span>
          </a>
        </template>
      </nav>
    </div>

    <main class="app-main">
      <CopieurList v-if="!currentCopieur" />
      <CopieurEditor v-else />
    </main>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters, mapMutations } from "vuex";
import {
  SettingsIcon,
  ListIcon,
  PackageIcon,
  ShieldIcon,
  ImageIcon,
  MonitorIcon,
} from "vue-feather-icons";
import CopieurList from "./components/CopieurList.vue";
import CopieurEditor from "./components/CopieurEditor.vue";

export default Vue.extend({
  name: "App",

  components: {
    CopieurList,
    CopieurEditor,
    SettingsIcon,
    ListIcon,
    PackageIcon,
    ShieldIcon,
    ImageIcon,
    MonitorIcon,
  },

  data() {
    return {
      editorTabs: [
        { id: "general", label: "Général", icon: "settings-icon" },
        { id: "options", label: "Options", icon: "package-icon" },
        { id: "rules", label: "Règles", icon: "shield-icon" },
        { id: "images", label: "Configurations", icon: "image-icon" },
        { id: "preview", label: "Aperçu", icon: "monitor-icon" },
      ],
    };
  },

  computed: {
    ...mapState(["currentCopieur", "selectedTab"]),
    ...mapGetters(["totalCopieurs"]),
  },

  methods: {
    ...mapMutations(["SET_CURRENT_COPIEUR", "SET_SELECTED_TAB"]),

    showCopieurList() {
      this.SET_CURRENT_COPIEUR(null);
    },

    async setSelectedTab(tab) {
      try {
        console.log("Tentative de sauvegarde avant de changer d'onglet...");
        const saveSuccess = await this.$store.dispatch("saveCopieur");
        console.log("Résultat de saveCopieur:", saveSuccess);

        if (saveSuccess) {
          console.log("Sauvegarde réussie. Changement d'onglet en cours...");
          this.SET_SELECTED_TAB(tab);
        } else {
          console.error("La sauvegarde a échoué. L'onglet ne sera pas changé.");
          this.$store.dispatch("showUserMessage", {
            type: "error",
            message: "La sauvegarde a échoué. L'onglet n'a pas été changé.",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        this.$store.dispatch("showUserMessage", {
          type: "error",
          message:
            error.message || "Une erreur est survenue lors de la sauvegarde.",
        });
      }
    },

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
  },
});
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.app-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #1976d2;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  border-right: 3px solid transparent;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #1976d2;
}

.nav-item.active {
  background: #e3f2fd;
  color: #1976d2;
  border-right-color: #1976d2;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.nav-badge {
  background: #e0e0e0;
  color: #666;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  margin-left: auto;
}

.nav-item.active .nav-badge {
  background: #1976d2;
  color: white;
}

.nav-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 16px 24px;
}

.nav-section {
  padding: 8px 24px;
}

.nav-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-main {
  flex: 1;
  background: #f5f5f5;
}

@media (max-width: 1024px) {
  .app-sidebar {
    width: 260px;
  }

  .app-main {
    margin-left: 260px;
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .app-main {
    margin-left: 0;
  }
  /* In a real implementation, you'd add a mobile menu toggle */
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
