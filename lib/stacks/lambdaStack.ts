import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { APP_NAME } from "../config/constants";

interface LambdaStackProps extends AppStackProps {
    appDataTable: dynamodb.TableV2;
    brandSummaryRequestQueue: sqs.IQueue;
}

interface CreateFunctionInput {
    functionName: string;
    handler: string;
    environment?: { [key: string]: string };
    layers?: lambda.ILayerVersion[];
}

export class LambdaStack extends cdk.Stack {
    private lambdaCodeAsset: lambda.AssetCode;

    public defaultFunction: lambda.IFunction;
    public createUserProfile: lambda.IFunction;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const { stageName, appDataTable, brandSummaryRequestQueue } = props;

        // The place where the lambda code is
        const codePath = "../ContentFlowAI-Lambda/dist";
        this.lambdaCodeAsset = lambda.Code.fromAsset(codePath);

        // Anthropic API Key
        const anthropicApiKeySecretName = `${stageName}-${APP_NAME}/AnthropicApiKey`;
        const anthropicApiKeySecert = secretsmanager.Secret.fromSecretNameV2(
            this,
            anthropicApiKeySecretName,
            anthropicApiKeySecretName,
        );

        // Node Modules Layer
        const nodeModulesLayerName = `${stageName}-NodeModulesLayer`;
        const nodeModulesLayer = new lambda.LayerVersion(this, nodeModulesLayerName, {
            code: lambda.Code.fromAsset("../ContentFlowAI-Lambda/layers/node-modules-layer"),
        });

        // Default Function
        this.defaultFunction = this.createFunction({
            functionName: `${stageName}-DefaultFunction`,
            handler: "index.defaultFunction",
        });

        // CreateUserProfile Function
        this.createUserProfile = this.createFunction({
            functionName: `${stageName}-CreateUserProfile`,
            handler: "index.createUserProfile",
            environment: {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                ANTHROPIC_API_KEY_SECRET_NAME: anthropicApiKeySecretName,
                BRAND_SUMMARY_REQUEST_QUEUE_URL: brandSummaryRequestQueue.queueUrl,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.createUserProfile);
        anthropicApiKeySecert.grantRead(this.createUserProfile);
        brandSummaryRequestQueue.grantSendMessages(this.createUserProfile);
    }

    private createFunction(input: CreateFunctionInput): lambda.IFunction {
        const { functionName, handler, environment, layers } = input;
        return new lambda.Function(this, functionName, {
            functionName,
            runtime: lambda.Runtime.NODEJS_22_X,
            handler,
            code: this.lambdaCodeAsset,
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            environment,
            layers,
        });
    }
}
