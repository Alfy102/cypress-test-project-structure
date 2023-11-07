const cypress = require('cypress');
// To trim first 2 elements
const arg = process.argv.slice(2);
 
const argObject={};
arg.forEach(argument => {
  let keyValue = argument.split('=');

  argObject[keyValue[0]] = keyValue[1];    
});

async function cypressRun() {
  let featureFile;
  let logPath;
  if (!(argObject.feature.includes('.feature'))){
    featureFile = argObject.feature + '.feature';
  } else {
    featureFile = argObject.feature;
  }
  //Run Cypress Test
  const cypressTestResult = await cypress.run({
    browser: argObject.browser,
    project: `./${argObject.project}/`,
    configFile: `./cypress.config.${argObject.project}.js`,
    spec: `${argObject.project}/cypress/e2e/**/${featureFile}`,
    config: {
      video: Boolean(argObject.video)
    },
  });

  console.log(cypressTestResult)
}

cypressRun();






