import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
  Modal,
} from "react-native";

interface BurgerMenuProps {
  currentTheme?: any;
  router: {
    push: (path: string) => void;
  };
  handleDownloadClick: () => void;
  logoImage?: number;
}

const { width } = Dimensions.get("window");

const BurgerMenu: React.FC<BurgerMenuProps> = ({
  currentTheme,
  router,
  handleDownloadClick,
  logoImage,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Protection contre currentTheme undefined
  if (!currentTheme) {
    return null;
  }

  const logoSize = Platform.OS === "web" ? 100 : 80;

  const handleMenuItemPress = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <>
      {/* Header avec menu burger ou navigation normale */}
      {width > 768 ? (
        // Version desktop avec boutons visibles
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navItem}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="À propos de Murmure"
          >
            <Text
              style={[styles.navText, { color: currentTheme.textSecondary }]}
              onPress={() => router.push("/about")}
            >
              À propos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: currentTheme.accent },
            ]}
            onPress={handleDownloadClick}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Télécharger l'application Murmure"
          >
            <Text style={styles.primaryButtonText}>📲 Télécharger</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Version mobile avec burger menu simple
        <TouchableOpacity
          style={[
            styles.burgerButton,
            {
              width: logoSize,
              height: logoSize,
            },
          ]}
          onPress={() => setMenuOpen(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu"
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
      )}

      {/* Menu modal simple */}
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View
            style={[styles.menu, { backgroundColor: currentTheme.background }]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(() => router.push("/about"))}
            >
              <Text style={[styles.menuItemText, { color: currentTheme.text }]}>
                À propos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(handleDownloadClick)}
            >
              <Text style={[styles.menuItemText, { color: currentTheme.text }]}>
                Télécharger
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Styles existants pour la nav desktop
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navItem: {
    padding: 8,
  },
  navText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },

  // Styles pour le burger menu simplifié
  burgerButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  burgerIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  burgerLine: {
    height: 3,
    width: "100%",
    borderRadius: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    borderRadius: 10,
    padding: 20,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: "500" as const,
    textAlign: "center",
  },
});

export default BurgerMenu;
