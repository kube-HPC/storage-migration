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

            const source = await this._createStorage(main.sourceStorage);
            const target = await this._createStorage(main.targetStorage);

            await storageMigrator.run({ source, target });
            await pipelineMigrator.run(main);
        }
        catch (error) {
            this._onInitFailed(error);
        }
    }

    async _createStorage(encoding) {
        const storageManager = new StorageManager();
        const config = { ...main };
        config.storageAdapters[config.defaultStorage].encoding = encoding;
        await storageManager.init(config, log);
        return storageManager;
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
