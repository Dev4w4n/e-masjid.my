// Constants for security checks
const MAX_CSV_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_COLUMNS = 2; // Minimum required columns
const MAX_COLUMNS = 10; // Maximum allowed columns

export const handleLogError = (error) => {
  if (error.response) {
    console.log(error.response.data)
  } else if (error.request) {
    console.log(error.request)
  } else {
    console.log(error.message)
  }
}

export const isValidKhairatCSV = (csvContent) => {
  // Check if CSV content is empty or too large
  if (!csvContent || csvContent.length > MAX_CSV_SIZE) {
    console.log('CSV content is empty or too large');
    return false;
  }

  // Split CSV content into lines
  const lines = csvContent.split('\n');
  
  // Check if CSV has header and at least one data row
  if (lines.length < 2) {
    console.log('CSV has no data rows');
    return false;
  }
  
  // Extract header columns
  const headerColumns = lines[0].split(',');

  // Check if header has valid column count
  if (headerColumns.length < MIN_COLUMNS || headerColumns.length > MAX_COLUMNS) {
    console.log('headerColumns.length: ', headerColumns.length)
    console.log('CSV header has invalid column count');
    return false;
  }
  
  // Check if all rows have the same number of columns as the header
  for (let i = 1; i < lines.length; i++) {
    const rowColumns = lines[i].split(',');
    
    // Optional: Implement additional checks for each column value
    for (let j = 0; j < rowColumns.length; j++) {
      // Example: Check if the value is not too long
      if (rowColumns[j].length > MAX_COLUMN_LENGTH) {
        console.log('CSV column value is too long');
        return false;
      }
      // Add more checks as needed
    }
  }
  
  // CSV is considered valid if all checks pass
  return true;
}