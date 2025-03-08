import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/appStackProps";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class LambdaStack extends cdk.Stack {
    public helloFunction: lambda.IFunction;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const helloFunctionName = `${stageName}-HelloFunction`;

        this.helloFunction = new lambda.Function(this, helloFunctionName, {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.handler",
            code: lambda.Code.fromInline(`
               exports.handler = async function(event) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ message: "Hello from the ContentFlowAI API!" })
                    };
               };
            `),
            functionName: helloFunctionName,
        });
    }
}
