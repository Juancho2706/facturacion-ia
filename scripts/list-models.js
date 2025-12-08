const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const apiKeyLine = envFile.split('\n').find(line => line.startsWith('GOOGLE_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : null;

if (!apiKey) {
    console.error("GOOGLE_API_KEY not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Para listar modelos, no necesitamos instanciar un modelo específico,
        // pero la SDK actual no expone listModels directamente en la clase principal fácilmente 
        // sin acceder al model manager o similar. 
        // Sin embargo, podemos intentar instanciar uno y ver si funciona, 
        // o usar un endpoint directo con fetch si el SDK lo complica.

        // El SDK de node suele tener getGenerativeModel, pero no listModels global expuesto tan directo en v0.14+
        // Vamos a intentar obtener el modelo directamente y si falla, bueno ya sabemos que falla.
        // MEJOR: Usar fetch directo para estar seguros de qué ve la API.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error structure:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
