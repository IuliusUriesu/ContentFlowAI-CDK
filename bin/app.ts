#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { environments } from '../lib/config/awsEnvironment';
import { HelloWorldStack } from '../lib/stacks/helloWorldStack';

const app = new cdk.App();

for (const env of environments) {
    const { stageName, account, region } = env;

    new HelloWorldStack(app, `${stageName}/HelloWorldStack`, {
        env: { account, region }
    });
}