// This helper function processes the input data
// It iterates over each element and transforms it
// Returns the processed result array
function transform(items) {
  // Create an empty array to store results
  const out = [];
  // Loop through every item
  for (let i = 0; i < items.length; i++) {
    // Push the doubled value
    out.push(items[i] * 2);
  }
  // Return the final array
  return out;
}
