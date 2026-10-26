// Hilfsfunktionen für die automatische Auswahl des Datenordners beim Login.
// Ein Ordner wird automatisch gewählt, wenn
//   - er "Haushalt" oder "Haushalt Delucse" heißt (Groß-/Kleinschr. egal),
//   - er keinen Unterordner enthält und
//   - alle benötigten Dateien darin liegen.
// Passt nicht genau ein Ordner, wird wie bisher der Ordnerbaum angezeigt.

export const HAUSHALT_ORDNER_NAMEN = ['haushalt', 'haushalt delucse'];

// Dateien, die setFilesFilen / setFilesDropbox laden
export const ERFORDERLICHE_DATEIEN = [
    'Kategorien.csv',
    'Umsatz.csv',
    'wiederkehrenderUmsatz.csv',
    'Umbuchung.csv',
    'Abschluss.csv',
];

export const istHaushaltOrdnerName = (name) =>
    typeof name === 'string' &&
    HAUSHALT_ORDNER_NAMEN.includes(name.trim().toLowerCase());

// Filen: items ist das Ergebnis von getDirectoryTree (Pfad -> Eintrag).
// Gibt die UUID des passenden Ordners zurück, wenn genau einer passt, sonst
// null.
export const findeFilenHaushaltOrdner = (items) => {
    const ordner = Object.entries(items).filter(
        ([, item]) => item.type === 'directory',
    );
    const passend = ordner.filter(
        ([pfad, item]) =>
            istHaushaltOrdnerName(item.name) &&
            // keine Unterordner
            !ordner.some(([, kind]) => kind.parent === item.uuid) &&
            // alle Dateien vorhanden (Pfad-Schlüssel wie in setFilesFilen)
            ERFORDERLICHE_DATEIEN.every((datei) => {
                const eintrag = items[`${pfad}/${datei}`];
                return !!eintrag && eintrag.type !== 'directory';
            }),
    );
    return passend.length === 1 ? passend[0][1].uuid : null;
};

// Dropbox: ordner ist die Liste aller Ordner-Einträge (rekursiv).
// Gibt die Ordner zurück, die nach Name und fehlenden Unterordnern passen;
// ob alle Dateien enthalten sind, wird danach je Kandidat geprüft.
export const findeDropboxKandidaten = (ordner) =>
    ordner.filter(
        (o) =>
            istHaushaltOrdnerName(o.name) &&
            !ordner.some((k) => k.path_lower.startsWith(`${o.path_lower}/`)),
    );

// Dropbox ist nicht zwischen Groß- und Kleinschreibung unterscheidend
export const hatAlleDateien = (dateinamen) => {
    const vorhanden = new Set(dateinamen.map((n) => n.toLowerCase()));
    return ERFORDERLICHE_DATEIEN.every((d) => vorhanden.has(d.toLowerCase()));
};
