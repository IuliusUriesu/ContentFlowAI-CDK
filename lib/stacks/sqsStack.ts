import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { APP_NAME } from "../config/constants";

export class SqsStack extends cdk.Stack {
    public brandSummaryRequestQueue: sqs.IQueue;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const brandSummaryRequestQueueName = `${stageName}-${APP_NAME}-BrandSummaryRequestQueue`;
        this.brandSummaryRequestQueue = new sqs.Queue(this, brandSummaryRequestQueueName, {
            queueName: brandSummaryRequestQueueName,
            visibilityTimeout: cdk.Duration.seconds(150),
            retentionPeriod: cdk.Duration.days(1),
        });
    }
}
