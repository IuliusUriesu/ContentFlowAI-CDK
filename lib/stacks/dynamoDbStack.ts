import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { AppStackProps } from "../utils/utils";
import { APP_NAME } from "../config/constants";

export class DynamoDbStack extends cdk.Stack {
    public appDataTable: dynamodb.TableV2;
    public generatedContentGsiName: string;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const tableName = `${APP_NAME.toLowerCase()}_data`;

        this.appDataTable = new dynamodb.TableV2(this, tableName, {
            partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
            tableName,
            billing: dynamodb.Billing.onDemand(),
        });

        this.generatedContentGsiName = "generated_content_gsi";
        this.appDataTable.addGlobalSecondaryIndex({
            indexName: this.generatedContentGsiName,
            partitionKey: { name: "generatedContentId", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });
    }
}
