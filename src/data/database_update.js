import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://game8.co/api/tool_structural_mappings/650.json';
const OUTPUT_FILE = path.join(__dirname, 'umas.json');

let localUmas = [];
if (fs.existsSync(OUTPUT_FILE)) {
    try {
        localUmas = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        console.log(`Lokalna baza zawiera ${localUmas.length} postaci.`);
    } catch (e) {
        console.log("Nie udało się odczytać lokalnej bazy, pobieram od nowa.");
    }
}

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://game8.co/',
        'Accept': 'application/json'
    }
};

console.log('📡 Łączę się z Game8 w celu weryfikacji...');

https.get(API_URL, options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            let remoteItems = [];

            if (Array.isArray(parsedData)) {
                const targetObj = parsedData.find(obj => obj.toolKey === "Umamusume_trainees" || obj.collectionArraySchema);
                remoteItems = targetObj?.collectionArraySchema?.collectionItems || [];
            } else {
                remoteItems = parsedData.collectionArraySchema?.collectionItems || [];
            }

            console.log(`📊 Serwer Game8 podaje: ${remoteItems.length} postaci.`);

            if (remoteItems.length > localUmas.length) {
                console.log('Wykryto nowe postacie! Aktualizuję bazę...');

                const updatedRoster = remoteItems.map(uma => {
                    // Zachowaj status "owned", jeśli postać już istniała w lokalnej bazie
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
    });
}).on('error', (e) => {
    console.error('Błąd połączenia z API:', e.message);
    process.exit(1);
});