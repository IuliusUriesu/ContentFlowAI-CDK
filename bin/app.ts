#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { environments } from '../lib/config/awsEnvironment';
import { DynamoDbStack } from '../lib/stacks/dynamoDbStack';

const app = new cdk.App();

for (const env of environments) {
    const { stageName, account, region } = env;

    new DynamoDbStack(app, `${stageName}-DynamoDbStack`, {
        env: { account, region },
        stageName,
    })
}