#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/stacks/dynamoDbStack";
import { stageProps } from "../lib/config/stageConfig";
import { ApiCertificateStack } from "../lib/stacks/apiCertificateStack";
import { APP_NAME } from "../lib/config/constants";
import { ApiStack } from "../lib/stacks/apiStack";
import { LambdaStack } from "../lib/stacks/lambdaStack";
import { CognitoStack } from "../lib/stacks/cognitoStack";
import { SqsStack } from "../lib/stacks/sqsStack";
import { WebsiteStack } from "../lib/stacks/websiteStack";
import { KmsStack } from "../lib/stacks/kmsStack";

const app = new cdk.App();

for (const props of stageProps) {
    const { stageName, env, websiteDomain, apiDomain, websiteCertificateArn } = props;

    const tags = {
        Project: APP_NAME,
        Stage: stageName,
    };

    const sharedStackProps = { env, stageName, tags };

    const dynamoDbStack = new DynamoDbStack(app, `${stageName}-DynamoDbStack`, {
        ...sharedStackProps,
    });

    const apiCertificateStack = new ApiCertificateStack(app, `${stageName}-ApiCertificateStack`, {
        ...sharedStackProps,
        apiDomain,
    });

    const cognitoStack = new CognitoStack(app, `${stageName}-CognitoStack`, {
        ...sharedStackProps,
        websiteDomain,
    });

    const sqsStack = new SqsStack(app, `${stageName}-SqsStack`, {
        ...sharedStackProps,
    });

    const kmsStack = new KmsStack(app, `${stageName}-KmsStack`, {
        ...sharedStackProps,
    });

    const lambdaStack = new LambdaStack(app, `${stageName}-LambdaStack`, {
        ...sharedStackProps,
        appDataTable: dynamoDbStack.appDataTable,
        generatedContentGsiName: dynamoDbStack.generatedContentGsiName,
        brandSummaryRequestQueue: sqsStack.brandSummaryRequestQueue,
        contentRequestQueue: sqsStack.contentRequestQueue,
        userAnthropicApiKeyMasterKey: kmsStack.userAnthropicApiKeyMasterKey,
    });

    const apiStack = new ApiStack(app, `${stageName}-ApiStack`, {
        ...sharedStackProps,
        apiDomain,
        apiCertificate: apiCertificateStack.apiCertificate,
        userPool: cognitoStack.userPool,
        websiteDomain,
        defaultFunction: lambdaStack.defaultFunction,
        createUserProfile: lambdaStack.createUserProfile,
        getUserProfile: lambdaStack.getUserProfile,
        createContentRequest: lambdaStack.createContentRequest,
        getAllContentRequests: lambdaStack.getAllContentRequests,
        getContentRequest: lambdaStack.getContentRequest,
        getAllGeneratedContent: lambdaStack.getAllGeneratedContent,
        getGeneratedContentPiece: lambdaStack.getGeneratedContentPiece,
        editGeneratedContentPiece: lambdaStack.editGeneratedContentPiece,
    });

    // CloudFront Distribution requires certificates to be in region 'us-east-1'
    // Stacks cannot have cross-region references, hence website certificates were created manually
    const websiteStack = new WebsiteStack(app, `${stageName}-WebsiteStack`, {
        ...sharedStackProps,
        websiteDomain,
        websiteCertificateArn,
    });
}
