#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DynamoDbStack } from '../lib/stacks/dynamoDbStack';
import { stageProps } from '../lib/config/stageConfig';
import { DnsStack } from '../lib/stacks/dnsStack';
import { APP_NAME } from '../lib/config/constants';
import { ApiStack } from '../lib/stacks/apiStack';
import { LambdaStack } from '../lib/stacks/lambdaStack';

const app = new cdk.App();

for (const props of stageProps) {

    const { stageName, env, websiteDomain, apiDomain } = props;

    const tags = {
        "Project": APP_NAME,
        "Stage": stageName,
    };

    const dynamoDbStack = new DynamoDbStack(app, `${stageName}-DynamoDbStack`, {
        env,
        stageName,
        tags,
    });

    const dnsStack = new DnsStack(app, `${stageName}-DnsStack`, {
        env,
        stageName,
        tags,
        websiteDomain,
        apiDomain,
    });

    const lambdaStack = new LambdaStack(app, `${stageName}-LambdaStack`, {
        env,
        stageName,
        tags,
    });

    const apiStack = new ApiStack(app, `${stageName}-ApiStack`, {
        env,
        stageName,
        tags,
        helloFunction: lambdaStack.helloFunction,
        apiDomain,
        apiCertificate: dnsStack.apiCertificate,
    });
}