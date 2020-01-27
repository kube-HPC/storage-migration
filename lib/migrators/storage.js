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

const run = async ({ storageBinary, binary, json }) => {
    const source = storageBinary ? json : binary;
    const target = storageBinary ? binary : json;
    log.info(`migrating from ${storageBinary ? 'json' : 'binary'} to ${storageBinary ? 'binary' : 'json'}`);
    await handleStore({ source, target });
};

module.exports = {
    run
};
