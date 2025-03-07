export default defineEventHandler((event) => {
    throw createError({
        statusCode: 404,
        statusMessage: 'Resource Not Found',
        data: { message: 'The requested resource does not exist' },
    });
});