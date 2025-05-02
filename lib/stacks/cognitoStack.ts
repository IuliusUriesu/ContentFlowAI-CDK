import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import { APP_NAME } from "../config/constants";
import { StageName } from "../config/stageConfig";

interface CognitoStackProps extends AppStackProps {
    websiteDomain: string;
}

export class CognitoStack extends cdk.Stack {
    public userPool: cognito.IUserPool;

    constructor(scope: Construct, id: string, props: CognitoStackProps) {
        super(scope, id, props);

        const { stageName, websiteDomain } = props;

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

        const callbackUrls = [`https://${websiteDomain}/signin-callback`];
        const logoutUrls = [`https://${websiteDomain}`];

        if (stageName === StageName.DEV) {
            callbackUrls.push(`http://localhost:5173/signin-callback`);
            logoutUrls.push(`http://localhost:5173`);
        }

        const appClientName = `${stageName}-${APP_NAME}-AppClient`;
        this.userPool.addClient(appClientName, {
            userPoolClientName: appClientName,
            generateSecret: false,
            authFlows: {
                userPassword: true,
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.PROFILE,
                ],
                callbackUrls,
                logoutUrls,
            },
            enableTokenRevocation: true,
            idTokenValidity: cdk.Duration.hours(1),
            accessTokenValidity: cdk.Duration.hours(1),
            refreshTokenValidity: cdk.Duration.days(5),
            preventUserExistenceErrors: true,
        });
    }
}
