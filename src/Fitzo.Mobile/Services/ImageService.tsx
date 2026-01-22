import apiClient from './ApiClient';

export const uploadImage = async (url: string, imageUri: string) => {
    const formData = new FormData();
    
    formData.append('file', {
        uri: imageUri,
        name: 'upload.jpg',
        type: 'image/jpeg',
    } as any);

    try {
        await apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return true;
    } catch (error) {
        console.error("Błąd wysyłania zdjęcia:", error);
        return false;
    }
};