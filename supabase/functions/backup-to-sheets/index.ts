
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBMle2GukG9ScuCfgDyjhuvAb1pFoftr6WAUPNlagtyT-LzcYWNu301YbFV7SwNsD7Hg/exec";
const SECRET_TOKEN = "GT_SYSTEM_SECRET_KEY_2025";

serve(async (req) => {
    try {
        // 1. Get the payload from the Database Webhook
        const payload = await req.json();

        // Log for debugging
        console.log("Received payload:", payload);

        // 2. Prepare the data for Google Sheets
        // The Google Script expects { record: { ... } } inside the body.
        // The Supabase webhook payload ALREADY has { record: { ... } }, so we can forward it or wrap it.
        // Let's create a specific object to be safe and clean.
        const dataToSend = {
            record: payload.record, // The new row data
            type: payload.type,     // INSERT, UPDATE, etc.
            table: payload.table    // Table name
        };

        // 3. Send to Google Apps Script
        // We append the token to the URL as a query parameter
        const targetUrl = `${GOOGLE_SCRIPT_URL}?token=${SECRET_TOKEN}`;

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
        });

        const responseText = await response.text();
        console.log("Google Sheets response:", responseText);

        return new Response(JSON.stringify({ message: "Backup sent successfully", googleResponse: responseText }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error sending backup:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
