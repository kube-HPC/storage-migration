const config = {};
const packageJson = require(process.cwd() + '/package.json');
config.version = packageJson.version;

const formatter = require(process.cwd() + '/lib/utils/formatters');

config.serviceName = 'storage-migration';
config.defaultStorage = process.env.DEFAULT_STORAGE || 's3';

config.clusterName = process.env.CLUSTER_NAME || 'local';
config.sourceStorage = process.env.SOURCE_STORAGE_ENCODING || 'bson';
config.targetStorage = process.env.STORAGE_ENCODING || 'msgpack';

config.storageAdapters = {
    s3: {
        connection: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAIOSFODNN7EXAMPLE',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            endpoint: process.env.S3_ENDPOINT_URL || 'http://127.0.0.1:9000',
        },
        encoding: config.targetStorage,
        moduleName: process.env.STORAGE_MODULE || '@hkube/s3-adapter'
    },
    fs: {
        connection: {
            baseDirectory: process.env.BASE_FS_ADAPTER_DIRECTORY || '/var/tmp/fs/storage',
        },
        encoding: config.targetStorage,
        moduleName: process.env.STORAGE_MODULE || '@hkube/fs-adapter'
    }
};

config.apiServer = {
    protocol: process.env.IS_SECURE ? 'https' : 'http',
    host: process.env.API_SERVER_SERVICE_HOST || 'localhost',
    port: process.env.API_SERVER_SERVICE_PORT || 3000,
    basePath: process.env.API_SERVER_SERVICE_PATH || 'api/v1'
};

module.exports = config;
