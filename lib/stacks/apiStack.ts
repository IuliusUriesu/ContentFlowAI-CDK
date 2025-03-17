import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { AppStackProps } from "../utils/appStackProps";
import { APP_NAME } from "../config/constants";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { StageName } from "../config/stageConfig";

interface ApiStackProps extends AppStackProps {
    apiDomain: string;
    apiCertificate: acm.ICertificate;
    userPool: cognito.IUserPool;
    defaultFunction: lambda.IFunction;
    getAllRequests: lambda.IFunction;
    getRequest: lambda.IFunction;
    getAllGeneratedContent: lambda.IFunction;
    getGeneratedContentPiece: lambda.IFunction;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const { stageName, apiDomain, apiCertificate, userPool } = props;
        const {
            defaultFunction,
            getAllRequests,
            getRequest,
            getAllGeneratedContent,
            getGeneratedContentPiece,
        } = props;

        // Log Group
        const logGroupName = `${stageName}-ApiLogGroup`;
        const logGroup = new logs.LogGroup(this, logGroupName, {
            retention:
                stageName === StageName.PROD
                    ? logs.RetentionDays.THREE_MONTHS
                    : logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Cognito User Pool Authorizer
        const authorizerName = `${stageName}-Authorizer`;
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, authorizerName, {
            cognitoUserPools: [userPool],
        });

        // API Gateway
        const apiName = `${stageName}-${APP_NAME}-API`;
        const api = new apigateway.LambdaRestApi(this, apiName, {
            handler: defaultFunction, // This is used only if proxy is set to true
            proxy: false,
            domainName: {
                domainName: apiDomain,
                certificate: apiCertificate,
            },
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.clf(),
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: stageName === StageName.PROD ? false : true,
                metricsEnabled: true,
                throttlingBurstLimit: 500,
                throttlingRateLimit: 1000,
            },
            defaultMethodOptions: {
                authorizationType: apigateway.AuthorizationType.COGNITO,
                authorizer,
            },
            restApiName: apiName,
        });

        const v1 = api.root.addResource("v1");
        v1.addMethod("GET", new apigateway.LambdaIntegration(defaultFunction)); // GET /v1

        const requests = v1.addResource("requests");
        requests.addMethod("GET", new apigateway.LambdaIntegration(getAllRequests)); // GET /v1/requests
    }
}
