"""User-facing texts in German and English.

The code itself is English throughout; everything a visitor gets to read
lives here. German stays the default -- the switch in the top bar only sets
the cookie below, and both the templates and app.js read the language back
from the <html lang> attribute of the delivered page.

Keys are grouped by where the text shows up:

    login.*    the sign-in page
    index.*    the chart page (only what the template renders itself;
               everything app.js draws has its own table in app.js)
    error.*    messages that reach the browser as an HTTP detail
    signal.*   the entries of the signal list, rendered while the response
               is being built (see signals.py and series.py)
    log.*      the access log -- English only, it is read by an operator

A missing key returns the key itself rather than raising: a forgotten text is
a blemish, not a reason to answer a chart request with a 500.
"""

LANGUAGES = ("de", "en")
DEFAULT_LANGUAGE = "de"

# Name of the cookie holding the choice. No expiry beyond a year, no personal
# data -- it decides nothing but the wording.
COOKIE = "chart_lang"
COOKIE_MAX_AGE = 365 * 86400

TEXTS: dict[str, dict[str, str]] = {
    "de": {
        # --- sign-in page ---
        "login.title": "Anmeldung",
        "login.subtitle": "Kurscharts mit Indikatoren",
        "login.username": "Benutzername",
        "login.password": "Passwort",
        "login.remember": "Angemeldet bleiben",
        "login.submit": "Anmelden",

        # --- chart page ---
        "index.ticker_placeholder": "Ticker",
        "index.ticker_aria": "Ticker-Symbol",
        "index.add_to_watchlist": "Zur Watchlist hinzufügen",
        "index.ranges_aria": "Zeitraum",
        "index.range_6mo": "6M",
        "index.range_1y": "1J",
        "index.range_2y": "2J",
        "index.range_5y": "5J",
        "index.range_max": "Max",
        "index.custom_range": "Eigenen Zeitraum wählen",
        "index.date_from": "Startdatum",
        "index.date_to": "Enddatum",
        "index.apply": "Anwenden",
        "index.theme": "Hell / Dunkel umschalten",
        "index.language": "Switch to English",
        "index.logout": "Abmelden",
        "index.tab_daily": "Tageschart",
        "index.tab_daily_short": "Tag",
        "index.tab_weekly": "Wochenchart (Ribbon)",
        "index.tab_weekly_short": "Woche",
        "index.tab_monthly": "Monatschart (EMA 8/12)",
        "index.tab_monthly_short": "Monat",
        "index.panels_toggle": "Bereiche …",
        "index.panels_toggle_short": "Bereiche",
        "index.panels_heading": "Bereiche des Tagescharts",
        "index.panels_hint": "Häkchen blendet ein oder aus, die Pfeile verschieben.",
        "index.panels_reset": "Auf Standard zurücksetzen",
        "index.favorites": "Favoriten",
        "index.favorites_empty": "Noch keine Favoriten. Ticker anzeigen und oben auf ☆ klicken.",
        "index.monthly_heading": "Monatslage",
        "index.signals": "Signale",
        "index.signals_hint": "Klick auf ein Signal springt im Chart an das Datum.",

        # --- messages that reach the browser ---
        "error.session_expired": "Die Sitzung ist abgelaufen. Bitte erneut versuchen.",
        "error.too_many_attempts": "Zu viele Fehlversuche. Bitte {minutes} Minuten warten.",
        "error.bad_credentials": "Benutzername oder Passwort ist falsch.",
        "error.not_signed_in": "Nicht angemeldet",
        "error.invalid_symbol": "Ungültiges Symbol",
        "error.invalid_date": "Ungültiges Datum für {field}: {value}",
        "error.start_after_end": "Das Startdatum liegt nach dem Enddatum",
        "error.start_in_future": "Das Startdatum liegt in der Zukunft",
        "error.panel_min_one": "Mindestens ein Bereich muss sichtbar bleiben",
        "error.symbol_not_found": "Kein Symbol '{symbol}' bei Yahoo gefunden",
        "error.no_data": "Keine Daten für {symbol}",
        "error.no_data_in_range": "Für {symbol} liegen in diesem Zeitraum keine Daten vor",
        "error.no_trading_days_in_range":
            "Für {symbol} liegen in diesem Zeitraum keine Handelstage vor",
        "error.unknown_range": "Unbekannter Zeitraum: {range}",
        "error.yahoo_failed": "Yahoo-Abfrage fehlgeschlagen: {detail}",
        "error.yahoo_unknown": "Unbekannter Fehler von Yahoo",
        "error.unexpected_response": "Unerwartete Antwort für {symbol}",
        "error.unexpected_timestamps": "Unerwartete Zeitstempel für {symbol}",
        "error.timestamp_not_a_number": "Zeitstempel von {symbol} ist keine Zahl: {value}",
        "error.timestamp_out_of_range":
            "Zeitstempel von {symbol} außerhalb des Bereichs: {value}",
        "index.signals_notice": "Hinweise",
        "notice.buy": "Kaufsignal",
        "notice.sell": "Verkaufssignal",
        "notice.overbought": "überkauft",
        "notice.holding_low": "gehalten, RSI wieder tief",
        "notice.mark_bought": "Als gekauft merken",
        "notice.mark_sold": "Als verkauft merken",
        "notice.held_since": "gehalten seit {date}",
        "notice.none": "Zurzeit kein Signal bei deinen Favoriten.",
        "notice.hint": "Schwellen: {mode}. Berechnet aus den letzten zwei Jahren je Wert.",
        "notice.email_soon": "Benachrichtigung per E-Mail ist noch nicht eingerichtet.",
        "field.start": "Start",
        "field.end": "Ende",
        "field.date": "Datum",
        "field.shares": "Stückzahl",
        "field.price": "Kurs",
        "index.tab_portfolio": "Portfolio Tracker",
        "index.tab_portfolio_short": "Portfolio",
        "index.admin": "Benutzer",
        "error.no_access": "Für dieses Konto ist kein Zugang freigeschaltet.",
        "error.forbidden": "Dafür fehlt die Berechtigung.",
        "error.user_unknown": "Diesen Benutzer gibt es nicht.",
        "error.group_unknown": "Unbekannte Gruppe.",
        "error.group_none": "Ein Benutzer braucht mindestens eine Gruppe.",
        "error.password_length": "Das Passwort muss mindestens {min} Zeichen lang sein.",
        "error.username_invalid": "Benutzername: 2–32 Zeichen, nur a–z, 0–9, Punkt, Binde- und Unterstrich.",
        "error.username_taken": "Diesen Benutzernamen gibt es schon.",
        "error.admin_keep": "Die Admin-Gruppe kann weder dir selbst noch dem letzten Admin entzogen werden.",
        "error.delete_self": "Das eigene Konto lässt sich hier nicht löschen.",
        "group.admin": "Admin",
        "group.portfolio": "Portfolio",
        "group.general": "Allgemein",
        "group.admin_desc": "Alles, dazu Portfolio-Trades erfassen und Benutzer verwalten.",
        "group.portfolio_desc": "Charts und den Portfolio-Tracker-Reiter ansehen, nur lesend.",
        "group.general_desc": "Charts, Favoriten und Hinweise, ohne Portfolio Tracker.",
        "admin.title": "Benutzerverwaltung",
        "admin.back": "Zurück zu den Charts",
        "admin.col_user": "Benutzer",
        "admin.col_groups": "Gruppen",
        "admin.col_created": "Angelegt",
        "admin.col_last_login": "Letzte Anmeldung",
        "admin.col_sessions": "Sitzungen",
        "admin.col_password": "Neues Passwort",
        "admin.never": "nie",
        "admin.you": "du",
        "admin.end_sessions": "Abmelden",
        "admin.end_sessions_title": "Alle Sitzungen dieses Benutzers beenden",
        "admin.set_password": "Setzen",
        "admin.password_placeholder": "mind. 12 Zeichen",
        "admin.delete": "Löschen",
        "admin.confirm_delete": "{user} endgültig löschen? Favoriten und Einstellungen gehen verloren.",
        "admin.confirm_sessions": "Alle Sitzungen von {user} beenden?",
        "admin.saved_groups": "Gruppen von {user} gespeichert.",
        "admin.saved_password": "Passwort von {user} gesetzt, alle Sitzungen beendet.",
        "admin.ended": "{count} Sitzung(en) von {user} beendet.",
        "admin.deleted": "{user} gelöscht.",
        "admin.created": "{user} angelegt.",
        "admin.heading_new": "Neuer Benutzer",
        "admin.username": "Benutzername",
        "admin.password": "Passwort",
        "admin.groups": "Gruppen",
        "admin.create": "Anlegen",
        "admin.heading_groups": "Was die Gruppen dürfen",
        "admin.hint": "Ein neues Passwort beendet alle Sitzungen des Benutzers. Ohne Gruppe kommt niemand mehr hinein. Notausgang, falls der letzte Admin ausgesperrt ist: python -m src.cli groups NAME admin general",
        "index.compare_placeholder": "Vergleichen mit …",
        "index.compare_aria": "Ticker zum Vergleichen",
        "index.compare_button": "Vergleichen",
        "index.compare_remove": "Vergleich entfernen",
        "error.pf_invalid": "Die Trades sind unvollständig.",
        "error.pf_date": "{symbol}: Datum fehlt, liegt vor 2000 oder in der Zukunft.",
        "error.pf_number": "{symbol}: {field} muss eine positive Zahl sein.",
        "error.pf_shares": "{symbol}: Ein Kauf braucht eine Stückzahl.",
        "pf.heading_positions": "Offene Positionen",
        "pf.heading_realized": "Geschlossene Trades",
        "pf.heading_journal": "Alle Trades",
        "pf.heading_add": "Trades erfassen",
        "pf.paste_label": "Post einfügen",
        "pf.paste_placeholder": "I’m closing my KO position at $62.40.\nI’m adding;\n30 shares of AAPL at an average cost of $190.",
        "pf.post_date": "Datum des Posts",
        "pf.parse": "Auslesen",
        "pf.add_row": "Zeile von Hand",
        "pf.save": "Speichern",
        "pf.add_hint": "Ein Verkauf ohne Stückzahl schließt die ganze Position. Ohne Kurs gilt der Schlusskurs des Tages, als geschätzt markiert.",
        "pf.disclaimer": "Verkäufe werden nach FIFO verrechnet. Ohne Gebühren, Steuern und Wechselkurse. Erfasst ist nur, was gepostet und hier eingetragen wurde.",

        # --- signal list ---
        "signal.rsi_oversold": "RSI überverkauft ({value})",
        "signal.rsi_overbought": "RSI überkauft ({value})",
        "signal.bb_lower": "Kurs berührt unteres Bollinger-Band",
        "signal.bb_upper": "Kurs berührt oberes Bollinger-Band",
        "signal.macd_bull": "MACD bullisher Crossover",
        "signal.macd_bear": "MACD bearisher Crossover",
        "signal.golden_cross": "Golden Cross (SMA 50 über SMA 200)",
        "signal.death_cross": "Death Cross (SMA 50 unter SMA 200)",
        "signal.fib": "Kaufsignal bei Fibonacci-Niveau {level}",
        "signal.month_below_ema8": "Monatsschluss unter EMA8 ({close} zu {level})",
        "signal.month_below_ema12": "Monatsschluss unter EMA12 ({close} zu {level})",
    },
    "en": {
        # --- sign-in page ---
        "login.title": "Sign in",
        "login.subtitle": "Price charts with indicators",
        "login.username": "Username",
        "login.password": "Password",
        "login.remember": "Stay signed in",
        "login.submit": "Sign in",

        # --- chart page ---
        "index.ticker_placeholder": "Ticker",
        "index.ticker_aria": "Ticker symbol",
        "index.add_to_watchlist": "Add to watchlist",
        "index.ranges_aria": "Period",
        "index.range_6mo": "6M",
        "index.range_1y": "1Y",
        "index.range_2y": "2Y",
        "index.range_5y": "5Y",
        "index.range_max": "Max",
        "index.custom_range": "Choose a custom period",
        "index.date_from": "Start date",
        "index.date_to": "End date",
        "index.apply": "Apply",
        "index.theme": "Toggle light / dark",
        "index.language": "Auf Deutsch umschalten",
        "index.logout": "Sign out",
        "index.tab_daily": "Daily chart",
        "index.tab_daily_short": "Day",
        "index.tab_weekly": "Weekly chart (ribbon)",
        "index.tab_weekly_short": "Week",
        "index.tab_monthly": "Monthly chart (EMA 8/12)",
        "index.tab_monthly_short": "Month",
        "index.panels_toggle": "Panels …",
        "index.panels_toggle_short": "Panels",
        "index.panels_heading": "Panels of the daily chart",
        "index.panels_hint": "The checkbox shows or hides, the arrows reorder.",
        "index.panels_reset": "Reset to default",
        "index.favorites": "Favorites",
        "index.favorites_empty": "No favorites yet. Show a ticker and click ☆ above.",
        "index.monthly_heading": "Monthly position",
        "index.signals": "Signals",
        "index.signals_hint": "Clicking a signal jumps to that date in the chart.",

        # --- messages that reach the browser ---
        "error.session_expired": "The session has expired. Please try again.",
        "error.too_many_attempts": "Too many failed attempts. Please wait {minutes} minutes.",
        "error.bad_credentials": "Username or password is wrong.",
        "error.not_signed_in": "Not signed in",
        "error.invalid_symbol": "Invalid symbol",
        "error.invalid_date": "Invalid date for {field}: {value}",
        "error.start_after_end": "The start date is after the end date",
        "error.start_in_future": "The start date is in the future",
        "error.panel_min_one": "At least one panel has to stay visible",
        "error.symbol_not_found": "No symbol '{symbol}' found at Yahoo",
        "error.no_data": "No data for {symbol}",
        "error.no_data_in_range": "No data for {symbol} in this period",
        "error.no_trading_days_in_range": "No trading days for {symbol} in this period",
        "error.unknown_range": "Unknown period: {range}",
        "error.yahoo_failed": "Yahoo request failed: {detail}",
        "error.yahoo_unknown": "Unknown error from Yahoo",
        "error.unexpected_response": "Unexpected response for {symbol}",
        "error.unexpected_timestamps": "Unexpected timestamps for {symbol}",
        "error.timestamp_not_a_number": "Timestamp of {symbol} is not a number: {value}",
        "error.timestamp_out_of_range": "Timestamp of {symbol} out of range: {value}",
        "index.signals_notice": "Notices",
        "notice.buy": "Buy signal",
        "notice.sell": "Sell signal",
        "notice.overbought": "overbought",
        "notice.holding_low": "held, RSI low again",
        "notice.mark_bought": "Mark as bought",
        "notice.mark_sold": "Mark as sold",
        "notice.held_since": "held since {date}",
        "notice.none": "No signal on your favorites right now.",
        "notice.hint": "Thresholds: {mode}. Derived from the last two years per instrument.",
        "notice.email_soon": "Notification by email is not set up yet.",
        "field.start": "start",
        "field.end": "end",
        "field.date": "date",
        "field.shares": "shares",
        "field.price": "price",
        "index.tab_portfolio": "Portfolio Tracker",
        "index.tab_portfolio_short": "Portfolio",
        "index.admin": "Users",
        "error.no_access": "No access has been granted for this account.",
        "error.forbidden": "You are not allowed to do that.",
        "error.user_unknown": "No such user.",
        "error.group_unknown": "Unknown group.",
        "error.group_none": "A user needs at least one group.",
        "error.password_length": "The password must be at least {min} characters long.",
        "error.username_invalid": "Username: 2–32 characters, only a–z, 0–9, dot, hyphen and underscore.",
        "error.username_taken": "That username exists already.",
        "error.admin_keep": "The admin group can be taken neither from yourself nor from the last admin.",
        "error.delete_self": "Your own account cannot be deleted here.",
        "group.admin": "Admin",
        "group.portfolio": "Portfolio",
        "group.general": "General",
        "group.admin_desc": "Everything, plus entering portfolio trades and managing users.",
        "group.portfolio_desc": "Charts and the Portfolio Tracker tab, read only.",
        "group.general_desc": "Charts, favorites and notices, without the Portfolio Tracker.",
        "admin.title": "User management",
        "admin.back": "Back to the charts",
        "admin.col_user": "User",
        "admin.col_groups": "Groups",
        "admin.col_created": "Created",
        "admin.col_last_login": "Last sign-in",
        "admin.col_sessions": "Sessions",
        "admin.col_password": "New password",
        "admin.never": "never",
        "admin.you": "you",
        "admin.end_sessions": "Sign out",
        "admin.end_sessions_title": "End all sessions of this user",
        "admin.set_password": "Set",
        "admin.password_placeholder": "at least 12 characters",
        "admin.delete": "Delete",
        "admin.confirm_delete": "Delete {user} for good? Favorites and settings are lost.",
        "admin.confirm_sessions": "End all sessions of {user}?",
        "admin.saved_groups": "Groups of {user} saved.",
        "admin.saved_password": "Password of {user} set, all sessions ended.",
        "admin.ended": "{count} session(s) of {user} ended.",
        "admin.deleted": "{user} deleted.",
        "admin.created": "{user} created.",
        "admin.heading_new": "New user",
        "admin.username": "Username",
        "admin.password": "Password",
        "admin.groups": "Groups",
        "admin.create": "Create",
        "admin.heading_groups": "What the groups may do",
        "admin.hint": "A new password ends all of the user's sessions. Without a group nobody gets in. Emergency exit should the last admin be locked out: python -m src.cli groups NAME admin general",
        "index.compare_placeholder": "Compare with …",
        "index.compare_aria": "Ticker to compare with",
        "index.compare_button": "Compare",
        "index.compare_remove": "Remove comparison",
        "error.pf_invalid": "The trades are incomplete.",
        "error.pf_date": "{symbol}: date missing, before 2000 or in the future.",
        "error.pf_number": "{symbol}: {field} has to be a positive number.",
        "error.pf_shares": "{symbol}: a buy needs a share count.",
        "pf.heading_positions": "Open positions",
        "pf.heading_realized": "Closed trades",
        "pf.heading_journal": "All trades",
        "pf.heading_add": "Enter trades",
        "pf.paste_label": "Paste a post",
        "pf.paste_placeholder": "I’m closing my KO position at $62.40.\nI’m adding;\n30 shares of AAPL at an average cost of $190.",
        "pf.post_date": "Date of the post",
        "pf.parse": "Read out",
        "pf.add_row": "Row by hand",
        "pf.save": "Save",
        "pf.add_hint": "A sell without a share count closes the whole position. Without a price the day's close applies, marked as estimated.",
        "pf.disclaimer": "Sells are matched first in, first out. No fees, taxes or exchange rates. Covers only what was posted and entered here.",

        # --- signal list ---
        "signal.rsi_oversold": "RSI oversold ({value})",
        "signal.rsi_overbought": "RSI overbought ({value})",
        "signal.bb_lower": "Price touches lower Bollinger band",
        "signal.bb_upper": "Price touches upper Bollinger band",
        "signal.macd_bull": "MACD bullish crossover",
        "signal.macd_bear": "MACD bearish crossover",
        "signal.golden_cross": "Golden Cross (SMA 50 above SMA 200)",
        "signal.death_cross": "Death Cross (SMA 50 below SMA 200)",
        "signal.fib": "Buy signal at Fibonacci level {level}",
        "signal.month_below_ema8": "Monthly close below EMA8 ({close} vs {level})",
        "signal.month_below_ema12": "Monthly close below EMA12 ({close} vs {level})",
    },
}


def normalize(language: str | None) -> str:
    """The language actually delivered -- anything unknown becomes the default."""
    return language if language in LANGUAGES else DEFAULT_LANGUAGE


def from_request(request) -> str:
    """Language of a request, taken from the cookie the switch sets."""
    return normalize(request.cookies.get(COOKIE))


def translate(language: str, key: str, **params) -> str:
    """One text, with {placeholders} filled in.

    Falls back to German and then to the key itself, so a text missing from
    one of the tables shows up as a visible blemish instead of an exception
    somewhere deep in a request.
    """
    table = TEXTS.get(normalize(language), TEXTS[DEFAULT_LANGUAGE])
    text = table.get(key) or TEXTS[DEFAULT_LANGUAGE].get(key) or key
    if not params:
        return text
    try:
        return text.format(**params)
    except (KeyError, IndexError, ValueError):
        return text


def translator(language: str):
    """A translate() bound to one language -- handed to the templates as t()."""
    def t(key: str, **params) -> str:
        return translate(language, key, **params)
    return t
