import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { AppStackProps } from '../utils/appStackProps';
import { APP_NAME } from '../config/constants';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

interface ApiStackProps extends AppStackProps {
    helloFunction: lambda.IFunction;
    apiDomain: string;
    apiCertificate: acm.ICertificate;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const { stageName, helloFunction, apiDomain, apiCertificate } = props;

        const apiName = `${stageName}-${APP_NAME}-API`;

        const api = new apigateway.LambdaRestApi(this, apiName, {
            handler: helloFunction, // This is used only if proxy is set to true
            proxy: false,
            domainName: {
                domainName: apiDomain,
                certificate: apiCertificate,
            },
            restApiName: apiName,
        });

        const v1 = api.root.addResource("v1");
        v1.addMethod('GET', new apigateway.LambdaIntegration(helloFunction));   // GET /v1
    }
}