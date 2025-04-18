const getDateRange = (period: 'daily' | 'monthly') => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'daily') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
    } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { startDate, endDate };
};

export default getDateRange;