module.exports = {
    USER_FILE_LIMIT: 1024 * 1024 * 110, //100MB
    PER_USER_LIMIT: 1024 * 1024 * 160, //160MB max limit
    ANON_FILE_LIMIT: 1024 * 1024 * 11, //10MB
    HOUR: 1000 * 60 * 60,
    DAY: this.HOUR * 24,
    WEEK: this.DAY * 7,
    ANON_S3_LIMIT: 1024 * 1024 * 1024 * 2, //2GB
    USER_S3_LIMIT: 1024 * 1024 * 1024 * 20 //20GB
};