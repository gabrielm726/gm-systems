import React from 'react';
import { Asset, User, Location } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// We will use dynamic imports for exceljs to avoid build issues if it's large

// SHARED EXPORT UTILITIES

/**
 * Generic Excel Export using 'Planinha G.T.xlsx' as template via ExcelJS
 * ExcelJS is used here because it preserves styles/images better than SheetJS (xlsx)
 * @param data Array of objects to export
 * @param fileNamePrefix Prefix for the output filename
 */
export const exportToExcel = async (data: any[], fileNamePrefix: string) => {
    try {
        // Dynamic import to ensure it works in the browser chain
        const ExcelJS = (await import('exceljs')).default;

        const templateName = 'Planinha G.T.xlsx';
        let buffer: ArrayBuffer;

        // VERIFICAÇÃO DE AMBIENTE (ELECTRON vs WEB)
        // Se estiver no Electron com nodeIntegration, usa FS para garantir leitura local
        if (window.require) {
            try {
                const fs = window.require('fs');
                const path = window.require('path');
                // Tenta achar o caminho correto. Em dev é ./public, em prod é ./resources/app/...
                // __dirname no renderizador pode ser estranho, então usamos process.cwd() ou caminhos relativos
                // Melhor estratégia para Electron + Vite: procurar na raiz do app
                const appPath = window.require('electron').remote?.app.getAppPath() || process.cwd(); // Fallback

                // Opções de caminho para tentar
                const possiblePaths = [
                    path.join(appPath, templateName), // Try root first (dist root in prod)
                    path.join(appPath, 'public', templateName),
                    path.join(appPath, 'dist', templateName),
                    path.join(process.cwd(), 'public', templateName),
                    path.join(__dirname, '..', templateName) // Check relative to assets dir
                ];

                let fileContent: Buffer | null = null;
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        fileContent = fs.readFileSync(p);
                        break;
                    }
                }

                if (!fileContent) {
                    // Se falhar no FS, tentar fetch como fallback (pode estar servido pelo Vite Dev Server)
                    console.warn('Template não achado via FS, tentando fetch...');
                    throw new Error('FS falhou');
                }

                // FIX: Create a fresh ArrayBuffer copy to avoid SharedArrayBuffer issues or offset problems in ExcelJS
                // Node Buffer -> Uint8Array -> ArrayBuffer (CLEAN COPY)
                const uint8Array = new Uint8Array(fileContent);
                buffer = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength) as ArrayBuffer;

            } catch (fsErr) {
                // Fallback para fetch normal (Dev Mode geralmente serve via HTTP)
                const response = await fetch(encodeURI(`/${templateName}`));
                if (!response.ok) throw new Error(`Template não encontrado (${response.status})`);
                buffer = await response.arrayBuffer();
            }
        } else {
            // Web normal
            const response = await fetch(encodeURI(`/${templateName}`));
            if (!response.ok) throw new Error(`Template não encontrado (${response.status})`);
            buffer = await response.arrayBuffer();
        }

        /* 
        REMOVIDO: Código antigo de fetch direto que falhava
        const templatePath = encodeURI('/Planinha G.T.xlsx');
        const response = await fetch(templatePath);
        if (!response.ok) ...
        */

        // Verify it's not HTML (SPA fallback) - Check buffer start bytes if header checking is hard with FS
        // Mas se leu via FS, é arquivo real. Se foi fetch, ok.

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Get the first worksheet
        const worksheet = workbook.worksheets[0];

        // Determine where to start writing. 
        // We look for the last row that has values, then add 2 lines of padding.
        // If the sheet is empty (lastRow undefined), start at row 1.
        let startRow = 1;
        if (worksheet.lastRow) {
            startRow = worksheet.lastRow.number + 2;
        }

        // If data is empty, just save the template
        if (!data || data.length === 0) {
            const outBuffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`);
            return;
        }

        // Extract headers from the first object
        const headers = Object.keys(data[0]);

        // Write Headers
        // Write Data Headers
        const headerRow = worksheet.getRow(startRow);

        // ADD PROFESSIONAL TOP REPORT HEADER
        worksheet.mergeCells(`A1:E1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'G.T GESTÃO PATRIMONIAL - RELATÓRIO OFICIAL';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C4A6E' } }; // Dark Blue
        titleCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells(`A2:E2`);
        const subTitleCell = worksheet.getCell('A2');
        subTitleCell.value = `Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`;
        subTitleCell.font = { italic: true, size: 10 };
        subTitleCell.alignment = { horizontal: 'center' };

        // Table Headers
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header.toUpperCase();
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } }; // Light Blue
            cell.border = {
                bottom: { style: 'medium' },
                right: { style: 'thin' }
            };
            // Set minimal width
            worksheet.getColumn(index + 1).width = 25;
        });
        headerRow.commit();

        // Write Data with "Zebra" Striping and Borders
        let totalValue = 0;

        data.forEach((item, rowIndex) => {
            const currentRow = worksheet.getRow(startRow + 1 + rowIndex);

            Object.entries(item).forEach(([key, value], colIndex) => {
                const cell = currentRow.getCell(colIndex + 1);
                cell.value = value as any;

                // Styling
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
                };

                cell.font = { name: 'Arial', size: 10 };
                cell.alignment = { vertical: 'middle', wrapText: true };

                // Zebra Striping (Alternate Rows)
                if (rowIndex % 2 !== 0) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; // Very light gray (Slate-50)
                }

                // Format Currency Columns (heuristic: key contains 'amount', 'value', 'price', 'custo')
                if (typeof value === 'number' && (key.toLowerCase().includes('value') || key.toLowerCase().includes('price') || key.toLowerCase().includes('cost'))) {
                    cell.numFmt = '"R$" #,##0.00;[Red]\-"R$" #,##0.00';
                    if (key.toLowerCase() === 'value') totalValue += value;
                }
            });
            currentRow.commit();
        });

        // Add Totals Row
        const totalRowIndex = startRow + 1 + data.length;
        const totalRow = worksheet.getRow(totalRowIndex);
        totalRow.getCell(1).value = 'TOTAL GERAL';
        totalRow.getCell(1).font = { bold: true };
        totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };

        // Find the 'value' column index if possible, otherwise just put it at the end or specific column
        // Simple approach: Iterate headers to find 'value'
        headers.forEach((h, i) => {
            const cell = totalRow.getCell(i + 1);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
            cell.border = { top: { style: 'medium' } };

            if (h.toLowerCase() === 'value' || h.toLowerCase() === 'valor') {
                cell.value = totalValue;
                cell.numFmt = '"R$" #,##0.00';
                cell.font = { bold: true };
            }
        });
        totalRow.commit();

        // Auto-Adjust Column Widths (Simple Heuristic)
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, caption => {
                const len = caption.value ? caption.value.toString().length : 0;
                if (len > maxLength) maxLength = len;
            });
            column.width = Math.min(Math.max(maxLength + 2, 12), 50); // Min 12, Max 50
        });

        // Write Buffer
        const outBuffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (err) {
        console.error("Erro ExcelJS:", err);
        alert(`Erro ao exportar usando o template: ${err instanceof Error ? err.message : err}. Tentando método simples...`);

        // Fallback to simple SheetJS
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Dados");
            XLSX.writeFile(wb, `${fileNamePrefix}_Simples_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (fallbackErr) {
            console.error(fallbackErr);
            alert("Falha crítica na exportação.");
        }
    }
};

export const exportToWord = async (
    docType: 'GENERAL' | 'RESPONSIBILITY' | 'RETURN' | 'LAUDO' | 'AUDIT' | 'FINANCIAL',
    data: { assets?: Asset[], logs?: any[], locations: Location[], users: User[], financialData?: any }
) => {
    try {
        const PizZip = (await import('pizzip')).default;
        const Docxtemplater = (await import('docxtemplater')).default;


        const templateName = 'papel timbrado G.T.docx';
        let content: ArrayBuffer;

        if (window.require) {
            try {
                const fs = window.require('fs');
                const path = window.require('path');
                // Tenta paths comuns no Electron (Dev e Prod)
                // Em produção (electron-builder), arquivos do 'public' costumam ir para a raiz do asar ou resources
                const appPath = (window as any).process?.resourcesPath ?
                    path.join((window as any).process.resourcesPath, '..') : // Sobe um nível do resources
                    process.cwd();

                // Lista de tentativas
                const candidates = [
                    path.join(appPath, templateName), // Try root first
                    path.join(appPath, 'public', templateName),
                    path.join(process.cwd(), 'public', templateName),
                    path.join(process.cwd(), templateName),
                    path.join(__dirname, templateName),
                    path.join(__dirname, '..', templateName), // Check relative to assets dir (Standard Vite Prod)
                    path.join(__dirname, '..', 'public', templateName)
                ];

                let foundPath = candidates.find(p => fs.existsSync(p));

                if (foundPath) {
                    const nodeBuffer = fs.readFileSync(foundPath);
                    // FIX: Clean ArrayBuffer copy
                    const uint8Array = new Uint8Array(nodeBuffer);
                    content = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength) as ArrayBuffer;
                } else {
                    throw new Error("Template não encontrado em disco.");
                }

            } catch (e) {
                console.warn("FS Read failed, falling back to fetch", e);
                const response = await fetch(encodeURI(`/${templateName}`));
                if (!response.ok) throw new Error(`HTTP ${response.status} - Arquivo não achado`);
                content = await response.arrayBuffer();
            }
        } else {
            const response = await fetch(encodeURI(`/${templateName}`));
            if (!response.ok) throw new Error(`HTTP ${response.status} - Arquivo não achado`);
            content = await response.arrayBuffer();
        }
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        // Define content based on Document Type
        let docTitle = "RELATÓRIO DE ATIVOS";
        let docText = "Segue abaixo a relação de dados do sistema.";
        let outputName = "Relatorio";
        let assetsList = data.assets || [];

        if (docType === 'RESPONSIBILITY') {
            docTitle = "TERMO DE RESPONSABILIDADE";
            docText = "Eu, colaborador(a), declaro que recebi da empresa G.T GESTÃO PATRIMONIAL os itens relacionados abaixo, em perfeito estado de conservação e funcionamento. Assumo a responsabilidade pela guarda e bom uso dos mesmos, comprometendo-me a comunicar imediatamente qualquer dano ou extravio.";
            outputName = "Termo_Responsabilidade";
        } else if (docType === 'RETURN') {
            docTitle = "TERMO DE DEVOLUÇÃO DE BENS";
            docText = "Declaro que realizei a devolução formal dos itens patrimoniais listados abaixo, cessando minha responsabilidade sobre a guarda dos mesmos a partir desta data.";
            outputName = "Termo_Devolucao";
        } else if (docType === 'LAUDO') {
            docTitle = "LAUDO TÉCNICO DE BAIXA / AVALIAÇÃO";
            docText = "O presente laudo técnico tem por objetivo atestar o estado de conservação e as condições operacionais dos ativos listados abaixo, para fins de registro contábil, manutenção ou baixa patrimonial.";
            outputName = "Laudo_Tecnico";
        } else if (docType === 'AUDIT') {
            docTitle = "RELATÓRIO DE AUDITORIA E LOGS";
            docText = "Este documento contém o registro oficial de atividades e alterações realizadas no sistema, para fins de auditoria e conformidade.";
            outputName = "Relatorio_Auditoria";
            assetsList = (data.logs || []).map(l => ({
                id: (l.currentHash || '').substring(0, 8),
                name: l.action,
                category: l.userName,
                value: 0,
                location: l.details || '-',
                state: new Date(l.timestamp).toLocaleDateString()
            })) as any;
        } else if (docType === 'FINANCIAL') {
            docTitle = "RELATÓRIO FINANCEIRO & DEPRECIAÇÃO";
            docText = `Resumo financeiro: Valor Total de Ativos: R$ ${data.financialData?.totalValue}, Depreciação Acumulada: ${data.financialData?.depreciation}.`;
            outputName = "Relatorio_Financeiro";
        }

        doc.render({
            date: new Date().toLocaleDateString(),
            company_name: "G.T Gestão Patrimonial - Grupo Tático",
            title: docTitle,
            text: docText,
            assets: assetsList.map(a => ({
                id: a.id,
                name: a.name,
                category: a.category,
                value: (typeof a.value === 'number' ? a.value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                location: data.locations.find(l => l.id === a.locationId)?.name || 'N/A',
                responsible: data.users.find(u => u.id === a.responsibleId)?.name || 'N/A',
                state: a.state,
                // PROFESSIONAL FIELDS ADDED
                manufacturer: a.manufacturer || '-',
                model: a.model || '-',
                serial: a.serialNumber || '-',
                invoice: a.invoiceNumber || '-',
                purchaseData: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '-'
            }))
        });

        const out = doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        saveAs(out, `${outputName}_${new Date().toISOString().split('T')[0]}.docx`);

    } catch (err) {
        console.error("Erro Export Word:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        alert(`Erro ao processar o arquivo 'papel timbrado G.T.docx'. Detalhes: ${errorMessage}`);
    }
};
