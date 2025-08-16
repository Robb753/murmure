import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
  Modal,
  Linking,
} from "react-native";

interface BurgerMenuProps {
  currentTheme?: any;
  router: {
    push: (path: string) => void;
  };
  handleDownloadClick: () => void;
  logoImage?: number;
  forceMode?: "burger" | "nav"; // Permet au parent de forcer le mode
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({
  currentTheme,
  router,
  handleDownloadClick,
  logoImage,
  forceMode,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  // Écouter les changements de taille d'écran
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Protection contre currentTheme undefined - APRÈS les hooks
  if (!currentTheme) {
    return null;
  }

  // Breakpoint responsive - plus petit pour capturer les tablettes
  const shouldShowBurger =
    forceMode === "burger" || (forceMode !== "nav" && screenWidth < 900); // Seuil augmenté pour tablettes

  const logoSize = Platform.OS === "web" ? 100 : 80;

  const handleMenuItemPress = (action: () => void) => {
    setMenuOpen(false);
    // Petit délai pour l'animation
    setTimeout(action, 100);
  };

  // Fonction pour Buy Me a Coffee
  const handleBuyMeACoffee = () => {
    const url = "https://www.buymeacoffee.com/murmureapp";
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <>
      {shouldShowBurger ? (
        // ✅ Version mobile/tablette avec burger menu
        <TouchableOpacity
          style={[
            styles.burgerButton,
            {
              width: logoSize * 0.6, // Plus petit que le logo
              height: logoSize * 0.6,
            },
          ]}
          onPress={() => setMenuOpen(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu de navigation"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.burgerIcon}>
            <View
              style={[
                styles.burgerLine,
                { backgroundColor: currentTheme.text },
              ]}
            />
            <View
              style={[
                styles.burgerLine,
                { backgroundColor: currentTheme.text },
              ]}
            />
            <View
              style={[
                styles.burgerLine,
                { backgroundColor: currentTheme.text },
              ]}
            />
          </View>
        </TouchableOpacity>
      ) : (
        // ✅ Version desktop avec navigation harmonisée
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => router.push("/about")}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="À propos de Murmure"
          >
            <Text
              style={[styles.navText, { color: currentTheme.textSecondary }]}
            >
              À propos
            </Text>
          </TouchableOpacity>

          {/* Bouton Soutenir stylisé */}
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleBuyMeACoffee}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Soutenir le développement de Murmure"
          >
            <Text style={styles.supportButtonText}>☕ Soutenir</Text>
          </TouchableOpacity>

          {/* Boutons adaptés selon la plateforme */}
          {Platform.OS === "web" ? (
            <>
              <TouchableOpacity
                style={[
                  styles.webAppButton,
                  { borderColor: currentTheme.accent },
                ]}
                onPress={() => router.push("/app")}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Utiliser la version web de Murmure"
              >
                <Text
                  style={[
                    styles.webAppButtonText,
                    { color: currentTheme.accent },
                  ]}
                >
                  Version Web
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleDownloadClick}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Télécharger l'application Murmure"
              >
                <Text style={styles.primaryButtonText}>📲 Télécharger</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/app")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Commencer à écrire avec Murmure"
            >
              <Text style={styles.primaryButtonText}>Commencer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Menu modal pour mobile/tablette */}
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
          accessible={true}
          accessibilityLabel="Fermer le menu"
        >
          <View
            style={[
              styles.menu,
              {
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.border,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Bouton de fermeture */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuOpen(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fermer le menu"
            >
              <Text
                style={[
                  styles.closeButtonText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>

            {/* Items du menu */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(() => router.push("/about"))}
              accessible={true}
              accessibilityRole="button"
            >
              <Text style={[styles.menuItemText, { color: currentTheme.text }]}>
                📖 À propos
              </Text>
            </TouchableOpacity>

            {/* Buy Me a Coffee dans le menu mobile */}
            <TouchableOpacity
              style={[styles.menuItem, styles.buyMeACoffeeMenuItem]}
              onPress={() => handleMenuItemPress(handleBuyMeACoffee)}
              accessible={true}
              accessibilityRole="button"
            >
              <Text style={[styles.menuItemText, styles.buyMeACoffeeMenuText]}>
                ☕ Soutenir le projet
              </Text>
            </TouchableOpacity>

            {/* Boutons conditionnels selon la plateforme */}
            {Platform.OS === "web" ? (
              <>
                <TouchableOpacity
                  style={[styles.menuItem, styles.webAppMenuItem]}
                  onPress={() => handleMenuItemPress(() => router.push("/app"))}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: currentTheme.accent, fontWeight: "600" },
                    ]}
                  >
                    🌐 Version Web
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.downloadMenuItem]}
                  onPress={() => handleMenuItemPress(handleDownloadClick)}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: currentTheme.accent, fontWeight: "600" },
                    ]}
                  >
                    📲 Télécharger l&apos;app
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.menuItem, styles.downloadMenuItem]}
                onPress={() => handleMenuItemPress(() => router.push("/app"))}
                accessible={true}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.menuItemText,
                    { color: currentTheme.accent, fontWeight: "600" },
                  ]}
                >
                  ✍️ Commencer à écrire
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Navigation desktop harmonisée
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  // ✅ NOUVEAUX STYLES HARMONISÉS
  aboutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...(Platform.OS === "web" &&
      ({
        transition: "all 0.25s ease",
        cursor: "pointer",
        ":hover": {
          backgroundColor: "rgba(139, 115, 85, 0.08)",
          transform: "translateY(-1px)",
        },
      } as any)),
  },

  supportButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "#FFF8DC",
    borderWidth: 1.5,
    borderColor: "#F4D03F",
    shadowColor: "#F39C12",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...(Platform.OS === "web" &&
      ({
        transition: "all 0.25s ease",
        cursor: "pointer",
        ":hover": {
          backgroundColor: "#FFF3CD",
          borderColor: "#F1C40F",
          transform: "translateY(-1px)",
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
      } as any)),
  },

  supportButtonText: {
    color: "#8B4513",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },

  webAppButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "rgba(139, 115, 85, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(139, 115, 85, 0.3)",
    ...(Platform.OS === "web" &&
      ({
        transition: "all 0.25s ease",
        cursor: "pointer",
        ":hover": {
          backgroundColor: "rgba(139, 115, 85, 0.1)",
          borderColor: "rgba(139, 115, 85, 0.5)",
          transform: "translateY(-1px)",
        },
      } as any)),
  },

  webAppButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },

  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#8B4513",
    shadowColor: "#8B4513",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    ...(Platform.OS === "web" &&
      ({
        transition: "all 0.25s ease",
        cursor: "pointer",
        ":hover": {
          backgroundColor: "#A0522D",
          transform: "translateY(-1px)",
          shadowOpacity: 0.35,
          shadowRadius: 8,
        },
      } as any)),
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },

  navText: {
    fontSize: 15,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
  },

  // Burger menu button amélioré
  burgerButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 8,
    ...(Platform.OS === "web" &&
      ({
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "rgba(139, 115, 85, 0.08)",
        },
      } as any)),
  },
  burgerIcon: {
    width: 22,
    height: 16,
    justifyContent: "space-between",
  },
  burgerLine: {
    height: 2.5,
    width: "100%",
    borderRadius: 2,
  },

  // Modal et menu améliorés
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  menu: {
    borderRadius: 24,
    padding: 28,
    minWidth: 300,
    maxWidth: 340,
    width: "100%",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 30,
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(139, 115, 85, 0.1)",
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },

  menuItem: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500" as const,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Menu items spéciaux
  buyMeACoffeeMenuItem: {
    backgroundColor: "#FFF8DC",
    borderWidth: 2,
    borderColor: "#F4D03F",
  },
  buyMeACoffeeMenuText: {
    color: "#8B4513",
    fontWeight: "600" as const,
  },

  webAppMenuItem: {
    borderWidth: 1.5,
    borderColor: "rgba(139, 115, 85, 0.25)",
    backgroundColor: "rgba(139, 115, 85, 0.05)",
  },

  downloadMenuItem: {
    borderWidth: 1.5,
    borderColor: "#8B4513",
    backgroundColor: "rgba(139, 115, 85, 0.08)",
  },
});

export default BurgerMenu;
