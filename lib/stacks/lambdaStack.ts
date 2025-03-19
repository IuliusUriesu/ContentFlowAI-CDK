import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/appStackProps";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { APP_NAME } from "../config/constants";

interface LambdaStackProps extends AppStackProps {
    appDataTable: dynamodb.TableV2;
}

export class LambdaStack extends cdk.Stack {
    private lambdaCodeAsset: lambda.AssetCode;

    public defaultFunction: lambda.IFunction;
    public updateBrandDetails: lambda.IFunction;

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

        this.defaultFunction = this.createFunction(
            `${stageName}-DefaultFunction`,
            "index.defaultFunctionHandler",
        );

        this.updateBrandDetails = this.createFunction(
            `${stageName}-UpdateBrandDetails`,
            "index.updateBrandDetailsHandler",
            {
                APP_DATA_TABLE_NAME: appDataTable.tableName,
                ANTHROPIC_API_KEY_SECRET_NAME: anthropicApiKeySecretName,
            },
        );

        appDataTable.grantReadWriteData(this.updateBrandDetails);
        anthropicApiKeySecert.grantRead(this.updateBrandDetails);
    }

    private createFunction(
        functionName: string,
        handler: string,
        environment?: { [key: string]: string },
        timeout?: cdk.Duration,
    ): lambda.IFunction {
        return new lambda.Function(this, functionName, {
            functionName,
            runtime: lambda.Runtime.NODEJS_22_X,
            handler,
            code: this.lambdaCodeAsset,
            memorySize: 512,
            environment,
            timeout: timeout === undefined ? cdk.Duration.seconds(5) : timeout,
        });
    }
}
