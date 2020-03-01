const axios = require('axios').default;
const log = require('@hkube/logger').GetLogFromContainer();
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const handlePipelines = async ({ baseUri }) => {
    try {
        const pipelines = await axios.get(`${baseUri}/store/pipelines`);
        for (const pipeline of pipelines.data) { // eslint-disable-line
            if (pipeline.options && pipeline.options.concurrentPipelines && typeof pipeline.options.concurrentPipelines === 'number') {
                const concurrent = {
                    amount: pipeline.options.concurrentPipelines,
                    rejectOnFailure: true
                };
                pipeline.options.concurrentPipelines = concurrent;
                try {
                    await axios.put(`${baseUri}/store/pipelines`, pipeline);
                }
                catch (error) {
                    log.error(`Failed to update pipeline ${pipeline.name}. error: ${error.message}`, error);
                }
                await sleep(200);
            }
        }
    }
    catch (error) {
        log.error(`Failed to fetch pipelines. error: ${error.message}`, error);
    }
};

const run = async (options) => {
    const { protocol, host, port, basePath } = options.apiServer;
    const baseUri = `${protocol}://${host}:${port}/${basePath}`;
    log.info('migrating concurrent pipelines');
    await handlePipelines({ baseUri });
};

module.exports = {
    run
};
