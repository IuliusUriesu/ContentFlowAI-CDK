import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { AppStackProps } from '../utils/appStackProps';
import { APP_NAME } from '../config/constants';

export class DynamoDbStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: AppStackProps) {
        super(scope, id, props);

        const tableName = `${props?.stageName}-${APP_NAME}`

        new dynamodb.TableV2(this, tableName, {
            partitionKey: {
                name: "PK",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "SK",
                type: dynamodb.AttributeType.STRING,
            },
            tableName,
            billing: dynamodb.Billing.onDemand(),
            tags: [ { key: "Project", value: APP_NAME } ]
        });
    }
}