import { APP_DOMAIN } from "./constants";

export enum StageName {
    DEV = "Dev",
    PROD = "Prod",
}

interface StageProps {
    stageName: StageName;
    env: { account: string; region: string };
    websiteDomain: string;
    apiDomain: string;
    websiteCertificateArn: string;
}

export const stageProps: StageProps[] = [
    {
        stageName: StageName.DEV,
        env: { account: "992382391116", region: "eu-central-1" },
        websiteDomain: `dev.${APP_DOMAIN}`,
        apiDomain: `dev.api.${APP_DOMAIN}`,
        websiteCertificateArn:
            "arn:aws:acm:us-east-1:992382391116:certificate/4e504b0e-0b38-49f1-b30d-c37cb2ca5f73",
    },
    {
        stageName: StageName.PROD,
        env: { account: "992382391116", region: "eu-north-1" },
        websiteDomain: `${APP_DOMAIN}`,
        apiDomain: `api.${APP_DOMAIN}`,
        websiteCertificateArn:
            "arn:aws:acm:us-east-1:992382391116:certificate/fe86d8cd-23cc-4b11-ac36-d06e3f011366",
    },
];
