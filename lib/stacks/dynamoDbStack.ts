import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { AppStackProps } from "../utils/appStackProps";
import { APP_NAME } from "../config/constants";

export class DynamoDbStack extends cdk.Stack {
    public appDataTable: dynamodb.TableV2;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const tableName = `${APP_NAME.toLowerCase()}_data`;

        this.appDataTable = new dynamodb.TableV2(this, tableName, {
            partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
            tableName,
            billing: dynamodb.Billing.onDemand(),
        });

        this.appDataTable.addGlobalSecondaryIndex({
            indexName: "generated_content_index",
            partitionKey: { name: "generated_content_id", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });
    }
}
