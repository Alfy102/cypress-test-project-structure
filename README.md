Use to test Cypres issue


To launch headless mode for project1:

`npm run project1Test -- feature=InitialTest browser=chrome`

To launch headless mode for project2:

`npm run project2Test -- feature=InitialTest browser=chrome`


The only difference between project1 and project2 is the reporter option in both config files:

project 1: `reporter: 'cypress-multi-reporters',`

project2: `reporter: '../node_modules/cypress-multi-reporters/index.js',`
