export interface ValidationError {
  field: string;
  message: string;
}

export const validateMatriculeNumber = (number: string): ValidationError | null => {
  if (!number || number.trim() === '') {
    return {
      field: 'number',
      message: 'Please enter your assigned number'
    };
  }

  if (!/^[0-9]+$/.test(number)) {
    return {
      field: 'number',
      message: 'Please enter only numbers'
    };
  }

  if (number.length < 8 || number.length > 10) {
    return {
      field: 'number',
      message: 'Number must be between 8 and 10 digits'
    };
  }

  return null;
};

export const validateMessage = (content: string): ValidationError | null => {
  if (!content || content.trim() === '') {
    return {
      field: 'content',
      message: 'Message cannot be empty'
    };
  }

  if (content.length > 500) {
    return {
      field: 'content',
      message: 'Message must be under 500 characters'
    };
  }

  return null;
};