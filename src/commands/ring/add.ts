import { VariableGroup } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import commander from "commander";
import path from "path";
import { echo } from "shelljs";
import { Bedrock, Config, readYaml, write } from "../../config";
import { fileInfo as bedrockFileInfo } from "../../lib/bedrockYaml";
import {
  build as buildCmd,
  exit as exitCmd,
  validateForRequiredValues
} from "../../lib/commandBuilder";
import { PROJECT_INIT_DEPENDENCY_ERROR_MESSAGE } from "../../lib/constants";
import { hasValue } from "../../lib/validator";
import { logger } from "../../logger";
import {
  IAzurePipelinesYaml,
  IBedrockFile,
  IBedrockFileInfo
} from "../../types";

import decorator from "./add.decorator.json";

/**
 * Executes the command.
 *
 * @param ringName
 */
export const execute = async (
  ringName: string,
  exitFn: (status: number) => Promise<void>
) => {
  if (!hasValue(ringName)) {
    await exitFn(1);
    return;
  }

  try {
    const projectPath = process.cwd();
    logger.verbose(`project path: ${projectPath}`);

    checkDependencies(projectPath);

    // Add ring to bedrock.yaml
    // Add ring to lifecycle pipeline
    // Add ring to all linked service build pipelines

    logger.info(`Successfully added ring: ${ringName} to this project!`);
    await exitFn(0);
  } catch (err) {
    logger.error(`Error occurred while adding ring: ${ringName}`);
    logger.error(err);
    await exitFn(1);
  }
};

export const commandDecorator = (command: commander.Command): void => {
  buildCmd(command, decorator).action(async (ringName: string) => {
    await execute(ringName, async (status: number) => {
      await exitCmd(logger, process.exit, status);
    });
  });
};

/**
 * Check for bedrock.yaml
 * @param projectPath
 */
export const checkDependencies = (projectPath: string) => {
  const fileInfo: IBedrockFileInfo = bedrockFileInfo(projectPath);
  if (fileInfo.exist === false) {
    throw new Error(PROJECT_INIT_DEPENDENCY_ERROR_MESSAGE);
  }
};
