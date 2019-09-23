## Basic setup

1. install Node if you haven't already: https://nodejs.org/en/

2. install node_modules: `npm i`

3. most of the scripts are in typescript and should be run using ts-node. To be able to run those scripts, install ts-node globally: `npm i -g ts-node`

4. if you're doing dev work on this project, VSCode is a good choice for an IDE: https://code.visualstudio.com/

## Rank forecasters

Write in the config:

1. fileName
2. numberOfForecasters
3. forecasterIndex

Ex.: if the forecasters are identified from #44 to #58, forecasterIndex should be 44 and numberOfForecasters should be 15.

The input file should contain the following columns:

* ID
* number of the forecaster
* actual
* the actual score of the forecaster as determined by the FOCUS scoring method
* a column for how each forecaster ranked that forecaster

The output file will contain:

* ID
* actual
* meanRank
* medianRank

### Ranking method

The way the ranking is calculated is by:

1. For each forecaster, take the mean|median ranked predicted by other forecasters
2. The lowest scoring forecaster is officially ranked and removed from the remaining set
3. Repeat step 1-3 with remaining forecasters, and don't take into account the forecasted ranked of forecasters already ranked

The rationale is that if the mean|median rank meta-forecasters think a forecaster is, is a poor, this forecaster is probably also bad at meta-forecasting who's a great forecaster, so we recursively remove them from our meta-forecasts (ie. meta-forecasting == forecasting who will be the best forecasters). 

## Code convention

Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) Visual Studio Code plugin.
