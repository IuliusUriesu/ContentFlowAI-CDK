#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DynamoDbStack } from '../lib/stacks/dynamoDbStack';
import { stageProps } from '../lib/config/stageConfig';

const app = new cdk.App();

for (const props of stageProps) {
    
    const { stageName, env } = props;

    new DynamoDbStack(app, `${stageName}-DynamoDbStack`, {
        env,
        stageName,
    });
}