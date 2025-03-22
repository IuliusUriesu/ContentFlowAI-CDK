import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { APP_NAME } from "../config/constants";

export class SqsStack extends cdk.Stack {
    public userProfileQueue: sqs.IQueue;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const userProfileQueueName = `${stageName}-${APP_NAME}-UserProfileQueue`;
        this.userProfileQueue = new sqs.Queue(this, userProfileQueueName, {
            queueName: userProfileQueueName,
            visibilityTimeout: cdk.Duration.seconds(120),
            retentionPeriod: cdk.Duration.days(1),
        });
    }
}
