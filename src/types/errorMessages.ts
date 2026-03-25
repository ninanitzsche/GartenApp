/**
 * Zentrale Fehlermeldungen für die App
 * Alle user-freundlichen Fehlermeldungen an einem Ort
 */

export interface AppErrorInfo {
  title: string;
  message: string;
  hint?: string;
  icon?: 'error' | 'warning' | 'info' | 'wifi-off';
}

export type ErrorKey = keyof typeof ERROR_MESSAGES;

export const ERROR_MESSAGES = {
  // Netzwerk
  NETWORK_ERROR: {
    title: 'Keine Verbindung',
    message: 'Bitte überprüfe deine Internetverbindung.',
    hint: 'WLAN oder mobile Daten aktivieren.',
    icon: 'wifi-off',
  },
  TIMEOUT: {
    title: 'Zeitüberschreitung',
    message: 'Der Server antwortet nicht.',
    hint: 'Versuche es in wenigen Sekunden erneut.',
    icon: 'error',
  },

  // Auth
  AUTH_INVALID_CREDENTIALS: {
    title: 'Anmeldung fehlgeschlagen',
    message: 'E-Mail oder Passwort ist falsch.',
    hint: 'Falls du dein Passwort vergessen hast, nutze „Passwort zurücksetzen".',
    icon: 'error',
  },
  AUTH_EMAIL_NOT_CONFIRMED: {
    title: 'E-Mail nicht bestätigt',
    message: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
    hint: 'Schau in deinen Posteingang (auch Spam-Ordner).',
    icon: 'warning',
  },
  AUTH_WEAK_PASSWORD: {
    title: 'Passwort zu schwach',
    message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
    icon: 'warning',
  },
  AUTH_PASSWORDS_DONT_MATCH: {
    title: 'Passwörter stimmen nicht überein',
    message: 'Bitte gib das gleiche Passwort in beiden Feldern ein.',
    icon: 'warning',
  },
  AUTH_PASSWORD_CURRENT_WRONG: {
    title: 'Passwort falsch',
    message: 'Das aktuelle Passwort ist nicht korrekt.',
    icon: 'error',
  },
  AUTH_PASSWORD_CHANGE_FAILED: {
    title: 'Passwort ändern fehlgeschlagen',
    message: 'Das Passwort konnte nicht geändert werden.',
    hint: 'Versuche es erneut oder melde dich ab und wieder an.',
    icon: 'error',
  },
  AUTH_EMAIL_SEND_FAILED: {
    title: 'E-Mail konnte nicht gesendet werden',
    message: 'Die E-Mail zum Zurücksetzen konnte nicht versendet werden.',
    hint: 'Prüfe deine E-Mail-Adresse oder versuche es später erneut.',
    icon: 'error',
  },
  AUTH_SIGNUP_FAILED: {
    title: 'Registrierung fehlgeschlagen',
    message: 'Das Konto konnte nicht erstellt werden.',
    hint: 'Möglicherweise ist die E-Mail-Adresse bereits registriert.',
    icon: 'error',
  },
  AUTH_SIGNOUT_FAILED: {
    title: 'Abmeldung fehlgeschlagen',
    message: 'Die Abmeldung konnte nicht durchgeführt werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },

  // Daten laden
  LOAD_FAILED: {
    title: 'Laden fehlgeschlagen',
    message: 'Die Daten konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_PLANT_FAILED: {
    title: 'Pflanze nicht geladen',
    message: 'Die Pflanzendaten konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_PLANTS_FAILED: {
    title: 'Pflanzen nicht geladen',
    message: 'Die Pflanzenliste konnte nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_TASKS_FAILED: {
    title: 'Aufgaben nicht geladen',
    message: 'Die Aufgaben konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_GARDEN_FAILED: {
    title: 'Garten nicht geladen',
    message: 'Die Gartendaten konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_BED_FAILED: {
    title: 'Beet nicht geladen',
    message: 'Die Beetdaten konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_SHOPPING_FAILED: {
    title: 'Einkaufsliste nicht geladen',
    message: 'Die Einkaufsliste konnte nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_HARVEST_FAILED: {
    title: 'Ernten nicht geladen',
    message: 'Die Erntedaten konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_PHOTOS_FAILED: {
    title: 'Fotos nicht geladen',
    message: 'Die Fotos konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_ARTICLE_FAILED: {
    title: 'Artikel nicht geladen',
    message: 'Der Artikel konnte nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  LOAD_ARTICLES_FAILED: {
    title: 'Artikel nicht geladen',
    message: 'Die Artikel konnten nicht geladen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },

  // Daten speichern/aktualisieren
  SAVE_FAILED: {
    title: 'Speichern fehlgeschlagen',
    message: 'Die Änderungen konnten nicht gespeichert werden.',
    hint: 'Versuche es erneut oder prüfe deine Verbindung.',
    icon: 'error',
  },
  UPDATE_FAILED: {
    title: 'Aktualisierung fehlgeschlagen',
    message: 'Die Änderungen konnten nicht übernommen werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  DELETE_FAILED: {
    title: 'Löschen fehlgeschlagen',
    message: 'Der Eintrag konnte nicht gelöscht werden.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
  NOT_FOUND: {
    title: 'Nicht gefunden',
    message: 'Der Eintrag existiert nicht mehr.',
    hint: 'Möglicherweise wurde er bereits gelöscht.',
    icon: 'info',
  },

  // Validierung
  VALIDATION_REQUIRED: {
    title: 'Fehlende Angaben',
    message: 'Bitte fülle alle erforderlichen Felder aus.',
    icon: 'warning',
  },
  VALIDATION_EMAIL: {
    title: 'Ungültige E-Mail',
    message: 'Bitte gib eine gültige E-Mail-Adresse ein.',
    icon: 'warning',
  },
  VALIDATION_TITLE_TOO_SHORT: {
    title: 'Titel zu kurz',
    message: 'Der Titel muss mindestens 3 Zeichen lang sein.',
    icon: 'warning',
  },
  VALIDATION_PLANT_REQUIRED: {
    title: 'Pflanze fehlt',
    message: 'Bitte wähle eine Pflanze aus.',
    icon: 'warning',
  },
  VALIDATION_AMOUNT_INVALID: {
    title: 'Menge ungültig',
    message: 'Die Menge muss größer als 0 sein.',
    icon: 'warning',
  },
  VALIDATION_UNIT_REQUIRED: {
    title: 'Einheit fehlt',
    message: 'Bitte wähle eine Einheit aus.',
    icon: 'warning',
  },
  VALIDATION_DATE_REQUIRED: {
    title: 'Datum fehlt',
    message: 'Bitte wähle ein Datum aus.',
    icon: 'warning',
  },
  VALIDATION_PHOTO_REQUIRED: {
    title: 'Foto fehlt',
    message: 'Bitte wähle zuerst ein Foto aus.',
    icon: 'warning',
  },

  // AI / Pflanzen-Erkennung
  AI_NETWORK_ERROR: {
    title: 'Keine Verbindung',
    message: 'Die Erkennung benötigt Internet.',
    hint: 'Prüfe deine Verbindung und versuche es erneut.',
    icon: 'wifi-off',
  },
  AI_API_ERROR: {
    title: 'Erkennung fehlgeschlagen',
    message: 'Der Erkennungsdienst ist momentan nicht erreichbar.',
    hint: 'Versuche es in einigen Minuten erneut.',
    icon: 'error',
  },
  AI_NO_RESULTS: {
    title: 'Keine Erkennung',
    message: 'Die Pflanze konnte nicht erkannt werden.',
    hint: 'Probiere ein anderes Foto mit einem klareren Blatt- oder Blütenausschnitt.',
    icon: 'info',
  },
  AI_LOW_CONFIDENCE: {
    title: 'Unsichere Erkennung',
    message: 'Die Erkennung ist nicht sicher genug.',
    hint: 'Ein Foto aus nächster Nähe verbessert das Ergebnis.',
    icon: 'warning',
  },
  AI_RATE_LIMITED: {
    title: 'Zu viele Anfragen',
    message: 'Bitte warte einen Moment.',
    hint: 'Die Erkennung ist auf einige Anfragen pro Tag begrenzt.',
    icon: 'warning',
  },
  AI_INVALID_IMAGE: {
    title: 'Ungültiges Bild',
    message: 'Das Bild konnte nicht verarbeitet werden.',
    hint: 'Versuche ein anderes Foto aufzunehmen.',
    icon: 'warning',
  },

  // Allgemein
  UNKNOWN: {
    title: 'Ein Fehler ist aufgetreten',
    message: 'Etwas ist schiefgelaufen.',
    hint: 'Versuche es erneut.',
    icon: 'error',
  },
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
