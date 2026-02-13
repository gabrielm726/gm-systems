import os
from dotenv import load_dotenv

load_dotenv()

# Cliente Supabase desativado temporariamente devido a erro de instalação da biblioteca 'pyroaring'
# Para ativar: pip install supabase e descomente abaixo
# from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase = None
# if url and key:
#     try:
#         supabase = create_client(url, key)
#     except Exception as e:
#         print(f"Aviso: Nao foi possivel inicializar cliente Supabase: {e}")
