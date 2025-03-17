import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/appStackProps";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface LambdaStackProps extends AppStackProps {
    appDataTable: dynamodb.TableV2;
}

export class LambdaStack extends cdk.Stack {
    private lambdaCodeAsset: lambda.AssetCode;

    public defaultFunction: lambda.IFunction;
    public getAllRequests: lambda.IFunction;
    public getRequest: lambda.IFunction;
    public getAllGeneratedContent: lambda.IFunction;
    public getGeneratedContentPiece: lambda.IFunction;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const { stageName, appDataTable } = props;

        const codePath = "../ContentFlowAI-Lambda/dist";
        this.lambdaCodeAsset = lambda.Code.fromAsset(codePath);

        const environment = {
            APP_DATA_TABLE_NAME: appDataTable.tableName,
        };

        this.defaultFunction = this.createFunction(
            `${stageName}-DefaultFunction`,
            "index.defaultHandler",
            environment,
        );

        this.getAllRequests = this.createFunction(
            `${stageName}-GetAllRequests`,
            "index.defaultHandler",
            environment,
        );

        this.getRequest = this.createFunction(
            `${stageName}-GetRequest`,
            "index.defaultHandler",
            environment,
        );

        this.getAllGeneratedContent = this.createFunction(
            `${stageName}-GetAllGeneratedContent`,
            "index.defaultHandler",
            environment,
        );

        this.getGeneratedContentPiece = this.createFunction(
            `${stageName}-GetGeneratedContentPiece`,
            "index.defaultHandler",
            environment,
        );
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
