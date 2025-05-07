export const APP_NAME = "ContentFlowAI";

export const APP_DOMAIN = "content.cleverlayer.com";

export enum StageName {
    DEV = "Dev",
    PROD = "Prod",
}

interface StageProps {
    stageName: StageName;
    env: { account: string; region: string };
    websiteDomain: string;
    apiDomain: string;
    authDomain: string;
    websiteCertificateArn: string;
    authCertificateArn: string;
}

export const stageProps: StageProps[] = [
    {
        stageName: StageName.DEV,
        env: { account: "992382391116", region: "eu-central-1" },
        websiteDomain: `dev.${APP_DOMAIN}`,
        apiDomain: `dev.api.${APP_DOMAIN}`,
        authDomain: `auth.dev.${APP_DOMAIN}`,
        websiteCertificateArn:
            "arn:aws:acm:us-east-1:992382391116:certificate/4e504b0e-0b38-49f1-b30d-c37cb2ca5f73",
        authCertificateArn:
            "arn:aws:acm:us-east-1:992382391116:certificate/0932731a-bb59-4d76-8c43-c7aeeb63ed23",
    },
    {
        stageName: StageName.PROD,
        env: { account: "992382391116", region: "eu-north-1" },
        websiteDomain: `${APP_DOMAIN}`,
        apiDomain: `api.${APP_DOMAIN}`,
        authDomain: `auth.${APP_DOMAIN}`,
        websiteCertificateArn:
            "arn:aws:acm:us-east-1:992382391116:certificate/fe86d8cd-23cc-4b11-ac36-d06e3f011366",
        authCertificateArn:
            "arn:aws:acm:us-east-1:992382391116:certificate/95b1706f-ed15-4dac-b76c-9fdcefdd73c1",
    },
];
