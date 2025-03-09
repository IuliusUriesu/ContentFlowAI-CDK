import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/appStackProps";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class LambdaStack extends cdk.Stack {
    public defaultFunction: lambda.IFunction;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const codePath = "../ContentFlowAI-Lambda/dist";
        const lambdaCodeAsset = lambda.Code.fromAsset(codePath);

        this.defaultFunction = new lambda.Function(this, `${stageName}-DefaultFunction`, {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.defaultHandler",
            code: lambdaCodeAsset,
        });
    }
}
