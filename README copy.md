A CLI for Trustworthy Module Re-Use
=========================
## About
This module allows the user to determine the trustworthiness of a Node.js package via a command line interface that uses the URL of the package on npmjs.org or the GitHub repository URL. The trustworthiness of a module is measured by its Net Score, which is calculated via an equation composed of sub-scores. These sub-scores are calculated independently from each other and perform an estimation of the following metrics that are relevant to a module’s trustworthiness: ramp up time, correctness, bus factor, responsive maintainers, and license compatibility. The evaluation of some of these metrics includes the use of the GitHub REST API to access repository data (i.e. number of contributors, number of total closed issues, etc.), and some of the metrics clone the module’s repository to access the data of specific files (i.e. README.md). The Net Score is calculated as a weighted sum of the ramp-up time, correctness, bus factor, and responsive maintainer metrics, with the license compatibility being a calculation requirement for the Net Score to not be set to zero. The weight factors for each of the metrics were chosen to accommodate the stakeholder’s project specifications and priorities. 

## Table of Contents
- [Dependencies](#dependencies)
- [Key Features](#key-features)
- [Version Support](#Version-Support)
- [Installation](#installation)
- [Usage](#usage)
	- [Setup](#Setup)
- [License](#license)

## Dependencies
- commander — npm install commander
- axios — npm install axios
- fs — npm install fs
- path — npm install path
- adm-zip — npm install adm-zip
- dotenv — npm install dotenv
- axios-mock-adapter — npm install axios-mock-adapter

This module has several dependencies that must be installed prior to use. The names of these dependencies and their commands are shown above.

## Key Features
There are several key features that are part of this module. Description of each will be described below.

### Bus Factor
This feature determines the bus factor of packages. It is used to find out how much of an impact it would make if contributors to a package were to ‘get hit by a bus’. Of course, this is not literal. Hopefully. What this does is deliver a score based on how much a package may suffer if it were to lose contributors. The calculation is based on the number of total contributors to a repository, then normalized using a set minimum and maximum number of acceptable contributors. We have set the minimum to be 10 to account for every contributor being active, and the maximum is 100 to account for a large number of contributors being inactive. 

### Correctness
This feature determines the correctness of a package. This is done by finding the total number of issues of all states, and then calculating the percentage of closed issues. The more issues that are left unresolved will lower the score.

The returned score is dependent on the percentage of issues resolved. It will range from 0 to 1.

### Ramp Up
This feature determines how likely it is to ‘ramp up’ people on packages. It is used to find out how detailed, informational, and efficient README.md files are and delivers a score on how quickly and effectively people can get up to speed on packages.

Scores range from 0 to 1. 0 being awfully inadequate and 1 being absolute perfection.  

### Responsive Maintainers
This feature calculates the average time it takes for contributors to respond to an issue. This is done through monitoring comment timestamps. 

If the average issue response time is under 24 hours, then a score of 1 is returned. From there, 0.25 points will be deducted from the score for each additional 24 hours.

### License Compatibility
This feature determines if a package has a license. It simply returns a score of 1 if it contains a license and a score of 0 if there is no mention of one.

### Net Score
The net score is calculated first using the license compatibility score as a check condition to see if the net score should already be set to zero. If the license is compatible, then the net score is calculated as a weighted sum of the remaining four metrics.
-  NetScore = License * (0.2*RampUp + 0.3*Correctness + 0.2*BusFactor + 0.3*ResponsiveMaintainers)

## Installation
git clone https://github.com/kumar488/461-team-repo 


# Usage
### Setup
-  To download files
  -  git clone https://github.com/kumar488/461-team-repo 
- To compile typescript files
  -  npx tsc
- To install required modules
  -  ./run install
- To run net score analysis on a file with URLs
  -  ./run <URL_FILE>
- To run test cases
  -	 ./run test

## License
Released under the LGPLv2.1 license.

