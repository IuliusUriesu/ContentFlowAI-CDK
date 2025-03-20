import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { APP_NAME } from "../config/constants";

interface LambdaStackProps extends AppStackProps {
    appDataTable: dynamodb.TableV2;
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

        const { stageName, appDataTable } = props;

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

        // Anthropic SDK Layer
        const anthropicSdkLayerName = `${stageName}-AnthropicSdkLayer`;
        const anthropicSdkLayer = new lambda.LayerVersion(this, anthropicSdkLayerName, {
            code: lambda.Code.fromAsset("../ContentFlowAI-Lambda/layers/anthropic-sdk-layer"),
        });

        // Lambda Functions
        this.defaultFunction = this.createFunction({
            functionName: `${stageName}-DefaultFunction`,
            handler: "index.defaultFunctionHandler",
        });

        this.createUserProfile = this.createFunction({
            functionName: `${stageName}-CreateUserProfile`,
            handler: "index.createUserProfileHandler",
            environment: {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                ANTHROPIC_API_KEY_SECRET_NAME: anthropicApiKeySecretName,
            },
            layers: [anthropicSdkLayer],
        });

        this.exportValue(this.createUserProfile.functionArn);

        appDataTable.grantReadWriteData(this.createUserProfile);
        anthropicApiKeySecert.grantRead(this.createUserProfile);
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
