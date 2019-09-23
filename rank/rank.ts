import { mean } from "lodash";

export interface ForecasterScore {
  ID: number;
  self?: number;
  score?: number;
  actual: number;
  forecastedRank: object;
  meanRank?: number;
  medianRank?: number;
}

// utility functions
const median = array => {
  const sortedArray = array.sort();
  const arrayLength = array.length;

  if (arrayLength % 2 === 0) {
    return (
      (sortedArray[arrayLength / 2 - 1] + sortedArray[arrayLength / 2]) / 2
    );
  } else {
    return sortedArray[(arrayLength - 1) / 2];
  }
};

const scoreForecaster = (
  forecasters: ForecasterScore[],
  scoringMethod: Function,
  rankType: string
): void => {
  const remainingForecasterIDs = forecasters
    .filter(forecaster => forecaster[rankType] === undefined)
    .map(remainingForecaster => remainingForecaster.ID);

  forecasters.forEach(forecaster => {
    const remainingForecastersForecastedRank: number[] = remainingForecasterIDs
      .map(ID => forecaster.forecastedRank[ID])
      .filter(forecastedRank => forecastedRank !== undefined);

    if (remainingForecastersForecastedRank.length === 0) {
      return 0;
    } else {
      return (forecaster.score = scoringMethod(
        remainingForecastersForecastedRank
      ));
    }
  });
};

const getWorstScore = (
  forecasters: ForecasterScore[],
  rankType: string
): number => {
  return forecasters
    .filter(forecaster => forecaster[rankType] === undefined)
    .map(forecaster => forecaster.score)
    .reduce((worstScoreSoFar, score) => {
      return Math.min(worstScoreSoFar, score);
    });
};

const removeWorstForecasters = (
  forecasters: ForecasterScore[],
  nthRank: number,
  worstScore: number,
  rankType: string
): number => {
  const numberOfEquallyWorstForecasters = forecasters.filter(
    forecaster =>
      forecaster.score === worstScore && forecaster[rankType] === undefined
  ).length;

  if (numberOfEquallyWorstForecasters === 0) {
    throw new Error("no forecaster was removed");
  }

  forecasters.map(forecaster => {
    if (forecaster.score === worstScore && forecaster[rankType] === undefined) {
      forecaster[rankType] = nthRank - numberOfEquallyWorstForecasters + 1;
    }
  });

  return numberOfEquallyWorstForecasters;
};

const rankByScoringMethod = (
  forecasters: ForecasterScore[],
  scoreByScoringMethod: Function,
  rankType: string
): void => {
  let nthRank: number = 0;

  while (nthRank < forecasters.length) {
    scoreForecaster(forecasters, scoreByScoringMethod, rankType);
    const worstScore: number = getWorstScore(forecasters, rankType);
    const numberOfForecastersRemoved: number = removeWorstForecasters(
      forecasters,
      forecasters.length - nthRank,
      worstScore,
      rankType
    );

    nthRank += numberOfForecastersRemoved;
  }
};

const rank = (forecasters: ForecasterScore[]): ForecasterScore[] => {
  rankByScoringMethod(forecasters, mean, "meanRank");
  rankByScoringMethod(forecasters, median, "medianRank");
  return forecasters;
};

export default rank;
