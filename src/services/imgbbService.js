// ImgBB Cloud Image Upload Service for Beli Pharmacy (বেলী ফার্মেসি)
// Fast, reliable image hosting for prescriptions, customer avatars, medicine photos, and banners.
// Powered by ImgBB Official API.

export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'b395f6864d45d106edff4457768f6fae';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

/**
 * Converts a dataURL string (base64) to a Blob object
 * @param {string} dataUrl 
 * @returns {Blob}
 */
export const dataURLtoBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Uploads an image to ImgBB and returns direct CDN image URL
 * @param {File|Blob|string} imageFile - File object, Blob, or base64 data URL
 * @param {string} [customName] - Optional filename
 * @returns {Promise<{success: boolean, url: string, displayUrl: string, thumbUrl: string, deleteUrl: string, error?: string}>}
 */
export const uploadImageToImgBB = async (imageFile, customName = '') => {
  if (!imageFile) {
    throw new Error('No image file provided for upload.');
  }

  try {
    const formData = new FormData();
    const apiKey = IMGBB_API_KEY.trim();
    formData.append('key', apiKey);

    // Format filename
    const safeName = customName
      ? customName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
      : `beli_${Date.now()}`;

    if (typeof imageFile === 'string') {
      // It's a base64 string or dataURL
      if (imageFile.startsWith('data:')) {
        const blob = dataURLtoBlob(imageFile);
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        formData.append('image', blob, `${safeName}.${ext}`);
      } else {
        // Raw base64 string
        formData.append('image', imageFile);
      }
    } else if (imageFile instanceof Blob || imageFile instanceof File) {
      // Ensure file has filename
      const filename = imageFile.name || `${safeName}.jpg`;
      formData.append('image', imageFile, filename);
    } else {
      throw new Error('Unsupported image format for ImgBB upload.');
    }

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errMsg = result?.error?.message || `ImgBB upload failed with status ${response.status}`;
      console.error('[ImgBB Upload Error]:', errMsg, result);
      return {
        success: false,
        error: errMsg,
        url: '',
        displayUrl: '',
        thumbUrl: '',
        deleteUrl: ''
      };
    }

    const { data } = result;
    return {
      success: true,
      url: data.url || data.display_url,
      displayUrl: data.display_url || data.url,
      thumbUrl: data.thumb?.url || data.url,
      deleteUrl: data.delete_url || '',
      width: data.width,
      height: data.height,
      size: data.size,
      raw: data
    };
  } catch (error) {
    console.error('[ImgBB Upload Exception]:', error);
    return {
      success: false,
      error: error.message || 'Network error while uploading image to ImgBB.',
      url: '',
      displayUrl: '',
      thumbUrl: '',
      deleteUrl: ''
    };
  }
};

/**
 * Convenience helper to upload a prescription photo
 */
export const uploadPrescriptionImage = async (fileOrBase64, patientPhone = '') => {
  const prefix = patientPhone ? `presc_${patientPhone}_${Date.now()}` : `presc_${Date.now()}`;
  return await uploadImageToImgBB(fileOrBase64, prefix);
};

/**
 * Convenience helper to upload a medicine photo
 */
export const uploadMedicinePhoto = async (fileOrBase64, medicineName = '') => {
  const prefix = medicineName ? `med_${medicineName}_${Date.now()}` : `med_${Date.now()}`;
  return await uploadImageToImgBB(fileOrBase64, prefix);
};

/**
 * Convenience helper to upload a customer avatar
 */
export const uploadCustomerAvatar = async (fileOrBase64, customerPhone = '') => {
  const prefix = customerPhone ? `avatar_${customerPhone}_${Date.now()}` : `avatar_${Date.now()}`;
  return await uploadImageToImgBB(fileOrBase64, prefix);
};

/**
 * Convenience helper to upload a banner or slider image
 */
export const uploadBannerSlideImage = async (fileOrBase64, slideTitle = '') => {
  const prefix = slideTitle ? `banner_${slideTitle}_${Date.now()}` : `banner_${Date.now()}`;
  return await uploadImageToImgBB(fileOrBase64, prefix);
};
