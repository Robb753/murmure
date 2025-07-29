import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  parseISO,
} from "date-fns";

export interface DateDisplayOptions {
  showTime?: boolean;
  showYear?: boolean;
  relative?: boolean; // Affichage relatif (aujourd'hui, hier, etc.)
  fullFormat?: boolean; // Format complet JJ MM AAAA
}

// Noms des mois en français
const FRENCH_MONTHS = [
  "jan",
  "fév",
  "mar",
  "avr",
  "mai",
  "juin",
  "juil",
  "août",
  "sep",
  "oct",
  "nov",
  "déc",
];

// Noms des jours en français
const FRENCH_DAYS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

export const formatEntryDate = (
  date: Date | string,
  options: DateDisplayOptions = {}
): string => {
  const {
    showTime = false,
    showYear = true,
    relative = true,
    fullFormat = false,
  } = options;

  // Convertir string en Date si nécessaire
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) {
    return "date invalide";
  }

  // Format complet demandé
  if (fullFormat) {
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = FRENCH_MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const time = showTime ? ` à ${format(dateObj, "HH:mm")}` : "";
    return `${day} ${month} ${year}${time}`;
  }

  // Affichage relatif
  if (relative) {
    if (isToday(dateObj)) {
      return showTime
        ? `aujourd'hui à ${format(dateObj, "HH:mm")}`
        : "aujourd'hui";
    }

    if (isYesterday(dateObj)) {
      return showTime ? `hier à ${format(dateObj, "HH:mm")}` : "hier";
    }

    const daysDiff = differenceInDays(new Date(), dateObj);
    if (daysDiff <= 7) {
      const dayName = FRENCH_DAYS[dateObj.getDay()];
      const time = showTime ? ` à ${format(dateObj, "HH:mm")}` : "";
      return `${dayName}${time}`;
    }
  }

  // Format standard
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = FRENCH_MONTHS[dateObj.getMonth()];
  const year =
    showYear || dateObj.getFullYear() !== new Date().getFullYear()
      ? ` ${dateObj.getFullYear()}`
      : "";
  const time = showTime ? ` à ${format(dateObj, "HH:mm")}` : "";

  return `${day} ${month}${year}${time}`;
};

// Fonction pour obtenir une couleur basée sur l'âge de l'entrée
export const getDateColorIntensity = (date: Date | string): number => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const daysDiff = differenceInDays(new Date(), dateObj);

  if (daysDiff === 0) return 1; // Aujourd'hui - intensité max
  if (daysDiff === 1) return 0.8; // Hier
  if (daysDiff <= 7) return 0.6; // Cette semaine
  if (daysDiff <= 30) return 0.4; // Ce mois
  return 0.2; // Plus ancien
};
