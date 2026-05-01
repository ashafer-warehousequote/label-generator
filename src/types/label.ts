export interface LabelData {
  Description?: string
  Material?: string
  [key: string]: string | number | undefined
}

export interface LabelTemplate {
  width: number // in inches
  height: number // in inches
  fields: LabelField[]
}

export interface LabelField {
  type: 'text' | 'barcode'
  dataKey: string
  x: number
  y: number
  fontSize?: number
  fontWeight?: string
  align?: 'left' | 'center' | 'right'
  barcodeFormat?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC'
  barcodeHeight?: number
  barcodeWidth?: number
}
