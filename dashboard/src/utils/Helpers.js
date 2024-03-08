
export const handleLogError = (error) => {
  if (error.response) {
    console.log(error.response.data)
  } else if (error.request) {
    console.log(error.request)
  } else {
    console.log(error.message)
  }
}

export const isValidCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  
  if (lines.length < 2) {
    return false;
  }
  
  const numColumns = lines[0].split(',').length;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].split(',').length !== numColumns) {
      return false;
    }
  }
  
  return true;
}