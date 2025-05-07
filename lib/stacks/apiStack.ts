import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { AppStackProps } from "../utils/utils";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { APP_NAME, StageName } from "../config/config";

interface ApiStackProps extends AppStackProps {
    apiDomain: string;
    apiCertificate: acm.ICertificate;
    userPool: cognito.IUserPool;
    websiteDomain: string;
    defaultFunction: lambda.IFunction;
    createUserProfile: lambda.IFunction;
    getUserProfile: lambda.IFunction;
    createContentRequest: lambda.IFunction;
    getAllContentRequests: lambda.IFunction;
    getContentRequest: lambda.IFunction;
    getAllGeneratedContent: lambda.IFunction;
    getGeneratedContentPiece: lambda.IFunction;
    editGeneratedContentPiece: lambda.IFunction;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const { stageName, apiDomain, apiCertificate, userPool, websiteDomain } = props;
        const {
            defaultFunction,
            createUserProfile,
            getUserProfile,
            createContentRequest,
            getAllContentRequests,
            getContentRequest,
            getAllGeneratedContent,
            getGeneratedContentPiece,
            editGeneratedContentPiece,
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

        // CORS Allowed Origins
        const allowedOrigins = [`https://${websiteDomain}`];
        if (stageName === StageName.DEV) {
            allowedOrigins.push(`http://localhost:5173`);
        }

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
            defaultCorsPreflightOptions: {
                allowOrigins: allowedOrigins,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
            },
            restApiName: apiName,
        });

        // Resources
        const v1 = api.root.addResource("v1"); // /v1
        const profile = v1.addResource("profile"); // /v1/profile
        const contentRequests = v1.addResource("content-requests"); // /v1/content-requests
        const contentRequestId = contentRequests.addResource("{content-request-id}"); // /v1/content-requests/{content-request-id}
        const contentRequestGeneratedContent = contentRequestId.addResource("generated-content"); // /v1/content-requests/{content-request-id}/generated-content
        const generatedContent = v1.addResource("generated-content"); // /v1/generated-content
        const generatedContentId = generatedContent.addResource("{generated-content-id}"); // /v1/generated-content/{generated-content-id}
        const generatedContentContent = generatedContentId.addResource("content"); // /v1/generated-content/{generated-content-id}/content

        // GET /v1
        v1.addMethod("GET", new apigateway.LambdaIntegration(defaultFunction));

        // POST /v1/profile
        profile.addMethod("POST", new apigateway.LambdaIntegration(createUserProfile));

        // GET /v1/profile
        profile.addMethod("GET", new apigateway.LambdaIntegration(getUserProfile));

        // POST /v1/content-requests
        contentRequests.addMethod("POST", new apigateway.LambdaIntegration(createContentRequest));

        // GET /v1/content-requests
        contentRequests.addMethod("GET", new apigateway.LambdaIntegration(getAllContentRequests));

        // GET /v1/content-requests/{content-request-id}
        contentRequestId.addMethod("GET", new apigateway.LambdaIntegration(getContentRequest));

        // GET /v1/content-requests/{content-request-id}/generated-content
        contentRequestGeneratedContent.addMethod(
            "GET",
            new apigateway.LambdaIntegration(getAllGeneratedContent),
        );

        // GET /v1/generated-content/{generated-content-id}
        generatedContentId.addMethod(
            "GET",
            new apigateway.LambdaIntegration(getGeneratedContentPiece),
        );

        // PATCH /v1/generated-content/{generated-content-id}/content
        generatedContentContent.addMethod(
            "PATCH",
            new apigateway.LambdaIntegration(editGeneratedContentPiece),
        );
    }
}
