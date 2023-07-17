import express from "express";

import { ConfigReader } from "../config/ConfigReader";
import { optimismBedrockHandler } from "../handler/optimism-bedrock/optimismBedrockHandler";
import { signingHandler } from "../handler/signing/signingHandler";

export function ccipGateway(config: ConfigReader) {
    const router = express.Router();

    router.get("/:resolverAddr/:calldata", async (req: express.Request, res: express.Response) => {
        const { resolverAddr } = req.params;
        const calldata = req.params.calldata.replace(".json", "");

        try {
            const configEntry = config.getConfigForResolver(resolverAddr);

            if (!configEntry) {
                console.log(`Unknown resolver selector pair for resolverAddr: ${resolverAddr}`);
                console.log(config);
                res.status(404).send({
                    message: "Unknown resolver selector pair",
                });
                return;
            }
            switch (configEntry.type) {
                case "signing": {
                    const response = await signingHandler(calldata, resolverAddr, configEntry);
                    res.status(200).send({ data: response });
                    break;
                }
                case "optimism-bedrock": {
                    const response = await optimismBedrockHandler(calldata, resolverAddr, configEntry);
                    // console.log(response);
                    res.status(200).send({ data: response });
                    break;
                }

                default:
                    res.status(404).send({
                        message: "Unsupported entry type",
                    });
            }
        } catch (e) {
            req.app.locals.logger.warn((e as Error).message);
            res.status(400).send({ message: "Unknown error" });
        }
    });
    return router;
}
