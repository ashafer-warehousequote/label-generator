# Label Generator

A Vue.js application for generating 4x6 PDF labels from spreadsheet data with text and barcodes.

## Features

- �� Import data from Excel (.xlsx, .xls) or CSV files
- 🏷️ Generate 4x6 inch PDF labels
- 📊 Display barcode (CODE128, CODE39, EAN13, UPC supported)
- 👁️ Preview labels before generating
- ⚡ Fast batch processing
- 🎨 Customizable label templates

## Quick Start

### One-Click Start (macOS)

- Double-click [Start.command](Start.command) in the project folder.
- It installs dependencies if needed, then starts the dev server and opens your browser automatically.
- Keep the Terminal window open while using the app; press Ctrl+C in that window to stop.
- Requires Node.js 20+ (the script will prompt if missing).

### One-Click Start (Windows)

- Double-click [Start.bat](Start.bat).
- It checks for Node.js/npm, installs dependencies if needed, then starts the dev server and opens your browser.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

This project is configured to deploy the built `dist/` folder to GitHub Pages using a workflow.

Steps:

- Push your code to a GitHub repository.
- In the repo settings, enable GitHub Pages with "GitHub Actions" as the source (first run will also set it up automatically).
- The workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds on pushes to `main` and publishes `dist/`.

Notes:

- The router uses history mode; the workflow creates a `404.html` to support deep links.
- The Vite `base` is set dynamically for project pages (e.g., `https://user.github.io/repo/`). No change needed for local dev.

## Usage

1. **Prepare Your Spreadsheet**

- Create an Excel or CSV file
- Include `Description` and `Material` columns
- Add any additional columns for other label data (e.g., `price`, `location`)

2. **Upload Your File**

- Click "Upload Excel or CSV File"
- Select your prepared spreadsheet (Excel or CSV)

3. **Preview Labels**
   - Click "Preview Labels" to see how they'll look

4. **Generate PDFs**
   - Click "Generate PDFs" to download
   - Print on 4x6 label sheets

## Spreadsheet Format

Your spreadsheet should have column headers matching the data you want on labels. Minimum required:

| Description | Material | price  |
| ----------- | -------- | ------ |
| Widget A    | SKU001   | $19.99 |
| Widget B    | SKU002   | $29.99 |

## Customizing Label Templates

Edit the `labelTemplate` in `/src/views/HomeView.vue`:

```typescript
const labelTemplate = ref<LabelTemplate>({
  width: 4, // inches
  height: 6, // inches
  fields: [
    {
      type: "text",
      dataKey: "Material", // Column name from spreadsheet
      x: 0.5, // Position in inches from left
      y: 0.5, // Position in inches from top
      fontSize: 16,
      fontWeight: "bold",
      align: "left",
    },
    {
      type: "barcode",
      dataKey: "Description",
      x: 0.5,
      y: 1.5,
      barcodeFormat: "CODE128", // CODE128, CODE39, EAN13, UPC
      barcodeHeight: 60,
      barcodeWidth: 2,
    },
    // Add more fields as needed
  ],
});
```

### Field Types

**Text Field:**

```typescript
{
  type: 'text',
  dataKey: 'columnName',
  x: 0.5,           // inches from left
  y: 0.5,           // inches from top
  fontSize: 12,
  fontWeight: 'normal' | 'bold',
  align: 'left' | 'center' | 'right'
}
```

**Barcode Field:**

```typescript
{
  type: 'barcode',
  dataKey: 'columnName',
  x: 0.5,
  y: 1.5,
  barcodeFormat: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC',
  barcodeHeight: 60,
  barcodeWidth: 2
}
```

## Project Structure

```
label-generator/
├── src/
│   ├── types/
│   │   └── label.ts          # TypeScript interfaces
│   ├── utils/
│   │   ├── spreadsheet.ts    # Excel/CSV parsing
│   │   └── pdf.ts            # PDF generation
│   └── views/
│       └── HomeView.vue      # Main application
├── package.json
└── README.md
```

## Dependencies

- **Vue 3** - Frontend framework
- **TypeScript** - Type safety
- **jsPDF** - PDF generation
- **xlsx** - Excel file parsing
- **jsbarcode** - Barcode generation

## Advanced Customization

### Multiple Label Sizes

To change label dimensions, modify the `width` and `height` in the template:

```typescript
const labelTemplate = ref<LabelTemplate>({
  width: 2, // 2x4 label
  height: 4,
  // ...
});
```

### Adding More Data Fields

1. Add the column to your spreadsheet
2. Add a field to the template:

```typescript
{
  type: 'text',
  dataKey: 'newColumn',
  x: 0.5,
  y: 4.5,
  fontSize: 10
}
```

### Styling Options

The label component uses Vue's scoped styles. Modify the `<style>` section in `HomeView.vue` to change the UI appearance.

## Troubleshooting

**Labels look incorrect?**

- Check that your spreadsheet column names match the `dataKey` values in the template
- Verify label dimensions (4x6 inches = 288x432 points at 72 DPI)

**Barcodes not generating?**

- Ensure the barcode data is valid for the selected format
- CODE128 is most flexible for alphanumeric data
- EAN13/UPC require specific numeric formats

**File upload fails?**

- Ensure file is .xlsx, .xls, or .csv format
- Check that the file has headers in the first row

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
