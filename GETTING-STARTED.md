# Getting Started with Label Generator

## Project Setup Complete! ✅

Your label generator is ready to use at: **http://localhost:5173**

## What Has Been Set Up

### Core Files Created:

- `/src/types/label.ts` - TypeScript type definitions
- `/src/utils/spreadsheet.ts` - Excel/CSV parsing
- `/src/utils/pdf.ts` - PDF generation with barcodes
- `/src/views/HomeView.vue` - Main application
- `sample-data.csv` - Test data

### Dependencies Installed:

- jsPDF (PDF generation)
- xlsx (Excel reading)
- jsbarcode (Barcode support)

## Quick Start

1. Start the server: `npm run dev`
2. Open http://localhost:5173
3. Upload the sample file (Excel or CSV) to test
4. Preview and generate labels

## Customizing for Your Data

Edit `src/views/HomeView.vue` to match your spreadsheet columns.

Add fields to the `fields` array:

- Text: `{ type: 'text', dataKey: 'Material', x: 0.5, y: 1.0, fontSize: 12 }`
- Barcode: `{ type: 'barcode', dataKey: 'Description', x: 0.5, y: 2.0, barcodeFormat: 'CODE128' }`

Position in inches from top-left (0,0). Label is 4" wide x 6" tall.

## Next Steps

1. Get spreadsheet from colleague
2. Note the column names
3. Update `labelTemplate` fields to match
4. Test and generate!
