import { writeFileSync } from "fs";
import config from "../config";

import csvtojson = require("csvtojson");
import rank, { ForecasterScore } from "./rank";

async function getInformationFromCSV(
  csvFilepath: string,
  forecasterIndex: number,
  numberOfForecasters: number
): Promise<ForecasterScore[]> {
  let listJSON: string[];
  try {
    listJSON = await csvtojson().fromFile(csvFilepath);
  } catch (err) {
    throw new Error(err);
  }

  return formatJSON(listJSON, forecasterIndex, numberOfForecasters);
}

const formatJSON = (
  csvJSON: string[],
  forecasterIndex: number,
  numberOfForecasters: number
): ForecasterScore[] => {
  return csvJSON.map(row => {
    const forecastersIDs = [...Array(numberOfForecasters).keys()].map(
      e => e + forecasterIndex
    );

    let forecastedRank = {};
    forecastersIDs.forEach(ID => {
      if (row[ID]) {
        forecastedRank[ID] = parseInt(row[ID]);
      }
    });

    const forecasterScore: ForecasterScore = {
      ID: row["ID"],
      // self: row["self"],
      // median: row["median"],
      // average: row["average"],
      actual: row["actual"],
      forecastedRank: forecastedRank
    };

    return forecasterScore;
  });
};

const outputCSV = (rankedForecasters: ForecasterScore[], inputFileName) => {
  const date: Date = new Date();
  const dateTime: string =
    [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-") +
    " " +
    [date.getHours(), date.getMinutes(), date.getSeconds()].join("-");

  const fileName: string = `${dateTime} - ${inputFileName}`;

  const columns = ["ID", "meanRank", "medianRank", "actual"];
  const fileContent: string =
    columns.join(",") +
    "\n" +
    rankedForecasters
      .map(rankedForecaster =>
        columns.map(column => rankedForecaster[column]).join(",")
      )
      .join("\n");

  const filePath: string = `rank/ranked/${fileName}.csv`;

  writeFileSync(filePath, fileContent);
};

async function rankFromCSV(): Promise<void> {
  const filePath: string = `rank/toRank/${config.fileName}`;
  const forecasterScores: ForecasterScore[] = await getInformationFromCSV(
    filePath,
    config.forecasterIndex,
    config.numberOfForecasters
  );

  const rankedForecasters: ForecasterScore[] = rank(forecasterScores);

  outputCSV(rankedForecasters, config.fileName);
}

rankFromCSV().catch(error => console.error(error));
