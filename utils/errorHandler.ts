import Toast from 'react-native-toast-message';

export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

export const handleApiError = (error: ApiError, customMessage?: string) => {
  console.error('API Error:', error);

  let errorMessage = customMessage || 'Xəta baş verdi';

  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        errorMessage = serverMessage || 'Yanlış məlumat göndərildi';
        break;
      case 401:
        errorMessage = 'Hesabınıza daxil olun';
        break;
      case 403:
        errorMessage = 'Bu əməliyyat üçün icazəniz yoxdur';
        break;
      case 404:
        errorMessage = 'Məlumat tapılmadı';
        break;
      case 409:
        errorMessage = serverMessage || 'Konflikt yarandı';
        break;
      case 500:
        errorMessage = 'Server xətası baş verdi';
        break;
      default:
        errorMessage = serverMessage || errorMessage;
    }
  } else if (error.message) {
    if (error.message.includes('Network Error') || error.message.includes('network')) {
      errorMessage = 'İnternet bağlantınızı yoxlayın';
    } else {
      errorMessage = error.message;
    }
  }

  Toast.show({
    type: 'error',
    text1: 'Xəta',
    text2: errorMessage,
    position: 'top',
    visibilityTime: 4000,
  });

  return errorMessage;
};

export const showSuccess = (message: string, title = 'Uğurlu') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showInfo = (message: string, title = 'Məlumat') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showWarning = (message: string, title = 'Diqqət') => {
  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

// Network status checker
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    showWarning('İnternet bağlantınızı yoxlayın');
    return false;
  }
};

// Retry logic for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

// Premium content error handler
export const handlePremiumError = () => {
  Toast.show({
    type: 'error',
    text1: 'Premium Məzmun',
    text2: 'Bu test yalnız Premium istifadəçilər üçündür',
    position: 'top',
    visibilityTime: 4000,
  });
};

