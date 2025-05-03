import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as kms from "aws-cdk-lib/aws-kms";

interface LambdaStackProps extends AppStackProps {
    appDataTable: dynamodb.TableV2;
    generatedContentGsiName: string;
    brandSummaryRequestQueue: sqs.IQueue;
    contentRequestQueue: sqs.IQueue;
    userAnthropicApiKeyMasterKey: kms.IKey;
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

    public readonly defaultFunction: lambda.IFunction;
    public readonly createUserProfile: lambda.IFunction;
    public readonly createContentRequest: lambda.IFunction;
    public readonly getAllContentRequests: lambda.IFunction;
    public readonly getContentRequest: lambda.IFunction;
    public readonly getAllGeneratedContent: lambda.IFunction;
    public readonly getGeneratedContentPiece: lambda.IFunction;
    public readonly editGeneratedContentPiece: lambda.IFunction;

    private writeBrandSummary: lambda.IFunction;
    private generateContent: lambda.IFunction;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const {
            stageName,
            appDataTable,
            generatedContentGsiName,
            brandSummaryRequestQueue,
            contentRequestQueue,
            userAnthropicApiKeyMasterKey,
        } = props;

        // The place where the lambda code is
        const codePath = "../ContentFlowAI-Lambda/dist";
        this.lambdaCodeAsset = lambda.Code.fromAsset(codePath);

        // Node Modules Layer
        const nodeModulesLayerName = `${stageName}-NodeModulesLayer`;
        const nodeModulesLayer = new lambda.LayerVersion(this, nodeModulesLayerName, {
            code: lambda.Code.fromAsset("../ContentFlowAI-Lambda/layers/node-modules-layer"),
        });

        // DynamoDB Environment Variables
        const ddbEnv = {
            APP_DATA_TABLE_NAME: appDataTable.tableName,
            GENERATED_CONTENT_GSI_NAME: generatedContentGsiName,
        };

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
                ...ddbEnv,
                BRAND_SUMMARY_REQUEST_QUEUE_URL: brandSummaryRequestQueue.queueUrl,
                USER_ANTHROPIC_API_KEY_MASTER_KEY_ARN: userAnthropicApiKeyMasterKey.keyArn,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.createUserProfile);
        brandSummaryRequestQueue.grantSendMessages(this.createUserProfile);
        userAnthropicApiKeyMasterKey.grantEncrypt(this.createUserProfile);

        // WriteBrandSummary Function
        this.writeBrandSummary = this.createFunction({
            functionName: `${stageName}-WriteBrandSummary`,
            handler: "index.writeBrandSummary",
            environment: {
                ...ddbEnv,
                USER_ANTHROPIC_API_KEY_MASTER_KEY_ARN: userAnthropicApiKeyMasterKey.keyArn,
            },
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(90),
        });

        appDataTable.grantReadWriteData(this.writeBrandSummary);
        brandSummaryRequestQueue.grantConsumeMessages(this.writeBrandSummary);
        userAnthropicApiKeyMasterKey.grantDecrypt(this.writeBrandSummary);

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
                ...ddbEnv,
                CONTENT_REQUEST_QUEUE_URL: contentRequestQueue.queueUrl,
                USER_ANTHROPIC_API_KEY_MASTER_KEY_ARN: userAnthropicApiKeyMasterKey.keyArn,
            },
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(60),
        });

        appDataTable.grantReadWriteData(this.createContentRequest);
        contentRequestQueue.grantSendMessages(this.createContentRequest);
        userAnthropicApiKeyMasterKey.grantDecrypt(this.createContentRequest);

        // GenerateContent Function
        this.generateContent = this.createFunction({
            functionName: `${stageName}-GenerateContent`,
            handler: "index.generateContent",
            environment: {
                ...ddbEnv,
                USER_ANTHROPIC_API_KEY_MASTER_KEY_ARN: userAnthropicApiKeyMasterKey.keyArn,
            },
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(120),
        });

        appDataTable.grantReadWriteData(this.generateContent);
        contentRequestQueue.grantConsumeMessages(this.generateContent);
        userAnthropicApiKeyMasterKey.grantDecrypt(this.generateContent);

        this.generateContent.addEventSource(
            new SqsEventSource(contentRequestQueue, {
                batchSize: 1,
                maxBatchingWindow: cdk.Duration.seconds(60),
                reportBatchItemFailures: true,
            }),
        );

        // GetAllContentRequestsFunction
        this.getAllContentRequests = this.createFunction({
            functionName: `${stageName}-GetAllContentRequests`,
            handler: "index.getAllContentRequests",
            environment: {
                ...ddbEnv,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.getAllContentRequests);

        // GetContentRequest Function
        this.getContentRequest = this.createFunction({
            functionName: `${stageName}-GetContentRequest`,
            handler: "index.getContentRequest",
            environment: {
                ...ddbEnv,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.getContentRequest);

        // GetAllGeneratedContent Function
        this.getAllGeneratedContent = this.createFunction({
            functionName: `${stageName}-GetAllGeneratedContent`,
            handler: "index.getAllGeneratedContent",
            environment: {
                ...ddbEnv,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.getAllGeneratedContent);

        // GetGeneratedContentPiece Function
        this.getGeneratedContentPiece = this.createFunction({
            functionName: `${stageName}-GetGeneratedContentPiece`,
            handler: "index.getGeneratedContentPiece",
            environment: {
                ...ddbEnv,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.getGeneratedContentPiece);

        // EditGeneratedContentPiece Function
        this.editGeneratedContentPiece = this.createFunction({
            functionName: `${stageName}-EditGeneratedContentPiece`,
            handler: "index.editGeneratedContentPiece",
            environment: {
                ...ddbEnv,
            },
            layers: [nodeModulesLayer],
        });

        appDataTable.grantReadWriteData(this.editGeneratedContentPiece);
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
