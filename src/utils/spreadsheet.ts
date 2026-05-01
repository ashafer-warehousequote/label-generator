import * as XLSX from 'xlsx'
import type { LabelData } from '@/types/label'

/**
 * Parse Excel/CSV file and extract label data
 */
export function parseSpreadsheet(file: File): Promise<LabelData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          throw new Error('No sheets found in spreadsheet')
        }
        const worksheet = workbook.Sheets[firstSheetName] as XLSX.WorkSheet | undefined
        if (!worksheet) {
          throw new Error('First sheet is empty or unreadable')
        }
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number | undefined>>(worksheet) as LabelData[]
        
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * Validate that required fields exist in the data
 */
export function validateLabelData(data: LabelData[], requiredFields: string[]): boolean {
  if (data.length === 0) return false
  
  return requiredFields.every(field => 
    data.every(row => field in row)
  )
}
