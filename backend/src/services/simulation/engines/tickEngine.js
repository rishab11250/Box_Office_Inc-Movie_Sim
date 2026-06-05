import { processDirectorAwards } from "../../director/directorAwardsService.js";
import { processDirectorAging } from "./directorEngine.js";
import { processDirectingProjects } from "./directingProjectEngine.js";
import { processWriterPayroll } from "./payrollEngine.js";
import { processWritingProjects } from "./writerEngine.js";

import { processWriterAging } from "../helpers/agingHelper.js";

export const processWeeklyTick = async (gameState, studio) => {
  processWriterPayroll(gameState, studio);

  await processWritingProjects(gameState, studio);

  processDirectingProjects(gameState, studio);

  processWriterAging(gameState);

  processDirectorAging(gameState);

  processDirectorAwards(gameState, studio);

  return gameState;
};

export default processWeeklyTick;
