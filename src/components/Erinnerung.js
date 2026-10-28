import { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import {
    snackbarErrorMessage,
    snackbarMessage,
} from '../actions/messageActions';

import Switch from './Switch';
import { Box, Typography } from '@mui/material';

const Erinnerung = () => {
    const dispatch = useDispatch();
    // const [time, setTime] = useState('20:00');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Beim Laden prüfen, ob bereits ein Abo im Browser aktiv ist
    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            // 1. Prüfen, ob der Service Worker überhaupt bereit ist
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const register = await navigator.serviceWorker.ready;

                    // 2. Das aktuelle Abo direkt aus dem Push-Manager des Browsers abfragen
                    const subscription =
                        await register.pushManager.getSubscription();

                    // 3. Wenn ein Abo existiert, setzen wir den Haken auf true, sonst false
                    setIsSubscribed(!!subscription);

                    // Optional: Wenn ein Abo existiert, laden wir die gespeicherte Uhrzeit aus der DB
                    if (subscription) {
                        // Hier könnten Sie einen GET-Request an Ihr Backend senden,
                        // um die exakte 'reminderTime' des Nutzers abzufragen und im State zu setzen.
                    }
                } catch (error) {
                    console.error('Fehler beim Prüfen des Abo-Status:', error);
                }
            }
        };

        checkSubscriptionStatus();
    }, []);

    const subscribe = async () => {
        // 1. Warten, bis das CRA-Skript den Service Worker startbereit hat
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            dispatch(
                snackbarErrorMessage(
                    'Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.',
                ),
            );
            return;
        }

        try {
            const register = await navigator.serviceWorker.ready;
            // 2. Erlaubnis vom Nutzer abfragen
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                dispatch(
                    snackbarErrorMessage(
                        'Du musst Benachrichtigungen erlauben, um die Erinnerung zu nutzen.',
                    ),
                );
                return;
            }

            // 3. Push-Abonnement über das CRA-Skript erstellen
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.REACT_APP_PUBLIC_VAPID_KEY, // Ihr Backend-Schlüssel
            });

            // 4. Daten an Ihr Node.js Backend senden
            await fetch(`${process.env.REACT_APP_API_URL}/subscribe/haushalt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription,
                    // time: time, // gewählte Uhrzeit
                }),
            });

            setIsSubscribed(true);
            dispatch(snackbarMessage(`Erinnerung erfolgreich aktiviert.`));
        } catch (error) {
            dispatch(
                snackbarErrorMessage(
                    'Fehler bei der Push-Aktivierung: ' + error,
                ),
            );
        }
    };

    const unsubscribe = async () => {
        const register = await navigator.serviceWorker.ready;

        // 1. Das aktuelle Abonnement im Browser abrufen
        const subscription = await register.pushManager.getSubscription();

        if (!subscription) {
            dispatch(snackbarMessage('Kein aktives Abonnement gefunden.'));
            return;
        }

        // 2. Im Browser austragen (löscht die internen Keys des Browsers)
        const successful = await subscription.unsubscribe();

        if (successful) {
            // 3. Dem Node.js Backend mitteilen, dass das Abo gelöscht werden soll
            await fetch(`${process.env.REACT_APP_API_URL}/subscribe/haushalt`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint }), // Der Endpoint reicht zur Identifikation
            });

            setIsSubscribed(false);
            dispatch(snackbarMessage('Erfolgreich abgemeldet!'));
        } else {
            dispatch(snackbarErrorMessage('Fehler beim Abmelden im Browser.'));
        }
    };

    return (
        <Box sx={{ display: 'grid' }}>
            <Typography
                component="div"
                variant="body1"
                sx={{
                    display: 'flex',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                Benachrichtigung
            </Typography>
            <Switch
                label="tägliche Erinnerung"
                checked={isSubscribed}
                onChange={(e) => {
                    if (e.target.checked) {
                        subscribe();
                    } else {
                        unsubscribe();
                    }
                }}
            />
        </Box>
    );
};

export default Erinnerung;
