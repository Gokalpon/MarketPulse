const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
    const API_KEY = "71b97e399d594125a2f9ffb55c8a7b5e";
    const symbol = "BTC/USD";
    const interval = "5min";
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=10&apikey=${API_KEY}`;
    
    console.log("Testing URL:", url);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Response Status:", data.status);
        if (data.status === 'error') {
            console.log("Error Message:", data.message);
        } else {
            console.log("Success! Points count:", data.values ? data.values.length : 0);
            if (data.values) console.log("First point:", data.values[0]);
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testAPI();
