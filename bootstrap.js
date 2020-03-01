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
            const storageManagerBinary = new StorageManager();
            const configBinary = { ...main };
            configBinary.storageAdapters.fs.connection.binary = true;
            configBinary.storageAdapters.s3.connection.binary = true;
            await storageManagerBinary.init(configBinary, log)
            storageManagerBinary.mode='binary'
            const configJson = { ...main };
            configJson.storageAdapters.fs.connection.binary = false;
            configJson.storageAdapters.s3.connection.binary = false;
            const storageManagerJson = new StorageManager();
            await storageManagerJson.init(configJson, log)
            storageManagerJson.mode='json'

            await storageMigrator.run({ binary: storageManagerBinary, json: storageManagerJson, storageBinary: main.storageBinary });
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
