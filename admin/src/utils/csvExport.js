/**
 * Utility functions for exporting CSV files with proper UTF-8 BOM encoding
 * and field escaping for Microsoft Excel and other spreadsheet viewers.
 */

/**
 * Safely escapes and quotes a CSV field value.
 * - Handles null and undefined values safely
 * - Converts values to strings
 * - Escapes inner double quotes (by doubling them: " -> "")
 * - Wraps every field in double quotes to preserve commas, newlines, and unicode symbols (like ₹)
 *
 * @param {*} value - The cell value to escape
 * @returns {string} - Properly escaped and quoted CSV field
 */
export const escapeCSVValue = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
};

/**
 * Converts a 2D array of rows into a UTF-8 BOM encoded CSV string.
 * Uses CRLF ("\r\n") row delimiters for standard Excel compatibility.
 *
 * @param {Array<Array<*>>} data - 2D array of data rows
 * @returns {string} - UTF-8 BOM formatted CSV string
 */
export const generateCSV = (data) => {
  if (!Array.isArray(data)) {
    return '\uFEFF';
  }

  const csvRows = data.map((row) => {
    if (!Array.isArray(row)) {
      return escapeCSVValue(row);
    }
    return row.map(escapeCSVValue).join(',');
  });

  return '\uFEFF' + csvRows.join('\r\n');
};

/**
 * Triggers a client-side download of a CSV file with UTF-8 BOM and correct MIME type.
 *
 * @param {string} filename - The name of the file (with or without .csv extension)
 * @param {Array<Array<*>>|string} dataOrContent - Either a 2D array of rows or an already generated CSV string
 */
export const downloadCSV = (filename, dataOrContent) => {
  let csvContent;
  if (Array.isArray(dataOrContent)) {
    csvContent = generateCSV(dataOrContent);
  } else if (typeof dataOrContent === 'string') {
    csvContent = dataOrContent.startsWith('\uFEFF')
      ? dataOrContent
      : '\uFEFF' + dataOrContent;
  } else {
    csvContent = '\uFEFF';
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeFilename = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = downloadCSV;
export default downloadCSV;
