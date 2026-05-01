<script setup lang="ts">
import { ref } from "vue";
import { parseSpreadsheet, validateLabelData } from "@/utils/spreadsheet";
import {
  generateLabelPDF,
  generateSingleLabelPDF,
  downloadPDF,
  previewPDF,
} from "@/utils/pdf";
import type { LabelData, LabelTemplate } from "@/types/label";

// State
const labelData = ref<LabelData[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const isProcessing = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Default template (4x6 inches)
const labelTemplate = ref<LabelTemplate>({
  width: 4,
  height: 6,
  fields: [
    {
      type: "text",
      dataKey: "Material",
      x: 2.0,
      y: 1.5,
      fontSize: 36,
      fontWeight: "bold",
      align: "center",
    },
    {
      type: "barcode",
      dataKey: "Material",
      x: 2.0,
      y: 2.2,
      barcodeFormat: "CODE128",
      barcodeHeight: 140,
      barcodeWidth: 3,
      align: "center",
    },
    {
      type: "text",
      dataKey: "Description",
      x: 2.0,
      y: 4.8,
      fontSize: 14,
      fontWeight: "bold",
      align: "center",
    },
  ],
});

// Handle file upload
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  errorMessage.value = "";
  successMessage.value = "";
  isProcessing.value = true;

  try {
    const data = await parseSpreadsheet(file);

    if (data.length === 0) {
      throw new Error("No data found in spreadsheet");
    }

    if (!validateLabelData(data, ["Description", "Material"])) {
      throw new Error(
        'Spreadsheet must contain "Description" and "Material" columns',
      );
    }

    labelData.value = data;
    successMessage.value = `Loaded ${data.length} labels successfully!`;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to parse spreadsheet";
    labelData.value = [];
  } finally {
    isProcessing.value = false;
  }
}

// Generate and download PDFs (all in one file)
function generatePDFs() {
  if (labelData.value.length === 0) {
    errorMessage.value = "Please upload a spreadsheet first";
    return;
  }

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    const pdf = generateLabelPDF(labelData.value, labelTemplate.value);
    downloadPDF(pdf, "labels.pdf");
    successMessage.value = `Generated ${labelData.value.length} labels successfully!`;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to generate PDFs";
  } finally {
    isProcessing.value = false;
  }
}

// Generate and download individual PDFs (one per SKU)
async function generateIndividualPDFs() {
  if (labelData.value.length === 0) {
    errorMessage.value = "Please upload a spreadsheet first";
    return;
  }

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    // Add delay between downloads to avoid browser blocking
    for (let i = 0; i < labelData.value.length; i++) {
      const data = labelData.value[i]!;
      const pdf = generateSingleLabelPDF(data, labelTemplate.value);
      const code = String(data["Description"] || "label");
      downloadPDF(pdf, `${code}.pdf`);

      // Wait 150ms between downloads to prevent browser blocking
      if (i < labelData.value.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
    successMessage.value = `Generated ${labelData.value.length} individual labels successfully!`;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Failed to generate individual PDFs";
  } finally {
    isProcessing.value = false;
  }
}

// Preview PDFs
function previewLabels() {
  if (labelData.value.length === 0) {
    errorMessage.value = "Please upload a spreadsheet first";
    return;
  }

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    const pdf = generateLabelPDF(labelData.value, labelTemplate.value);
    previewPDF(pdf);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to preview PDFs";
  } finally {
    isProcessing.value = false;
  }
}

// Clear data
function clearData() {
  labelData.value = [];
  errorMessage.value = "";
  successMessage.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}
</script>

<template>
  <div class="label-generator">
    <div class="container">
      <h1>Label Generator</h1>
      <p class="subtitle">Generate 4x6 PDF labels from your spreadsheet data</p>

      <div class="upload-section">
        <div class="file-input-wrapper">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleFileUpload"
            :disabled="isProcessing"
            id="file-upload"
          />
          <label for="file-upload" class="file-label">
            <span class="upload-icon">📄</span>
            <span>Upload Excel or CSV File</span>
          </label>
        </div>

        <div v-if="isProcessing" class="processing">Processing...</div>
        <div v-if="errorMessage" class="error-message">
          ⚠️ {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="success-message">
          ✓ {{ successMessage }}
        </div>
      </div>

      <div v-if="labelData.length > 0" class="data-preview">
        <h2>Loaded Data ({{ labelData.length }} labels)</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th v-for="key in Object.keys(labelData[0] ?? {})" :key="key">
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in labelData.slice(0, 5)" :key="index">
                <td v-for="key in Object.keys(labelData[0] ?? {})" :key="key">
                  {{ row[key] }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="labelData.length > 5" class="table-note">
            Showing first 5 of {{ labelData.length }} rows
          </p>
        </div>

        <div class="actions">
          <button
            @click="previewLabels"
            class="btn btn-secondary"
            :disabled="isProcessing"
          >
            Preview Labels
          </button>
          <button
            @click="generatePDFs"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            Download All (Single PDF)
          </button>
          <button
            @click="generateIndividualPDFs"
            class="btn btn-success"
            :disabled="isProcessing"
          >
            Download Individual PDFs
          </button>
          <button
            @click="clearData"
            class="btn btn-danger"
            :disabled="isProcessing"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="instructions">
        <h3>Instructions</h3>
        <ol>
          <li>
            Upload the Excel or CSV file with "Description" and "Material"
            columns
          </li>
          <li>Preview the labels to ensure they look correct</li>
          <li>Click "Generate PDFs" to download the label file</li>
          <li>Print the PDF on 4x6 label sheets</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label-generator {
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1600px;
  width: 95%;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.upload-section {
  margin-bottom: 2rem;
}

.file-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.file-label:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.upload-icon {
  font-size: 1.5rem;
}

.processing {
  color: #667eea;
  font-weight: 500;
  padding: 0.75rem;
  background: #f0f2ff;
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.error-message {
  color: #e74c3c;
  background: #ffe5e5;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border-left: 4px solid #e74c3c;
}

.success-message {
  color: #27ae60;
  background: #e8f8f0;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border-left: 4px solid #27ae60;
}

.data-preview {
  margin-top: 2rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

thead {
  background: #667eea;
  color: white;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

tbody tr:hover {
  background: #f8f9fa;
}

.table-note {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #27ae60;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.btn-secondary {
  background: #3498db;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.btn-success {
  background: #9b59b6;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #8e44ad;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.instructions {
  margin-top: 3rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.instructions h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.instructions ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.instructions li {
  margin-bottom: 0.5rem;
  color: #34495e;
}

.note {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}
</style>
