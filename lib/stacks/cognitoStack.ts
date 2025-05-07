import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import { APP_NAME, StageName } from "../config/config";

interface CognitoStackProps extends AppStackProps {
    websiteDomain: string;
    authDomain: string;
    authCertificateArn: string;
}

export class CognitoStack extends cdk.Stack {
    public readonly userPool: cognito.IUserPool;

    constructor(scope: Construct, id: string, props: CognitoStackProps) {
        super(scope, id, props);

        const { stageName, websiteDomain, authDomain, authCertificateArn } = props;

        // Cognito User Pool
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

        // App Client for the User Pool
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

        // Auth Certificate for custom domain
        const authCertificate = acm.Certificate.fromCertificateArn(
            this,
            `${stageName}-${APP_NAME}-AuthCertificate`,
            authCertificateArn,
        );

        // Custom Domain
        new cognito.UserPoolDomain(this, `${stageName}-${APP_NAME}-CustomDomain`, {
            userPool: this.userPool,
            customDomain: {
                domainName: authDomain,
                certificate: authCertificate,
            },
            managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
        });
    }
}
