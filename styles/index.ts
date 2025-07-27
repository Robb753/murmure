import { commonStyles } from "./common.styles";
import { mainPageStyles } from "./mainPage.styles";
import { modalStyles } from "./modal.styles";
import { sidebarStyles } from "./sidebar.styles";
import { timerStyles } from "./timer.styles";

// Export central de tous les styles
export { commonStyles } from "./common.styles";
export { mainPageStyles } from "./mainPage.styles";
export { timerStyles } from "./timer.styles";
export { sidebarStyles } from "./sidebar.styles";
export { modalStyles } from "./modal.styles";

// Export combiné pour faciliter l'import
export const styles = {
  common: commonStyles,
  mainPage: mainPageStyles,
  timer: timerStyles,
  sidebar: sidebarStyles,
  modal: modalStyles,
};

// Type pour l'autocomplétion
export type StylesType = typeof styles;
