import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { APP_NAME } from "../config/constants";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

interface LambdaStackProps extends AppStackProps {
    appDataTable: dynamodb.TableV2;
    brandSummaryRequestQueue: sqs.IQueue;
    contentRequestQueue: sqs.IQueue;
}

interface CreateFunctionInput {
    functionName: string;
    handler: string;
    environment?: { [key: string]: string };
    layers?: lambda.ILayerVersion[];
    timeout?: cdk.Duration;
}

export class LambdaStack extends cdk.Stack {
    private lambdaCodeAsset: lambda.AssetCode;

    public defaultFunction: lambda.IFunction;
    public createUserProfile: lambda.IFunction;
    public createContentRequest: lambda.IFunction;

    private writeBrandSummary: lambda.IFunction;
    private generateContent: lambda.IFunction;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const { stageName, appDataTable, brandSummaryRequestQueue, contentRequestQueue } = props;

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
            layers: [nodeModulesLayer],
        });

        // CreateUserProfile Function
        this.createUserProfile = this.createFunction({
            functionName: `${stageName}-CreateUserProfile`,
            handler: "index.createUserProfile",
            environment: {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                BRAND_SUMMARY_REQUEST_QUEUE_URL: brandSummaryRequestQueue.queueUrl,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.createUserProfile);
        brandSummaryRequestQueue.grantSendMessages(this.createUserProfile);

        // WriteBrandSummary Function
        this.writeBrandSummary = this.createFunction({
            functionName: `${stageName}-WriteBrandSummary`,
            handler: "index.writeBrandSummary",
            environment: {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                ANTHROPIC_API_KEY_SECRET_NAME: anthropicApiKeySecretName,
            },
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(90),
        });

        appDataTable.grantReadWriteData(this.writeBrandSummary);
        anthropicApiKeySecert.grantRead(this.writeBrandSummary);
        brandSummaryRequestQueue.grantConsumeMessages(this.writeBrandSummary);

        this.writeBrandSummary.addEventSource(
            new SqsEventSource(brandSummaryRequestQueue, {
                batchSize: 1,
                maxBatchingWindow: cdk.Duration.seconds(60),
                reportBatchItemFailures: true,
            }),
        );

        // CreateContentRequest Function
        this.createContentRequest = this.createFunction({
            functionName: `${stageName}-CreateContentRequest`,
            handler: "index.createContentRequest",
            environment: {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                ANTHROPIC_API_KEY_SECRET_NAME: anthropicApiKeySecretName,
                CONTENT_REQUEST_QUEUE_URL: contentRequestQueue.queueUrl,
            },
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(25),
        });

        appDataTable.grantReadWriteData(this.createContentRequest);
        anthropicApiKeySecert.grantRead(this.createContentRequest);
        contentRequestQueue.grantSendMessages(this.createContentRequest);

        // GenerateContent Function
        this.generateContent = this.createFunction({
            functionName: `${stageName}-GenerateContent`,
            handler: "index.generateContent",
            environment: {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                ANTHROPIC_API_KEY_SECRET_NAME: anthropicApiKeySecretName,
            },
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(120),
        });

        appDataTable.grantReadWriteData(this.generateContent);
        anthropicApiKeySecert.grantRead(this.generateContent);
        contentRequestQueue.grantConsumeMessages(this.generateContent);

        this.generateContent.addEventSource(
            new SqsEventSource(contentRequestQueue, {
                batchSize: 1,
                maxBatchingWindow: cdk.Duration.seconds(60),
                reportBatchItemFailures: true,
            }),
        );
    }

    private createFunction(input: CreateFunctionInput): lambda.IFunction {
        const { functionName, handler, environment, layers, timeout } = input;
        return new lambda.Function(this, functionName, {
            functionName,
            runtime: lambda.Runtime.NODEJS_22_X,
            handler,
            code: this.lambdaCodeAsset,
            memorySize: 512,
            environment,
            layers,
            timeout: timeout ?? cdk.Duration.seconds(10),
        });
    }
}
