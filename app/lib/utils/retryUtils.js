/**
 * Retry utilities for handling network failures and timeouts
 */

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retryWithBackoff = async (
  fn, 
  maxRetries = 3, 
  baseDelay = 1000, 
  maxDelay = 10000,
  shouldRetry = (error) => true
) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
      console.log(`   Error: ${error.message}`);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
};

export const shouldRetryError = (error) => {
  const message = error.message.toLowerCase();
  
  // Retry on network errors, timeouts, and server errors
  return (
    message.includes('timeout') ||
    message.includes('signal timed out') ||
    message.includes('fetch failed') ||
    message.includes('network error') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('500')
  );
};

export const shouldNotRetryError = (error) => {
  const message = error.message.toLowerCase();
  
  // Don't retry on client errors (4xx)
  return (
    message.includes('400') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('404') ||
    message.includes('422')
  );
};