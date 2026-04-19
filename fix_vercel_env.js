const { execSync } = require('child_process');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const envLines = envLocal.split('\n');
const envVars = {};

envLines.forEach(line => {
    if (line.startsWith('SUPABASE_') || line.startsWith('NEXT_PUBLIC_')) {
        const [key, ...rest] = line.split('=');
        envVars[key.trim()] = rest.join('=').trim();
    }
});

// We need 4 variables exactly for this project
const requiredVars = {
    SUPABASE_URL: envVars.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: envVars.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY // Assuming it's not present, fallback if needed or we'll just check if it was set
};

if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

console.log('Found environment variables:', Object.keys(requiredVars));

async function fixEnv() {
    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value) {
            console.log(`Skipping ${key} as it has no value.`);
            continue;
        }
        console.log(`Removing old ${key} (if exists)...`);
        try {
            execSync(`npx --yes vercel env rm ${key} production -y`);
        } catch (e) {
            // Might not exist
        }
        
        console.log(`Adding ${key}...`);
        try {
            // Use PowerShell compatible pipe or just run it via standard env add which accepts stdin
            execSync(`npx --yes vercel env add ${key} production`, {
                input: Buffer.from(value)
            });
            console.log(`Successfully added ${key}`);
        } catch (e) {
            console.error(`Failed to add ${key}:`, e.message);
        }
    }
    
    console.log('All environment variables updated. Triggering redeployment...');
    try {
        execSync('npx --yes vercel deploy --prod --yes');
        console.log('Redeployment triggered successfully!');
    } catch(e) {
        console.error('Failed to trigger redeploy:', e.message);
    }
}

fixEnv();
