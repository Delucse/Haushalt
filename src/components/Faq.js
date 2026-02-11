import { mdiHandCoinOutline } from '@mdi/js';

import Link from './Link';
import Questions from './Questions';
import Migration from './Migration';

const themes = (state) => {
    return [
        {
            title: 'Allgemein',
            hash: '#allgemein',
            questions: [
                {
                    hash: '#delucse',
                    question: 'Was bedeutet "Delucse"?',
                    answer: '"Delucse" ist eine Mischung aus "de Luc", also von Luc, und "deluxe", also Luxus. Diese Merkmale finden sich in dieser Anwendung wieder, da sie zum Einen von Luc programmiert wird und zum Anderen sämtliche Funktionen der Community beinhaltet.',
                },
                {
                    hash: '#app',
                    question: 'Gibt es eine Smartphone-App?',
                    answer: (
                        <div>
                            Jein. Die Anwendung ist eine klassische
                            "Singe-Page-Application" basierend auf React.
                            Allerdings ist es Dir möglich die Website wie eine
                            native App zu nutzen (
                            <Link
                                to="https://de.wikipedia.org/wiki/Progressive_Web_App"
                                target="_blank"
                                alt="PWA"
                            >
                                PWA
                            </Link>
                            ). D.h. Du kannst Dir die Website über die
                            Einstellungen des genutzten Browsers zum Homescreen
                            hinzufügen. (Für Endgeräte mit einem
                            Android-Betriebssystem bietet sich dafür der Browser
                            "Chrome" an.)
                        </div>
                    ),
                },
                {
                    hash: '#version',
                    question: 'Habe ich die aktuellste Version?',
                    answer: 'In der Regel solltest Du immer auf dem aktuellsten Entwicklungsstand sein. Sobald neue Funktionen oder Änderungen verfügbar sind, wird Dir dies angezeigt und Du hast die Möglichkeit die Anwendung noch einmal neu zu laden, damit Du direkt in den Genuss der aktuellsten Version kommst. Andernfalls aktualisiert sich die Anwendung beim nächsten Aufruf.',
                },
            ],
        },
        {
            title: 'erste Schritte',
            hash: '#ersteSchritte',
            questions: [],
        },
        {
            title: 'Migration',
            hash: '#migration',
            questions: [
                {
                    hash: '#migration',
                    question:
                        'Kann ich die Daten aus der vorangegangenen Excel-Version für die neue Haushalt-Webanwendung nutzen?',
                    answer: <Migration />,
                },
            ],
        },
        {
            title: 'Entwicklung',
            hash: '#entwicklung',
            questions: [
                {
                    hash: '#code',
                    question: 'Wie komme ich an den Quellcode?',
                    answer: (
                        <div>
                            Sämtlicher Quellcode der im Frontend verwendet wird
                            kann in Github eingesehen werden. Das zugehörige
                            Repository wird in regelmäßigen Abständen
                            aktualisiert.
                            <ul>
                                <li>
                                    <Link
                                        to="https://github.com/Delucse/Haushalt"
                                        target="_blank"
                                        alt="Frontend-Github-Repository"
                                    >
                                        Haushalt
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    ),
                },
                {
                    hash: '#bug',
                    question:
                        'Ich habe einen Bug bzw. Fehler entdeckt. Wo kann ich diesen melden?',
                    answer: (
                        <div>
                            Bugs bzw. Fehler können sehr gerne per E-Mail an{' '}
                            <Link to="mailto:support@delucse.de">
                                support@delucse.de
                            </Link>{' '}
                            versendet werden. Alternativ kann ein
                            <Link
                                to="https://github.com/Delucse/Haushalt/issues/new"
                                target="_blank"
                                alt="Github Issue für Frontend-Repository erstellen"
                            >
                                Issue
                            </Link>{' '}
                            auf Github erstellt werden.
                            <br />
                            Anmerkung: Bei der Übermittlung eines Fehlers ist es
                            immer hilfreich kurz zu erläutern was man gemacht
                            hat, bevor der Fehler aufgetaucht ist und anzugeben
                            über welches Endgerät und Browser die Anwendung
                            benutzt wurde. Vielen Dank für deine Mühen!
                        </div>
                    ),
                },
            ],
        },
    ];
};

function Faq() {
    return <Questions themes={themes} icon={mdiHandCoinOutline} rotation />;
}

export default Faq;
