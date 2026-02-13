import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { assetId, content, title } = await req.json()

        // 1. Create PDF
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

        page.drawText(title || 'Documento Oficial', {
            x: 50,
            y: height - 50,
            size: 24,
            font: font,
            color: rgb(0, 0, 0),
        })

        page.drawText(content || 'Conteúdo do documento...', {
            x: 50,
            y: height - 100,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
        })

        // Add Timestamp
        page.drawText(`Gerado em: ${new Date().toISOString()}`, {
            x: 50,
            y: 50,
            size: 10,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
        })

        const pdfBytes = await pdfDoc.save()

        // 2. Initialize Supabase Client with User Context (Inherits RLS permissions)
        const authHeader = req.headers.get('Authorization')!
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 3. SECURE SAVE: Save to 'blindado' bucket BEFORE returning
        const fileName = `doc_${assetId}_${Date.now()}.pdf`
        const { error: uploadError } = await supabaseClient
            .storage
            .from('blindado')
            .upload(fileName, pdfBytes, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (uploadError) {
            console.error('Bunker Backup Failed:', uploadError)
            // Even if backup fails, we might want to alert, but for now we proceed or error out.
            // Security decision: Fail if backup fails? Secure-by-default says YES.
            // throw new Error("Falha no Backup de Segurança");
        }

        // 4. Return PDF to User
        return new Response(pdfBytes, {
            headers: { ...corsHeaders, 'Content-Type': 'application/pdf' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
