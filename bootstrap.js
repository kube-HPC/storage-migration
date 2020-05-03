const configIt = require('@hkube/config');
const Logger = require('@hkube/logger');
const { main, logger } = configIt.load();
const log = new Logger(main.serviceName, logger);
const { StorageManager } = require('@hkube/storage-manager');
const component = require('./lib/consts/componentNames').MAIN;
const storageMigrator = require('./lib/migrators/storage');
const pipelineMigrator = require('./lib/migrators/pipelines');
class Bootstrap {
    async init() {
        try {
            this._handleErrors();
            log.info(`running application with env: ${configIt.env()}, version: ${main.version}, node: ${process.versions.node}`, { component });
            const sourceStorageManager = new StorageManager();
            const sourceConfig = { ...main };
            sourceConfig.storageAdapters.fs.encoding = sourceConfig.sourceStorage;
            sourceConfig.storageAdapters.s3.encoding = sourceConfig.sourceStorage;
            await sourceStorageManager.init(sourceConfig, log);

            const targetConfig = { ...main };
            targetConfig.storageAdapters.fs.encoding = targetConfig.targetStorage;
            targetConfig.storageAdapters.s3.encoding = targetConfig.targetStorage;
            const targetStorageManager = new StorageManager();
            await targetStorageManager.init(targetConfig, log)

            await storageMigrator.run({ sourceStorageManager, targetStorageManager });
            await pipelineMigrator.run(main);

            return main;
        }
        catch (error) {
            this._onInitFailed(error);
        }
        return true;
    }

    _onInitFailed(error) {
        log.error(error.message, { component }, error);
        process.exit(1);
    }

    _handleErrors() {
        process.on('exit', (code) => {
            log.info(`exit code ${code}`, { component });
        });
        process.on('SIGINT', () => {
            log.info('SIGINT', { component });
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            log.info('SIGTERM', { component });
            process.exit(0);
        });
        process.on('unhandledRejection', (error) => {
            log.error(`unhandledRejection: ${error.message}`, { component }, error);
            process.exit(1);
        });
        process.on('uncaughtException', (error) => {
            log.error(`uncaughtException: ${error.message}`, { component }, error);
            process.exit(1);
        });
    }
}

module.exports = new Bootstrap();
