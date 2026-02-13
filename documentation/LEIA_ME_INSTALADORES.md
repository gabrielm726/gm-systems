# 📦 Entrega dos Instaladores

Este documento detalha onde encontrar os arquivos gerados pelo processo de build automático (`FULL_BUILD.bat`).

## 📱 Mobile (Android)
O instalador **.apk** para Android foi gerado no seguinte diretório:

- **Caminho:** `app-debug.apk`
- **Como instalar:**
  1. Copie o arquivo `.apk` para o seu celular (via USB ou Google Drive).
  2. No celular, abra o arquivo e permita a instalação de fontes desconhecidas (se solicitado).

## 💻 Desktop (Windows)
O instalador **.exe** para Windows está localizado em:

- **Caminho:** `dist\Sistema G.T Desktop Setup 1.0.0.exe`
- **Versão "Unpacked" (rápida):** `dist\win-unpacked\Sistema G.T Desktop.exe` (roda sem instalar)

## 🌐 Web Application
Os arquivos otimizados para servidor web estão em:

- **Caminho:** `dist\` (contém `index.html` e pasta `assets`)

---

> **Nota:** Se você precisar gerar novamente, basta rodar o arquivo `FULL_BUILD.bat` na raiz do projeto. Ele já verifica e configura o Java automaticamente.
