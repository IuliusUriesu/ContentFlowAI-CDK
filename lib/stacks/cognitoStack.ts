import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/appStackProps";
import { APP_NAME } from "../config/constants";

export class CognitoStack extends cdk.Stack {
    public userPool: cognito.IUserPool;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const userPoolName = `${stageName}-${APP_NAME}-UserPool`;
        this.userPool = new cognito.UserPool(this, userPoolName, {
            userPoolName,
            selfSignUpEnabled: false,
            signInAliases: { username: true, email: true },
            autoVerify: { email: true },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: false,
                },
                fullname: {
                    required: true,
                    mutable: false,
                },
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
        });

        const appClientName = `${stageName}-${APP_NAME}-AppClient`;
        this.userPool.addClient(appClientName, {
            userPoolClientName: appClientName,
            authFlows: {
                userPassword: true,
            },
            idTokenValidity: cdk.Duration.minutes(60),
            accessTokenValidity: cdk.Duration.minutes(60),
            refreshTokenValidity: cdk.Duration.days(5),
            oAuth: {},
        });
    }
}
