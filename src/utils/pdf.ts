import jsPDF from 'jspdf'
import JsBarcode from 'jsbarcode'
import type { LabelData, LabelTemplate } from '@/types/label'

/**
 * Generate PDF labels from data and template
 */
export function generateLabelPDF(
  data: LabelData[],
  template: LabelTemplate
): jsPDF {
  // 4x6 inches at 72 DPI (standard PDF resolution)
  const widthInPoints = template.width * 72
  const heightInPoints = template.height * 72
  
  const pdf = new jsPDF({
    orientation: template.width > template.height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [widthInPoints, heightInPoints]
  })

  data.forEach((labelData, index) => {
    if (index > 0) {
      pdf.addPage()
    }

    // Render each field from the template
    template.fields.forEach(field => {
      const value = String(labelData[field.dataKey] || '')
      
      if (field.type === 'text') {
        renderTextField(pdf, field, value)
      } else if (field.type === 'barcode') {
        renderBarcodeField(pdf, field, value)
      }
    })
  })

  return pdf
}

/**
 * Render a text field on the PDF
 */
function renderTextField(
  pdf: jsPDF,
  field: any,
  value: string
) {
  const fontSize = field.fontSize || 12
  const fontWeight = field.fontWeight || 'normal'
  
  pdf.setFontSize(fontSize)
  
  if (fontWeight === 'bold') {
    pdf.setFont('helvetica', 'bold')
  } else {
    pdf.setFont('helvetica', 'normal')
  }

  const x = field.x * 72
  const y = field.y * 72
  const align = field.align || 'left'

  pdf.text(value, x, y, { align })
}

/**
 * Render a barcode field on the PDF
 */
function renderBarcodeField(
  pdf: jsPDF,
  field: any,
  value: string
) {
  // Create a temporary canvas for barcode generation
  const canvas = document.createElement('canvas')
  
  try {
    JsBarcode(canvas, value, {
      format: field.barcodeFormat || 'CODE128',
      width: field.barcodeWidth || 2,
      height: field.barcodeHeight || 50,
      displayValue: false,
      margin: 0
    })

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/png')
    const x = field.x * 72
    const y = field.y * 72
    
    // Center the barcode horizontally
    const barcodeX = x - (canvas.width / 2)
    
    pdf.addImage(imgData, 'PNG', barcodeX, y, canvas.width, canvas.height)
  } catch (error) {
    console.error('Failed to generate barcode:', error)
    // Fallback: render as text
    renderTextField(pdf, { ...field, fontSize: 10 }, value)
  }
}

/**
 * Generate a single-page PDF for one label
 */
export function generateSingleLabelPDF(
  labelData: LabelData,
  template: LabelTemplate
): jsPDF {
  const widthInPoints = template.width * 72
  const heightInPoints = template.height * 72
  
  const pdf = new jsPDF({
    orientation: template.width > template.height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [widthInPoints, heightInPoints]
  })

  // Render each field from the template
  template.fields.forEach(field => {
    const value = String(labelData[field.dataKey] || '')
    
    if (field.type === 'text') {
      renderTextField(pdf, field, value)
    } else if (field.type === 'barcode') {
      renderBarcodeField(pdf, field, value)
    }
  })

  return pdf
}

/**
 * Download the generated PDF
 */
export function downloadPDF(pdf: jsPDF, filename: string = 'labels.pdf') {
  pdf.save(filename)
}

/**
 * Preview PDF in a new window
 */
export function previewPDF(pdf: jsPDF) {
  const pdfBlob = pdf.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}
