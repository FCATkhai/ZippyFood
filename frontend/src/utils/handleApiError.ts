const handleApiError = (error: any) => {
    if (error.response) {
        throw new Error(error.response.data.message || "An error occurred");
    }
    throw new Error("Network error occurred");
};

export default handleApiError;
