import Vue from "vue";
import Vuex from "vuex";
import apiService, { showUserMessage } from "../services/api";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    copieurs: [],
    currentCopieur: null,
    loading: false,
    selectedTab: "general",
  },

  getters: {
    totalCopieurs: (state) => state.copieurs.length,

    calculateCopieurPriceFromState: () => (copieur) => {
      let total = 0;
      if (copieur && copieur.produits) {
        copieur.produits.forEach((product) => {
          const basePrice = product.price || 0;
          const variationPrice = product.variation_price || 0;
          total += basePrice + variationPrice;
        });
      }
      return total;
    },
  },

  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_COPIEURS(state, copieurs) {
      state.copieurs = copieurs;
    },
    SET_CURRENT_COPIEUR(state, copieur) {
      state.currentCopieur = copieur;
    },
    SET_SELECTED_TAB(state, tab) {
      state.selectedTab = tab;
    },
    ADD_COPIEUR(state, copieur) {
      console.log("Ajout du copieur :", copieur);
      state.copieurs.push(copieur);
    },
    UPDATE_COPIEUR(state, copieur) {
      const index = state.copieurs.findIndex((c) => c.id === copieur.id);
      if (index >= 0) {
        Vue.set(state.copieurs, index, copieur);
      }
    },
    DELETE_COPIEUR(state, id) {
      state.copieurs = state.copieurs.filter((c) => c.id !== id);
    },
    ADD_OPTION(state, option) {
      if (state.currentCopieur?.Copieur?.options) {
        state.currentCopieur.Copieur.options = [
          ...state.currentCopieur.Copieur.options,
          option,
        ];
      }
    },
    DELETE_OPTION(state, optionId) {
      if (state.currentCopieur?.Copieur?.options) {
        state.currentCopieur.Copieur.options =
          state.currentCopieur.Copieur.options.filter(
            (option) => option.id !== optionId
          );
      }
    },
    ADD_COPIEUR_RULE(state, rule) {
      if (state.currentCopieur?.Copieur?.rules) {
        state.currentCopieur.Copieur.rules = [
          ...state.currentCopieur.Copieur.rules,
          rule,
        ];
      }
    },
    DELETE_RULE(state, ruleId) {
      if (state.currentCopieur?.Copieur?.rules) {
        state.currentCopieur.Copieur.rules =
          state.currentCopieur.Copieur.rules.filter(
            (rule) => rule.id !== ruleId
          );
      }
    },
    DELETE_PRODUCT(state, productId) {
      if (state.currentCopieur?.Copieur?.produits) {
        // On supprime le produit du tableau produits du copieur courant en utilisant l'identifiant unique correct
        state.currentCopieur.Copieur.produits =
          state.currentCopieur.Copieur.produits.filter(
            (product) => product.id_product_copieur !== productId
          );
      }
    },
    REMOVE_PRODUCT_FROM_OPTION(state, { optionId, productId }) {
      const option = state.currentCopieur.options.find(
        (opt) => opt.id === optionId
      );
      if (option) {
        option.id_produit_selectionne = option.id_produit_selectionne.filter(
          (id) => id !== productId
        );
      }
    },
  },

  actions: {
    async loadCopieurs({ commit }) {
      commit("SET_LOADING", true);
      try {
        const copieurs = await apiService.getCopieurs();
        commit("SET_COPIEURS", copieurs.data);
      } catch (error) {
        console.error("Erreur lors du chargement des copieurs:", error);
        // En cas d'erreur, afficher une liste vide
        commit("SET_COPIEURS", []);
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async addCopieurToCatalogue({ commit, state }) {
      if (!state.currentCopieur) return;
      const copieur = { ...state.currentCopieur };

      // Validation des champs requis
      if (!copieur.Copieur.nom_copieur || !copieur.Copieur.titre_copieur) {
        showUserMessage({
          type: "error",
          message: "Veuillez remplir les champs Nom et Titre du copieur.",
        });
      }
      // Exemple d'appel à une action Vuex ou API
      try {
        const existingIndex = state.copieurs.findIndex(
          (c) => c.id === copieur.id
        );
        let response;

        if (existingIndex >= 0) {
          // Mise à jour d'un copieur existant
          response = await apiService.addCopieurToCatalogue(copieur.id);
          if (response && response.success) {
            commit("UPDATE_COPIEUR", copieur);
          }
        }

        showUserMessage({
          type: response && response.success ? "success" : "error",
          message:
            response && response.message
              ? response.message
              : response && response.success
              ? "Copieur sauvegardé dans le catalogue avec succès."
              : "Erreur lors de la sauvegarde du copieur dans le catalogue.",
        });

        // commit("SET_CURRENT_COPIEUR", null);

        if (response && response.success) {
          return true;
        } else {
          throw new Error(
            response && response.message
              ? response.message
              : "Erreur lors de la sauvegarde du copieur."
          );
        }
      } catch (error) {
        showUserMessage({
          type: "error",
          message:
            error.message ||
            "Erreur lors de la sauvegarde du copieur dans le catalogue.",
        });
        throw error;
      }
    },
    async saveCopieur({ commit, state }) {
      console.log("Action saveCopieur déclenchée");
      console.log("État actuel du copieur :", state.currentCopieur);
      if (!state.currentCopieur) return;

      const copieur = { ...state.currentCopieur };

      // Validation des champs requis
      if (!copieur.Copieur.nom_copieur || !copieur.Copieur.titre_copieur) {
        showUserMessage({
          type: "error",
          message: "Veuillez remplir les champs Nom et Titre du copieur.",
        });
      }

      copieur.updated_at = new Date().toISOString();

      try {
        const existingIndex = state.copieurs.findIndex(
          (c) => c.id === copieur.id
        );
        let response;

        if (existingIndex >= 0) {
          // Mise à jour d'un copieur existant
          response = await apiService.updateCopieur(copieur.id, copieur);
          if (response && response.success) {
            console.log("Réponse de l'API après mise à jour :", response);
            commit("SET_CURRENT_COPIEUR", response.data); // Mise à jour de state.currentCopieur
            console.log(
              "État Apres enregistrement du copieur :",
              state.currentCopieur
            );
          }
        } else {
          // Création d'un nouveau copieur
          response = await apiService.createCopieur(copieur);
          if (response && response.data) {
            copieur.id = response.data.id;
            console.log("Réponse de l'API après création :", response);
            commit("SET_CURRENT_COPIEUR", copieur); // Met à jour currentCopieur avec le nouvel ID
            console.log(
              "État Apres enregistrement du copieur :",
              state.currentCopieur
            );
          }
          if (response && response.success) {
            commit("ADD_COPIEUR", copieur);
          }
        }

        showUserMessage({
          type: response && response.success ? "success" : "error",
          message:
            response && response.message
              ? response.message
              : response && response.success
              ? "Copieur sauvegardé avec succès."
              : "Erreur lors de la sauvegarde du copieur.",
        });

        // commit("SET_CURRENT_COPIEUR", null);

        if (response && response.success) {
          return true;
        } else {
          throw new Error(
            response && response.message
              ? response.message
              : "Erreur lors de la sauvegarde du copieur."
          );
        }
      } catch (error) {
        showUserMessage({
          type: "error",
          message: error.message || "Erreur lors de la sauvegarde du copieur.",
        });
        throw error;
      }
    },
    async deleteCopieur({ commit }, id) {
      try {
        const response = await apiService.deleteCopieur(id);
        if (response && response.success) {
          showUserMessage({
            type: "success",
            message: response.message || "Copieur supprimé avec succès.",
          });
          commit("DELETE_COPIEUR", id);
          return true;
        } else {
          showUserMessage({
            type: "error",
            message: response.error || "Erreur lors de la suppression.",
          });
        }
      } catch (error) {
        showUserMessage({
          type: "error",
          message: error.message || "Erreur lors de la suppression.",
        });
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }
    },
    async searchProducts(_, { query, limit = 50, category = null }) {
      try {
        return await apiService.searchProducts(query, limit, category);
      } catch (error) {
        console.error("Erreur lors de la recherche de produits:", error);
        return [];
      }
    },
    async fetchProductDetails(_, product) {
      try {
        const response = await apiService.getProductDetails(
          product.productId,
          product.productAttributeId || 0
        );

        if (response && response.success) {
          showUserMessage({
            type: "success",
            message:
              response.message || "Détails du produit récupérés avec succès.",
          });
          return response.data; // Retourner les données du produit
        } else {
          const errorMessage =
            response?.message ||
            "Erreur lors de la récupération des détails du produit.";
          showUserMessage({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage =
          error.message ||
          "Erreur inattendue lors de la récupération des détails du produit.";
        showUserMessage({
          type: "error",
          message: errorMessage,
        });
        console.error("Erreur pour la requête fetchProductDetails :", error);
        throw error;
      }
    },
    async deleteOption({ commit }, optionId) {
      try {
        const response = await apiService.deleteOption(optionId);

        if (response && response.success) {
          showUserMessage({
            type: "success",
            message: response.message || "Option supprimée avec succès.",
          });
          commit("DELETE_OPTION", optionId);
          return true;
        } else {
          const errorMessage =
            response?.message || "Erreur lors de la suppression de l'option.";
          showUserMessage({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage =
          error.message ||
          "Erreur inattendue lors de la suppression de l'option.";
        showUserMessage({
          type: "error",
          message: errorMessage,
        });
        console.error("Erreur lors de la suppression de l'option :", error);
        throw error;
      }
    },
    async deleteRule({ commit }, ruleId) {
      try {
        const response = await apiService.deleteRule(ruleId);

        if (response && response.success) {
          showUserMessage({
            type: "success",
            message: response.message || "Règle supprimée avec succès.",
          });
          commit("DELETE_RULE", ruleId);
          return true;
        } else {
          const errorMessage =
            response?.message || "Erreur lors de la suppression de la règle.";
          showUserMessage({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage =
          error.message ||
          "Erreur inattendue lors de la suppression de la règle.";
        showUserMessage({
          type: "error",
          message: errorMessage,
        });
        console.error("Erreur lors de la suppression de la règle :", error);
        throw error;
      }
    },
    async deleteProduct({ commit }, productIdCopieur) {
      try {
        const response = await apiService.deleteProduct(productIdCopieur);

        if (response && response.success) {
          showUserMessage({
            type: "success",
            message: response.message || "Produit supprimé avec succès.",
          });
          commit("DELETE_PRODUCT", productIdCopieur);
          return true;
        } else {
          const errorMessage =
            response?.message || "Erreur lors de la suppression du produit.";
          showUserMessage({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage =
          error.message ||
          "Erreur inattendue lors de la suppression du produit.";
        showUserMessage({
          type: "error",
          message: errorMessage,
        });
        console.error("Erreur lors de la suppression du produit :", error);
        throw error;
      }
    },
    createCopieur({ commit }) {
      const newCopieur = {
        id: Date.now(),
        Copieur: {
          nom_copieur: "",
          titre_copieur: "",
          active: 0,
          options: [],
          produits: [],
          rules: [],
          configurations: [],
          remise_copieur: [
            {
              description: "",
              type: "",
              value: 0,
            },
          ],
          remise_globale: [
            {
              description: "",
              type: "",
              value: 0,
            },
          ],
          prix_groupes_clients: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      commit("SET_CURRENT_COPIEUR", newCopieur);
      commit("SET_SELECTED_TAB", "general");
    },
    editCopieur({ commit }, copieur) {
      commit("SET_CURRENT_COPIEUR", { ...copieur });
      commit("SET_SELECTED_TAB", "general");
    },

    duplicateCopieur({ commit }, copieur) {
      const duplicated = {
        ...copieur,
        id: Date.now(),
        Copieur: {
          ...copieur.Copieur,
          nom_copieur: `${copieur.Copieur.nom_copieur} (Copie)`,
          titre_copieur: `${copieur.Copieur.titre_copieur} (Copie)`,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      commit("ADD_COPIEUR", duplicated);
    },
    calculateCopieurPrice({ configuration }) {
      let total = 0;
      if (configuration && configuration.produits) {
        configuration.produits.forEach((product) => {
          const basePrice = product.price || 0;
          const variationPrice = product.variation_price || 0;
          total += basePrice + variationPrice;
        });
      }
      return total;
    },
    exportCopieur(_, copieur) {
      return JSON.stringify({ Copieur: copieur.Copieur }, null, 2);
    },
    importCopieur({ commit }, jsonData) {
      try {
        const data = JSON.parse(jsonData);
        if (!data.Copieur) throw new Error("Invalid copieur format");

        const newCopieur = {
          id: Date.now(),
          Copieur: data.Copieur,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        commit("ADD_COPIEUR", newCopieur);
        return newCopieur;
      } catch (error) {
        console.error("Import error:", error);
        return null;
      }
    },
    async setSelectedTab({ commit, dispatch }, tab) {
      try {
        // Tenter de sauvegarder avant de changer d'onglet
        const saveSuccess = await dispatch("saveCopieur");

        if (saveSuccess) {
          commit("SET_SELECTED_TAB", tab);
        } else {
          showUserMessage({
            type: "error",
            message: "La sauvegarde a échoué. L'onglet n'a pas été changé.",
          });
        }
      } catch (error) {
        showUserMessage({
          type: "error",
          message:
            error.message || "Une erreur est survenue lors de la sauvegarde.",
        });
      }
    },
    setCurrentCopieur({ commit }, copieur) {
      commit("SET_CURRENT_COPIEUR", copieur);
    },
  },
});
// Watcher pour détecter les changements dans les options de `currentCopieur`
// store.watch(
//   (state) => state.currentCopieur?.Copieur?.options || [], // Retourne un tableau vide si options est undefined
//   (newOptions, oldOptions) => {
//     console.log("🔄 Les options ont changé :", { newOptions, oldOptions });

//     // Vérifie que newOptions et oldOptions sont des tableaux
//     if (Array.isArray(newOptions) && Array.isArray(oldOptions)) {
//       console.log("newOptions.length:", newOptions.length);
//       console.log("oldOptions.length:", oldOptions.length);

//       // Détecter si une option a été ajoutée
//       if (newOptions.length > oldOptions.length) {
//         console.log("➕ Une nouvelle option a été ajoutée !");
//         store.dispatch("saveCopieur"); // Déclencher la sauvegarde
//       }
//     }
//   },
//   { deep: true } // Observer les changements profonds dans les options
// );
export default store;
