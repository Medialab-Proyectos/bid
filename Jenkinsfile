#!groovy

// You should use a compatible version of pipeline utils according to you Job.
// Reach Enterprise Architecture team for more information.
def pipelineUtilsVersion = "temp-FiduciaryInterface"

// Reach Enterprise Architecture team to get this information.
def projectKey = "${env.BUSINESS_FIDUCIARY_INTERFACE_WEBAPP_KEY}"
def projectName = "${env.BUSINESS_FIDUCIARY_INTERFACE_WEBAPP_NAME}"

// Folder structure that separete the different Jobs.
// Change only if needed.
def wsDir = "${WORKSPACE_ROOT}${projectKey}\\${env.BRANCH_NAME}-${env.BUILD_NUMBER}"

// URLs of Microsoft Office 365 Webhooks to receive notifications.
// Multiple URLs are supported.
//
// Can be configured as a Teams Connector, please refer to the link below on how to configure it.
// https://idbg.sharepoint.com/:w:/s/EnterpriseArchitecture/EWNMqsUrRidHtOClNl-vLTwBCJadNZDRy9t5HW15n3enjw?e=LRc88q
String[] microsoftTeamsWebhooks = ["", ""]

// Interval variables. Please do not remove them.
def err = null
def utils = null
currentBuild.result = "SUCCESS"

def buildsByBranch = ["develop":"dev", "test":"test", "hotfix":"hotfix", "qa":"qa", "master":"production"]

String[] automaticDeploymentBranches = ["develop", "test", "qa", "hotfix/integration"]

node('iadb-win-io-optimized') {
    ws (wsDir) {  
        try {
            // This step will checkout the most updated code in the current branch from Bitbucket.
            stage('Checking out code') {
                bat "git config --system core.longpaths true"
                checkout scm
            }

            // ╔═╗┬  ┌─┐┌─┐┌─┐┌─┐  ┌┬┐┌─┐┌┐┌┌┬┐  ┌─┐┬ ┬┌─┐┌┐┌┌─┐┌─┐  ┌┬┐┬ ┬┬┌─┐  ┌─┐┌┬┐┌─┐┌─┐
            // ╠═╝│  ├┤ ├─┤└─┐├┤    │││ ││││ │   │  ├─┤├─┤││││ ┬├┤    │ ├─┤│└─┐  └─┐ │ ├┤ ├─┘
            // ╩  ┴─┘└─┘┴ ┴└─┘└─┘  ─┴┘└─┘┘└┘ ┴   └─┘┴ ┴┴ ┴┘└┘└─┘└─┘   ┴ ┴ ┴┴└─┘  └─┘ ┴ └─┘┴  
            stage('Loading pipeline utils') {
                bat "${env.GET_LATEST_PIPELINE_UTILS} ${pipelineUtilsVersion}"
                utils = load "${env.PIPELINE_UTILS_FILE}"            
            }

            stage('Scanning Frontend project') {
                utils.scanJavaScriptAndTypeScript(projectKey, projectName, wsDir)
            }

            // ╔═╗┬  ┌─┐┌─┐┌─┐┌─┐  ┌┬┐┌─┐┌┐┌┌┬┐  ┌─┐┬ ┬┌─┐┌┐┌┌─┐┌─┐  ┌┬┐┬ ┬┬┌─┐  ┌─┐┌┬┐┌─┐┌─┐
            // ╠═╝│  ├┤ ├─┤└─┐├┤    │││ ││││ │   │  ├─┤├─┤││││ ┬├┤    │ ├─┤│└─┐  └─┐ │ ├┤ ├─┘
            // ╩  ┴─┘└─┘┴ ┴└─┘└─┘  ─┴┘└─┘┘└┘ ┴   └─┘┴ ┴┴ ┴┘└┘└─┘└─┘   ┴ ┴ ┴┴└─┘  └─┘ ┴ └─┘┴  
            stage('Executing post-actions') {
                utils.postActions(projectKey, projectName)
            }
            
            stage('Building artifact'){
                def base_href = '/'
                def buildConfig = buildsByBranch.containsKey(env.BRANCH_NAME) ? buildsByBranch.get(env.BRANCH_NAME) : "dev"

                bat "npm install --force"
                bat "npx kendo-ui-license activate"
                bat "npx ng build --base-href ${base_href} --configuration=${buildConfig}"
                utils.createZip("publish.zip", "dist/fiduciaryInterface")
            }

            stage('Deploy artifact to jfrog'){
                utils.uploadFileToArtifactory(projectKey, "publish.zip", "package.json", "NPM_BASED")
            }

            if(utils.shouldStartAutomaticRelease(automaticDeploymentBranches)) {
                stage('Starting automated release') {
                    build job: "FI - IDB.CNVG.Business.FiduciaryInterface.WebApp/Release Orchestrator/Full Release", parameters: [string(name: "environment",value: "Automated"), string(name: "artifact",value: "")], wait: false
                }
            }
        }
        catch (caughtError) {
            err = caughtError
            currentBuild.result = "FAILURE"
        }
        finally {
            stage('Cleanning workspace') {
                cleanWs()
                deleteDir()
                utils.notifyBuildStatus(microsoftTeamsWebhooks)
            }
            if (err) {
                throw err
            }
        }
    }
}