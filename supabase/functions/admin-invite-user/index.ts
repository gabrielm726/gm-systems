
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { email, name, tenantId, requestReason, password } = await req.json();

        if (!email || !password || !tenantId) {
            return new Response(JSON.stringify({ error: 'Faltam dados obrigatórios' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Cria o usuário no Auth (sem logar o atual, pois usa Service Role)
        const { data: user, error: userError } = await supabaseClient.auth.admin.createUser({
            email: email,
            password: password,
            user_metadata: {
                full_name: name,
                tenant_id: tenantId,
                request_reason: requestReason,
                // Status será PENDING automaticamente via trigger do banco, 
                // ou podemos forçar aqui se o trigger não pegar createUser admin
            },
            email_confirm: true // Já confirma o email para não travar
        });

        if (userError) throw userError;

        // Se o Trigger handle_new_user não disparar para admin.createUser (as vezes não dispara),
        // podemos inserir manualmente em profiles, mas vamos confiar no trigger primeiro.
        // Melhor: O trigger "AFTER INSERT ON auth.users" dispara sim.
        // Mas o trigger define 'status' como 'PENDING' por padrão. Perfeito.

        return new Response(JSON.stringify(user), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
