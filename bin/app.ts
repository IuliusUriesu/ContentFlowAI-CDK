#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DynamoDbStack } from '../lib/stacks/dynamoDbStack';
import { stageProps } from '../lib/config/stageConfig';
import { DnsStack } from '../lib/stacks/dnsStack';
import { APP_NAME } from '../lib/config/constants';

const app = new cdk.App();

for (const props of stageProps) {

    const { stageName, env, websiteUrl, apiUrl } = props;

    const tags = {
        "Project": APP_NAME,
        "Stage": stageName,
    };

    new DynamoDbStack(app, `${stageName}-DynamoDbStack`, {
        env,
        stageName,
        tags,
    });

    new DnsStack(app, `${stageName}-DnsStack`, {
        env,
        stageName,
        tags,
        websiteUrl,
        apiUrl,
    });
}