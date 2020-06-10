const log = require('@hkube/logger').GetLogFromContainer();

const handleStore = async ({ source, target }) => {
    try {
        const storePath = source.prefixesTypes.find(p => p.endsWith('hkube-store'));
        const storeTypes = await source.storage.listPrefixes({ path: storePath });

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
    }
    catch (e) {
        log.error(e.message);
    }
};

const run = async ({ source, target }) => {
    log.info(`migrating from ${source.encoding._type} to ${target.encoding._type}`);
    await handleStore({ source, target });
};

module.exports = {
    run
};
