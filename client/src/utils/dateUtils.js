/**
 * Generates the current date in YYYY-MM-DD format based on Indian Standard Time (IST).
 * This ensures consistency between frontend and backend regardless of the user's local timezone.
 * IST is UTC + 5:30.
 */
export const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
};

/**
 * Formats a given date object or string into YYYY-MM-DD in IST.
 */
export const formatToISTDate = (date) => {
    const d = new Date(date);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
};
