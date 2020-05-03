const log = require('@hkube/logger').GetLogFromContainer();

const storeTypes = [
    'algorithm',
    'pipeline',
    'experiment'
];
const handleStore = async ({ source, target }) => {
    for (const type of storeTypes) { // eslint-disable-line no-restricted-syntax
        const paths = await source.hkubeStore.list({ type });
        for (const { path } of paths) { // eslint-disable-line no-restricted-syntax
            try {
                const data = await source.get({ path });
                log.info(`migrating ${path}`);
                await target.put({ path, data });
            }
            catch (error) {
                log.info(`skipping ${path}. Already in the correct format.`);
            }
        }
    }
};

const run = async ({ sourceStorageManager, targetStorageManager }) => {
    const source = sourceStorageManager.encoding._type;
    const target = targetStorageManager.encoding._type;
    log.info(`migrating from ${source} to ${target}`);
    await handleStore({ source: sourceStorageManager, target: targetStorageManager });
};

module.exports = {
    run
};
