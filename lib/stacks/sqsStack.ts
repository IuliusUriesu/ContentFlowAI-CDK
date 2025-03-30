import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { APP_NAME } from "../config/constants";

export class SqsStack extends cdk.Stack {
    public brandSummaryRequestQueue: sqs.IQueue;
    public contentRequestQueue: sqs.IQueue;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        // BrandSummaryRequest Queue
        const brandSummaryRequestQueueName = `${stageName}-${APP_NAME}-BrandSummaryRequestQueue`;
        const brandSummaryRequestDlqName = `${stageName}-${APP_NAME}-BrandSummaryRequestDLQ`;

        const brandSummaryRequestDlq = new sqs.Queue(this, brandSummaryRequestDlqName, {
            queueName: brandSummaryRequestDlqName,
            retentionPeriod: cdk.Duration.days(7),
        });

        this.brandSummaryRequestQueue = new sqs.Queue(this, brandSummaryRequestQueueName, {
            queueName: brandSummaryRequestQueueName,
            visibilityTimeout: cdk.Duration.seconds(120),
            retentionPeriod: cdk.Duration.days(1),
            deadLetterQueue: {
                queue: brandSummaryRequestDlq,
                maxReceiveCount: 3,
            },
        });

        // ContentRequest Queue
        const contentRequestQueueName = `${stageName}-${APP_NAME}-ContentRequestQueue`;
        const contentRequestDlqName = `${stageName}-${APP_NAME}-ContentRequestDLQ`;

        const contentRequestDlq = new sqs.Queue(this, contentRequestDlqName, {
            queueName: contentRequestDlqName,
            retentionPeriod: cdk.Duration.days(7),
        });

        this.contentRequestQueue = new sqs.Queue(this, contentRequestQueueName, {
            queueName: contentRequestQueueName,
            visibilityTimeout: cdk.Duration.seconds(150),
            retentionPeriod: cdk.Duration.days(1),
            deadLetterQueue: {
                queue: contentRequestDlq,
                maxReceiveCount: 3,
            },
        });
    }
}
