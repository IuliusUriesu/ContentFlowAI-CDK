#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/stacks/dynamoDbStack";
import { stageProps } from "../lib/config/stageConfig";
import { DnsStack } from "../lib/stacks/dnsStack";
import { APP_NAME } from "../lib/config/constants";
import { ApiStack } from "../lib/stacks/apiStack";
import { LambdaStack } from "../lib/stacks/lambdaStack";
import { CognitoStack } from "../lib/stacks/cognitoStack";
import { SqsStack } from "../lib/stacks/sqsStack";

const app = new cdk.App();

for (const props of stageProps) {
    const { stageName, env, websiteDomain, apiDomain } = props;

    const tags = {
        Project: APP_NAME,
        Stage: stageName,
    };

    const sharedStackProps = { env, stageName, tags };

    const dynamoDbStack = new DynamoDbStack(app, `${stageName}-DynamoDbStack`, {
        ...sharedStackProps,
    });

    const dnsStack = new DnsStack(app, `${stageName}-DnsStack`, {
        ...sharedStackProps,
        websiteDomain,
        apiDomain,
    });

    const cognitoStack = new CognitoStack(app, `${stageName}-CognitoStack`, {
        ...sharedStackProps,
    });

    const sqsStack = new SqsStack(app, `${stageName}-SqsStack`, {
        ...sharedStackProps,
    });

    const lambdaStack = new LambdaStack(app, `${stageName}-LambdaStack`, {
        ...sharedStackProps,
        appDataTable: dynamoDbStack.appDataTable,
        brandSummaryRequestQueue: sqsStack.brandSummaryRequestQueue,
        contentRequestQueue: sqsStack.contentRequestQueue,
    });

    const apiStack = new ApiStack(app, `${stageName}-ApiStack`, {
        ...sharedStackProps,
        apiDomain,
        apiCertificate: dnsStack.apiCertificate,
        userPool: cognitoStack.userPool,
        defaultFunction: lambdaStack.defaultFunction,
        createUserProfile: lambdaStack.createUserProfile,
        createContentRequest: lambdaStack.createContentRequest,
        getAllContentRequests: lambdaStack.getAllContentRequests,
        getContentRequest: lambdaStack.getContentRequest,
        getAllGeneratedContent: lambdaStack.getAllGeneratedContent,
    });
}
