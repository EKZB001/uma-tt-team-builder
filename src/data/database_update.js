import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Dynamiczne określenie ścieżki do folderu, w którym znajduje się skrypt
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://game8.co/api/tool_structural_mappings/650.json';
const OUTPUT_FILE = path.join(__dirname, 'umas.json');

// Odczyt lokalnej bazy danych
let localUmas = [];
if (fs.existsSync(OUTPUT_FILE)) {
    try {
        localUmas = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        console.log(`Lokalna baza zawiera ${localUmas.length} postaci.`);
    } catch (e) {
        console.log("Nie udało się odczytać lokalnej bazy, pobieram od nowa.");
    }
}

// Pełny zestaw nagłówków symulujący zapytanie z prawdziwej przeglądarki Chrome (kamuflaż)
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://game8.co/games/Umamusume-Pretty-Derby',
    'X-Requested-With': 'XMLHttpRequest',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
};

console.log('📡 Łączę się z Game8 w celu weryfikacji...');

async function updateDatabase() {
    try {
        const response = await fetch(API_URL, { headers });
        const text = await response.text();

        // 1. Sprawdzenie ochrony AWS WAF (jeśli rzuci wyzwanie 'challenge')
        const wafAction = response.headers.get('x-amzn-waf-action');
        if (wafAction === 'challenge' || text.includes('x-amzn-waf-action')) {
            console.log("🔒 Serwer Game8 (AWS WAF) rzucił wyzwanie ochronne 'challenge'.");
            console.log("Wylosowany IP GitHuba jest zablokowany. Zgłaszam błąd do Workflow w celu ponowienia...");
            process.exit(1);
        }

        if (!response.ok) {
            console.error('Szczegóły błędu (pierwsze 200 znaków):', text.substring(0, 200));
            throw new Error(`Serwer odrzucił połączenie. Status HTTP: ${response.status}`);
        }

        // 2. Zabezpieczenie przed cichym shadowbanem (pusta odpowiedź)
        if (!text || text.trim() === '') {
            console.log("⚠️ Serwer zwrócił pustą odpowiedź (prawdopodobna ukryta blokada Cloudflare/WAF).");
            process.exit(1);
        }

        const parsedData = JSON.parse(text);
        let remoteItems = [];

        if (Array.isArray(parsedData)) {
            const targetObj = parsedData.find(obj => obj.toolKey === "Umamusume_trainees" || obj.collectionArraySchema);
            remoteItems = targetObj?.collectionArraySchema?.collectionItems || [];
        } else {
            remoteItems = parsedData.collectionArraySchema?.collectionItems || [];
        }

        console.log(`📊 Serwer Game8 podaje: ${remoteItems.length} postaci.`);

        // Synchronizacja i mapowanie danych
        if (remoteItems.length > localUmas.length) {
            console.log('Wykryto nowe postacie! Aktualizuję bazę...');

            const updatedRoster = remoteItems.map(uma => {
                const existingUma = localUmas.find(l => l.id === uma.id);
                return {
                    id: uma.id,
                    name: uma.name,
                    image: uma.imageUrl,
                    owned: existingUma ? existingUma.owned : false,
                    aptitude: {
                        turf: uma.turf, dirt: uma.dirt,
                        sprint: uma.sprint, mile: uma.mile, medium: uma.medium, long: uma.long,
                        front: uma.front, pace: uma.pace, late: uma.late, end: uma.end
                    }
                };
            });

            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedRoster, null, 2));
            console.log(`Baza zaktualizowana pomyślnie (${localUmas.length} -> ${updatedRoster.length}).`);
        } else {
            console.log('Brak nowych postaci. Aktualizacja pominięta.');
        }

    } catch (e) {
        console.error('Błąd podczas przetwarzania danych:', e.message);
        process.exit(1);
    }
}

// Wywołanie asynchronicznej funkcji
updateDatabase();